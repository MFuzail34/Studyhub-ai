import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Timer, Clock, Flame, Play, Crown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { startOfDay, startOfWeek, endOfWeek, format, subDays, isSameDay } from "date-fns";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { subscription, isPro } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [todayTime, setTodayTime] = useState(0);
  const [weeklyTime, setWeeklyTime] = useState(0);
  const [streak, setStreak] = useState(0);
  const [chartData, setChartData] = useState<{ day: string; hours: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user!.id)
      .order("date", { ascending: false });

    if (!sessions) { setLoading(false); return; }

    // Today
    const todayStart = startOfDay(now);
    const todaySessions = sessions.filter((s) => new Date(s.date) >= todayStart);
    setTodayTime(todaySessions.reduce((a, s) => a + s.duration, 0));

    // Week
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });
    setWeeklyTime(weekSessions.reduce((a, s) => a + s.duration, 0));

    // Chart — daily hours for current week
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      return day;
    });
    setChartData(
      days.map((d) => ({
        day: format(d, "EEE"),
        hours: parseFloat(
          (weekSessions.filter((s) => isSameDay(new Date(s.date), d)).reduce((a, s) => a + s.duration, 0) / 3600).toFixed(1)
        ),
      }))
    );

    // Streak
    let currentStreak = 0;
    let checkDate = now;
    // Check if studied today
    const studiedToday = sessions.some((s) => isSameDay(new Date(s.date), now));
    if (!studiedToday) checkDate = subDays(now, 1);

    while (true) {
      const studied = sessions.some((s) => isSameDay(new Date(s.date), checkDate));
      if (!studied) break;
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
    setStreak(currentStreak);
    setLoading(false);
  };

  const stats = [
    { title: "Today's Study Time", value: formatDuration(todayTime), icon: Clock, color: "text-primary" },
    { title: "Weekly Study Time", value: formatDuration(weeklyTime), icon: Timer, color: "text-accent" },
    { title: "Study Streak", value: `${streak} day${streak !== 1 ? "s" : ""}`, icon: Flame, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild className="gradient-primary border-0">
          <Link to="/timer">
            <Play className="mr-2 h-4 w-4" />
            Start Study Session
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) =>
          loading ? (
            <Skeleton key={s.title} className="h-32 rounded-xl" />
          ) : (
            <Card key={s.title} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{s.title}</span>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Study Hours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}h`, "Study Time"]}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
