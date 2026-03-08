import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Trash2, Clock, BookmarkCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SavedLecture {
  id: string;
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  duration: string | null;
  created_at: string;
}

export default function MyLectures() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<SavedLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_lectures")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data) setLectures(data);
        if (error) console.error(error);
        setLoading(false);
      });
  }, [user]);

  const removeLecture = async (id: string, videoId: string) => {
    const { error } = await supabase.from("saved_lectures").delete().eq("id", id);
    if (!error) {
      setLectures((prev) => prev.filter((l) => l.id !== id));
      if (activeVideoId === videoId) setActiveVideoId(null);
      toast.success("Lecture removed");
    }
  };

  if (activeVideoId) {
    const lecture = lectures.find((l) => l.video_id === activeVideoId);
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={() => setActiveVideoId(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to My Lectures
        </Button>
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
            title={lecture?.title || ""}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        {lecture && (
          <div>
            <h2 className="text-xl font-bold">{lecture.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{lecture.channel_name}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookmarkCheck className="h-6 w-6 text-primary" />
          My Lectures
        </h1>
        <p className="text-sm text-muted-foreground">Your saved lectures for later viewing</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : lectures.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No saved lectures yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse the Lectures Hub and save lectures to watch later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lectures.map((lecture) => (
            <Card
              key={lecture.id}
              className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div
                className="relative aspect-video cursor-pointer"
                onClick={() => setActiveVideoId(lecture.video_id)}
              >
                <img
                  src={lecture.thumbnail_url}
                  alt={lecture.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                  <Play className="h-12 w-12 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
                {lecture.duration && (
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 right-2 bg-foreground/80 text-background text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {lecture.duration}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3
                  className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setActiveVideoId(lecture.video_id)}
                >
                  {lecture.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{lecture.channel_name}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary border-0"
                    onClick={() => setActiveVideoId(lecture.video_id)}
                  >
                    <Play className="h-3 w-3 mr-1" /> Watch
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeLecture(lecture.id, lecture.video_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
