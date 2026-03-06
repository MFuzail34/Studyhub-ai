import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<{ id: string; subject_name: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");

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
    </div>
  );
}
