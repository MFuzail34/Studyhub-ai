import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<{ id: string; subject_name: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("*").eq("user_id", user!.id);
    if (data) setSubjects(data);
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const { error } = await supabase.from("subjects").insert({ user_id: user!.id, subject_name: newSubject.trim() });
    if (!error) {
      setNewSubject("");
      fetchSubjects();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteSubject = async (id: string) => {
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete all user data from all tables
      await Promise.all([
        supabase.from("study_sessions").delete().eq("user_id", user.id),
        supabase.from("saved_lectures").delete().eq("user_id", user.id),
        supabase.from("subjects").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("user_id", user.id),
      ]);

      // Sign out (account removal from auth requires admin/edge function)
      await signOut();
      toast({ title: "Account data deleted", description: "All your data has been permanently removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete account data. Please try again.", variant: "destructive" });
    }
    setDeleting(false);
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Email</span>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Member since</span>
            <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
            />
            <Button onClick={addSubject} size="icon" className="gradient-primary border-0 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subjects yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                  <span className="text-sm font-medium">{s.subject_name}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteSubject(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md border-destructive/20">
        <CardHeader>
          <CardTitle className="text-lg text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data including study sessions, saved lectures, and subjects. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting…" : "Delete My Account & Data"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your data including study sessions, saved lectures, subjects, and your profile. This action is irreversible and complies with your right to data erasure under the DPDPA 2023.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
