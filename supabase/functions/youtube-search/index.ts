import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated channel list
const CHANNELS: Record<string, { name: string; id: string }> = {
  physicswallah: { name: "Physics Wallah", id: "UCiGyWN6DEbnj2alu7iapuKQ" },
  nexttoppers: { name: "Next Toppers", id: "UC6k0UlWg59GNng1T-3X71DA" },
  allstudies: { name: "All Studies", id: "UC7raRsx4ojx3cyXT3x9-PuQ" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { query, maxResults = 12, mode = "search", channelKey } = body;

    // Mode: "channel" — fetch latest videos from specific channels
    if (mode === "channel") {
      const channelKeys = channelKey
        ? [channelKey]
        : Object.keys(CHANNELS);

      const allVideos: any[] = [];

      for (const key of channelKeys) {
        const channel = CHANNELS[key];
        if (!channel) continue;

        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("channelId", channel.id);
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("order", "date");
        searchUrl.searchParams.set("maxResults", "20");
        searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

        const searchRes = await fetch(searchUrl.toString());
        const searchData = await searchRes.json();

        if (!searchRes.ok) {
          console.error(`YouTube channel error for ${key}:`, searchData);
          continue;
        }

        const videoIds = searchData.items?.map((item: any) => item.id.videoId).filter(Boolean).join(",");
        if (!videoIds) continue;

        const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        detailsUrl.searchParams.set("part", "contentDetails,snippet");
        detailsUrl.searchParams.set("id", videoIds);
        detailsUrl.searchParams.set("key", YOUTUBE_API_KEY);

        const detailsRes = await fetch(detailsUrl.toString());
        const detailsData = await detailsRes.json();

        const videos = detailsData.items?.map((item: any) => ({
          videoId: item.id,
          title: item.snippet.title,
          channelName: item.snippet.channelTitle,
          channelKey: key,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          duration: parseDuration(item.contentDetails.duration),
          publishedAt: item.snippet.publishedAt,
        })) || [];

        allVideos.push(...videos);
      }

      // Sort by upload date descending
      allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      return new Response(JSON.stringify({ videos: allVideos }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode: "search" — keyword search (existing behavior)
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(Math.min(maxResults, 20)));
    searchUrl.searchParams.set("relevanceLanguage", "en");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      console.error("YouTube search error:", searchData);
      return new Response(JSON.stringify({ error: "YouTube API error", details: searchData.error?.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(",");
    if (!videoIds) {
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "contentDetails,snippet");
    detailsUrl.searchParams.set("id", videoIds);
    detailsUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = await detailsRes.json();

    const videos = detailsData.items?.map((item: any) => ({
      videoId: item.id,
      title: item.snippet.title,
      channelName: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      duration: parseDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    })) || [];

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
