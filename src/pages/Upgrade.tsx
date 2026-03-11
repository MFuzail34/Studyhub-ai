import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Crown, ArrowRight, Smartphone } from "lucide-react";

export default function Upgrade() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "upi" | "confirm">("form");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");

  // Confirmation state
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const amount = planType === "monthly" ? 99 : 799;
  const UPI_ID = "studifyhub@upi";

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !upiId.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("payment_submissions")
      .insert({
        user_id: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        upi_id: upiId.trim(),
        plan_type: planType,
        amount,
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    setSubmissionId(data.id);
    setStep("upi");
    setLoading(false);

    // Open UPI app
    const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("StudifyHub")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`StudifyHub Pro ${planType} plan`)}`;
    window.location.href = upiLink;
  };

  const handleSubmitConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId || !transactionId.trim()) {
      toast({ title: "Please enter your Transaction ID", variant: "destructive" });
      return;
    }

    setUploading(true);
    let screenshotUrl: string | null = null;

    if (screenshotFile && user) {
      const fileExt = screenshotFile.name.split(".").pop();
      const filePath = `${user.id}/${submissionId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-screenshots")
        .upload(filePath, screenshotFile, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(filePath);
        screenshotUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("payment_submissions")
      .update({
        transaction_id: transactionId.trim(),
        screenshot_url: screenshotUrl,
      })
      .eq("id", submissionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    setUploading(false);
    toast({
      title: "Payment submitted! 🎉",
      description: "Your payment is under review. You'll be upgraded to Pro once approved.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Crown className="h-4 w-4" /> Upgrade to Pro
        </div>
        <h1 className="text-2xl font-bold">Unlock All Features</h1>
        <p className="text-muted-foreground mt-2">Complete the payment to activate your Pro plan.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {["Fill Details", "UPI Payment", "Confirm"].map((s, i) => {
          const stepIndex = step === "form" ? 0 : step === "upi" ? 1 : 2;
          const isActive = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive ? "gradient-primary text-primary-foreground" : isDone ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {isDone ? "✓" : i + 1}
              </div>
              <span className={`hidden sm:inline ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Payment Form */}
      {step === "form" && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" maxLength={10} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input id="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" required />
              </div>
              <div className="space-y-3">
                <Label>Select Plan</Label>
                <RadioGroup value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Monthly — ₹99/month</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border-2 border-primary p-4 cursor-pointer hover:bg-muted/50 relative">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                      <span className="font-semibold">Yearly — ₹799/year</span>
                      <span className="text-xs text-primary ml-2 font-medium">Save 33%</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Amount to pay</p>
                <p className="text-3xl font-bold mt-1">₹{amount}</p>
              </div>

              <Button type="submit" className="w-full gradient-primary border-0" size="lg" disabled={loading}>
                {loading ? "Processing…" : "Proceed to Payment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: UPI Instructions */}
      {step === "upi" && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" /> Complete UPI Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
              <p className="text-sm font-medium">Pay to: <span className="text-primary">{UPI_ID}</span></p>
              <p className="text-sm font-medium">Amount: <span className="text-primary font-bold">₹{amount}</span></p>
              <p className="text-sm font-medium">Plan: <span className="text-primary capitalize">{planType}</span></p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>A UPI payment request should have opened in your UPI app.</li>
                <li>If it didn't open, manually pay <strong>₹{amount}</strong> to <strong>{UPI_ID}</strong>.</li>
                <li>Complete the payment and note the Transaction ID.</li>
                <li>Come back here and confirm your payment.</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("StudifyHub")}&am=${amount}&cu=INR&tn=${encodeURIComponent(`StudifyHub Pro ${planType} plan`)}`;
                window.location.href = upiLink;
              }}>
                Retry UPI Payment
              </Button>
              <Button className="flex-1 gradient-primary border-0" onClick={() => setStep("confirm")}>
                I've Paid <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirm" && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Confirm Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConfirmation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="txnId">Transaction ID / UTR Number</Label>
                <Input id="txnId" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter your UPI transaction ID" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">Payment Screenshot (optional)</Label>
                <Input id="screenshot" type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground">Upload a screenshot of your payment confirmation for faster approval.</p>
              </div>

              <Button type="submit" className="w-full gradient-primary border-0" size="lg" disabled={uploading}>
                {uploading ? "Submitting…" : "Submit Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
