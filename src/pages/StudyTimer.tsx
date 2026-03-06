import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, Plus } from "lucide-react";

const POMODORO_DURATION = 25 * 60; // 25 minutes

export default function StudyTimer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<{ id: string; subject_name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setShowAddSubject(false);
      fetchSubjects();
      toast({ title: "Subject added" });
    }
  };

  const start = () => {
    if (!selectedSubject) {
      toast({ title: "Select a subject first", variant: "destructive" });
      return;
    }
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const stop = useCallback(async () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (elapsed > 0 && selectedSubject) {
      const subjectName = subjects.find((s) => s.id === selectedSubject)?.subject_name || selectedSubject;
      const { error } = await supabase.from("study_sessions").insert({
        user_id: user!.id,
        subject: subjectName,
        duration: elapsed,
      });
      if (!error) {
        toast({ title: "Session saved!", description: `${Math.floor(elapsed / 60)}m of ${subjectName}` });
      }
    }
    setTimeLeft(POMODORO_DURATION);
    setElapsed(0);
  }, [elapsed, selectedSubject, subjects, user, toast]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            stop();
            return 0;
          }
          return t - 1;
        });
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, stop]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Study Timer</h1>

      {/* Subject selector */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          <label className="text-sm font-medium">Subject</label>
          <div className="flex gap-2">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setShowAddSubject(!showAddSubject)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showAddSubject && (
            <div className="flex gap-2">
              <Input placeholder="New subject name" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} />
              <Button onClick={addSubject} size="sm">Add</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-10 flex flex-col items-center">
          <div className="relative h-52 w-52 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke="url(#timerGradient)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={2 * Math.PI * 90 * (1 - timeLeft / POMODORO_DURATION)}
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(250 76% 58%)" />
                  <stop offset="100%" stopColor="hsl(210 80% 56%)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-5xl font-bold tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <div className="flex gap-3 mt-8">
            {!isRunning ? (
              <Button onClick={start} className="gradient-primary border-0 px-8" size="lg">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            ) : (
              <Button onClick={pause} variant="outline" size="lg" className="px-8">
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            )}
            <Button onClick={stop} variant="destructive" size="lg" disabled={elapsed === 0}>
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>

          {elapsed > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Elapsed: {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
