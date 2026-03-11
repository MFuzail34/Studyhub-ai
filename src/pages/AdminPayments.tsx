import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, ExternalLink, Shield } from "lucide-react";
import { format } from "date-fns";
import { addMonths, addYears } from "date-fns";

interface PaymentSubmission {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  upi_id: string;
  plan_type: string;
  amount: number;
  transaction_id: string | null;
  screenshot_url: string | null;
  status: string;
  created_at: string;
}

export default function AdminPayments() {
  const { user } = useAuth();
  const { isAdmin } = useSubscription();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchSubmissions();
  }, [isAdmin]);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("payment_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setSubmissions(data as PaymentSubmission[]);
    setLoading(false);
  };

  const handleAction = async (submission: PaymentSubmission, action: "approved" | "rejected") => {
    if (!user) return;
    setProcessing(submission.id);

    // Update submission status
    const { error: updateError } = await supabase
      .from("payment_submissions")
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", submission.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
      setProcessing(null);
      return;
    }

    // If approved, create/update subscription
    if (action === "approved") {
      const now = new Date();
      const expiresAt = submission.plan_type === "monthly" ? addMonths(now, 1) : addYears(now, 1);

      // Upsert subscription
      const { error: subError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: submission.user_id,
          plan_type: submission.plan_type,
          status: "active",
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          payment_id: submission.id,
        }, { onConflict: "user_id" });

      if (subError) {
        toast({ title: "Error creating subscription", description: subError.message, variant: "destructive" });
        setProcessing(null);
        return;
      }
    }

    toast({
      title: action === "approved" ? "Payment Approved ✅" : "Payment Rejected",
      description: action === "approved" ? `${submission.full_name} is now a Pro member!` : `Payment by ${submission.full_name} was rejected.`,
    });

    setProcessing(null);
    fetchSubmissions();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    if (status === "approved") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
    return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and manage student payment submissions.</p>
        </div>
        <Badge className="gradient-primary border-0 text-primary-foreground">
          <Shield className="h-3 w-3 mr-1" /> Admin
        </Badge>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No payment submissions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s.id} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{s.full_name}</h3>
                      {statusBadge(s.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <p><span className="text-muted-foreground">Email:</span> {s.email}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {s.phone}</p>
                      <p><span className="text-muted-foreground">UPI ID:</span> {s.upi_id}</p>
                      <p><span className="text-muted-foreground">Plan:</span> <span className="capitalize font-medium">{s.plan_type}</span></p>
                      <p><span className="text-muted-foreground">Amount:</span> <span className="font-bold">₹{s.amount}</span></p>
                      <p><span className="text-muted-foreground">Date:</span> {format(new Date(s.created_at), "dd MMM yyyy, hh:mm a")}</p>
                      {s.transaction_id && <p><span className="text-muted-foreground">Transaction ID:</span> <span className="font-mono text-xs">{s.transaction_id}</span></p>}
                    </div>
                    {s.screenshot_url && (
                      <a href={s.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> View Screenshot
                      </a>
                    )}
                  </div>

                  {s.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAction(s, "approved")}
                        disabled={processing === s.id}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction(s, "rejected")}
                        disabled={processing === s.id}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
