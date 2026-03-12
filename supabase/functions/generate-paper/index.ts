import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, className, board, subject, marks, difficulty, paperType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert Indian school exam paper generator. You create high-quality question papers following ${board} board patterns for Class ${className} ${subject}.

Generate a question paper with the following structure based on the marks (${marks}):

For ${marks} marks paper:
- Section A: MCQs (Multiple Choice Questions) - ${marks <= 20 ? '5' : marks <= 40 ? '10' : '20'} questions, 1 mark each
- Section B: Very Short Answer Questions - ${marks <= 20 ? '3' : marks <= 40 ? '5' : '10'} questions, 2 marks each
- Section C: Short Answer Questions - ${marks <= 20 ? '2' : marks <= 40 ? '4' : '8'} questions, 3 marks each
- Section D: Long Answer / Application Questions - ${marks <= 20 ? '1' : marks <= 40 ? '2' : '4'} questions, 5 marks each

Difficulty level: ${difficulty}
Paper type: ${paperType}

Rules:
1. Questions must be based on the content/topics from the uploaded notes
2. Follow ${board} board exam pattern and style
3. Include marks for each question
4. Include proper instructions at the top
5. Make questions exam-ready and modern
6. For MCQs, provide 4 options (a, b, c, d)
7. Format the output cleanly with proper section headers

Output the paper in clean text format with proper formatting.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: "text",
            text: `Extract the text and topics from this notes/textbook image, then generate a ${marks}-mark ${paperType} question paper for Class ${className} ${subject} (${board} board) at ${difficulty} difficulty level.`,
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Generate a sample ${marks}-mark ${paperType} question paper for Class ${className} ${subject} (${board} board) at ${difficulty} difficulty level. Use common topics from the ${subject} syllabus.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate paper" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const paper = data.choices?.[0]?.message?.content || "Failed to generate paper";

    return new Response(JSON.stringify({ paper }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-paper error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
