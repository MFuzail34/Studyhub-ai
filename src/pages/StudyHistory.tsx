import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";

type Filter = "today" | "week" | "month";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function StudyHistory() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("week");

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, filter]);

  const fetchSessions = async () => {
    setLoading(true);
    const now = new Date();
    let from: Date;
    if (filter === "today") from = startOfDay(now);
    else if (filter === "week") from = startOfWeek(now, { weekStartsOn: 1 });
    else from = startOfMonth(now);

    const { data } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .gte("date", from.toISOString())
      .order("date", { ascending: false });

    setSessions(data || []);
    setLoading(false);
  };

  const filters: { label: string; value: Filter }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Study History</h1>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            className={filter === f.value ? "gradient-primary border-0" : ""}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No study sessions found for this period.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{format(new Date(s.date), "MMM d, yyyy h:mm a")}</TableCell>
                    <TableCell>{s.subject}</TableCell>
                    <TableCell className="text-right font-medium">{formatDuration(s.duration)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
