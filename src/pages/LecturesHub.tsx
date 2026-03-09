import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Play,
  Bookmark,
  BookmarkCheck,
  Clock,
  GraduationCap,
  ArrowLeft,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Video {
  videoId: string;
  title: string;
  channelName: string;
  channelKey?: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
}

const CHANNELS = [
  { key: "all", label: "All Channels", icon: "📚" },
  { key: "physicswallah", label: "Physics Wallah", icon: "⚛️" },
  { key: "nexttoppers", label: "Next Toppers", icon: "🏆" },
  { key: "allstudies", label: "All Studies", icon: "📖" },
];

export default function LecturesHub() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  // Fetch latest videos from channels
  const fetchChannelVideos = useCallback(async (channelKey?: string) => {
    setLoading(true);
    setIsSearchMode(false);
    try {
      const body: Record<string, any> = { mode: "channel" };
      if (channelKey && channelKey !== "all") {
        body.channelKey = channelKey;
      }
      const { data, error } = await supabase.functions.invoke("youtube-search", { body });
      if (error) throw error;
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch lectures. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount & channel change
  useEffect(() => {
    fetchChannelVideos(activeChannel);
  }, [activeChannel, fetchChannelVideos]);

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsSearchMode(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-search", {
        body: { mode: "search", query: `${searchQuery} lecture India CBSE`, maxResults: 20 },
      });
      if (error) throw error;
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to search lectures.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    fetchChannelVideos(activeChannel);
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
        setSavedIds((prev) => { const next = new Set(prev); next.delete(video.videoId); return next; });
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

  // Embedded player view
  if (activeVideo) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={() => setActiveVideo(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Lecture Hub
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
            <p className="text-sm text-muted-foreground mt-1">
              {activeVideo.channelName}
              {activeVideo.publishedAt && (
                <span className="ml-2">· {format(new Date(activeVideo.publishedAt), "MMM d, yyyy")}</span>
              )}
            </p>
          </div>
          <Button
            variant={savedIds.has(activeVideo.videoId) ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleSave(activeVideo)}
            className="shrink-0"
          >
            {savedIds.has(activeVideo.videoId) ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
            {savedIds.has(activeVideo.videoId) ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Lecture Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Latest lectures from top educators — updated automatically
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lectures... e.g. Trigonometry, Motion, Algebra"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" className="gradient-primary border-0">Search</Button>
        {isSearchMode && (
          <Button type="button" variant="outline" onClick={clearSearch}>Clear</Button>
        )}
      </form>

      {/* Channel Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 text-muted-foreground mt-2" />
        {CHANNELS.map((ch) => (
          <Button
            key={ch.key}
            variant={activeChannel === ch.key && !isSearchMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveChannel(ch.key);
              setSearchQuery("");
              setIsSearchMode(false);
            }}
            className={activeChannel === ch.key && !isSearchMode ? "gradient-primary border-0" : ""}
          >
            <span className="mr-1">{ch.icon}</span> {ch.label}
          </Button>
        ))}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No lectures found</p>
          <p className="text-sm">Try a different search or channel filter</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                {video.publishedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(video.publishedAt), "MMM d, yyyy")}
                  </p>
                )}
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
                    {savedIds.has(video.videoId) ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
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
