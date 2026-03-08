import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Play,
  Bookmark,
  BookmarkCheck,
  Clock,
  X,
  GraduationCap,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Video {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
}

const CLASSES = [
  { id: "8", label: "Class 8", icon: "📘" },
  { id: "9", label: "Class 9", icon: "📗" },
  { id: "10", label: "Class 10", icon: "📕" },
];

const SUBJECTS = ["Mathematics", "Science", "English", "Social Science"];

export default function LecturesHub() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Filter states
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Load saved lecture IDs
  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_lectures")
      .select("video_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((d) => d.video_id)));
      });
  }, [user]);

  const fetchVideos = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("youtube-search", {
          body: { query, maxResults: 12 },
        });
        if (error) throw error;
        setVideos(data.videos || []);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to fetch lectures. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-fetch when class + subject selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      const query = `Class ${selectedClass} ${selectedSubject} lecture India CBSE`;
      fetchVideos(query);
    }
  }, [selectedClass, selectedSubject, fetchVideos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const prefix =
      filterClass !== "all" ? `Class ${filterClass} ` : "";
    const subjectPrefix =
      filterSubject !== "all" ? `${filterSubject} ` : "";
    fetchVideos(`${prefix}${subjectPrefix}${searchQuery} lecture India CBSE`);
  };

  const toggleSave = async (video: Video) => {
    if (!user) return;
    const isSaved = savedIds.has(video.videoId);

    if (isSaved) {
      const { error } = await supabase
        .from("saved_lectures")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", video.videoId);
      if (!error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(video.videoId);
          return next;
        });
        toast.success("Removed from saved lectures");
      }
    } else {
      const { error } = await supabase.from("saved_lectures").insert({
        user_id: user.id,
        video_id: video.videoId,
        title: video.title,
        channel_name: video.channelName,
        thumbnail_url: video.thumbnailUrl,
        duration: video.duration,
      });
      if (!error) {
        setSavedIds((prev) => new Set(prev).add(video.videoId));
        toast.success("Saved to My Lectures");
      }
    }
  };

  const handleBack = () => {
    if (activeVideo) {
      setActiveVideo(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
      setVideos([]);
    } else if (selectedClass) {
      setSelectedClass(null);
    }
  };

  // Embedded player view
  if (activeVideo) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to lectures
        </Button>
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{activeVideo.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{activeVideo.channelName}</p>
          </div>
          <Button
            variant={savedIds.has(activeVideo.videoId) ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleSave(activeVideo)}
            className="shrink-0"
          >
            {savedIds.has(activeVideo.videoId) ? (
              <BookmarkCheck className="h-4 w-4 mr-1" />
            ) : (
              <Bookmark className="h-4 w-4 mr-1" />
            )}
            {savedIds.has(activeVideo.videoId) ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {(selectedClass || selectedSubject) && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Lectures Hub
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedClass && selectedSubject
                ? `Class ${selectedClass} · ${selectedSubject}`
                : selectedClass
                ? `Class ${selectedClass} · Select a subject`
                : "Select your class to get started"}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lectures... e.g. Trigonometry, Motion chapter"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="gradient-primary border-0">
          Search
        </Button>
      </form>

      {/* Class Selection */}
      {!selectedClass && videos.length === 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {CLASSES.map((cls) => (
            <Card
              key={cls.id}
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => setSelectedClass(cls.id)}
            >
              <CardContent className="p-8 text-center">
                <span className="text-5xl mb-4 block">{cls.icon}</span>
                <h3 className="text-xl font-bold">{cls.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">CBSE Curriculum</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subject Selection */}
      {selectedClass && !selectedSubject && videos.length === 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBJECTS.map((subject) => (
            <Card
              key={subject}
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => setSelectedSubject(subject)}
            >
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-bold">{subject}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        videos.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card
                key={video.videoId}
                className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={() => setActiveVideo(video)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                    <Play className="h-12 w-12 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  {video.duration && (
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 right-2 bg-foreground/80 text-background text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setActiveVideo(video)}
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{video.channelName}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 gradient-primary border-0"
                      onClick={() => setActiveVideo(video)}
                    >
                      <Play className="h-3 w-3 mr-1" /> Watch
                    </Button>
                    <Button
                      size="sm"
                      variant={savedIds.has(video.videoId) ? "secondary" : "outline"}
                      onClick={() => toggleSave(video)}
                    >
                      {savedIds.has(video.videoId) ? (
                        <BookmarkCheck className="h-3 w-3" />
                      ) : (
                        <Bookmark className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
