import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { resumeText, jobDescription, pdfBase64, action } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle PDF text extraction using AI
    if (action === "parse-pdf" && pdfBase64) {
      console.log("Extracting text from PDF using AI...");
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "user", 
              content: [
                {
                  type: "text",
                  text: "Extract ALL text content from this resume PDF. Return ONLY the raw text content, preserving the structure (sections, bullet points, etc). Do not add any commentary or formatting - just the extracted text."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${pdfBase64}`
                  }
                }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI PDF extraction error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to extract text from PDF" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const extractedText = data.choices?.[0]?.message?.content;

      if (!extractedText) {
        return new Response(
          JSON.stringify({ error: "Could not extract text from PDF" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("PDF text extracted successfully, length:", extractedText.length);
      return new Response(
        JSON.stringify({ text: extractedText }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle resume analysis
    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing resume against job description...");

    const systemPrompt = `You are an expert career advisor and resume analyst. Analyze the provided resume against the job description and provide a detailed match analysis.

Return a JSON object with the following structure:
{
  "matchScore": <number 0-100>,
  "summary": "<brief 1-2 sentence summary of the match>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<missing skill or gap 1>", "<gap 2>", ...],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "suggestions": ["<actionable suggestion 1>", "<suggestion 2>", ...],
  "keySkillsMatch": [
    {"skill": "<skill name>", "status": "strong" | "partial" | "missing", "note": "<brief explanation>"}
  ]
}

Be specific and actionable. Focus on the most important skills and qualifications from the job description.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `## Resume:\n${resumeText}\n\n## Job Description:\n${jobDescription}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a fallback structure
      analysis = {
        matchScore: 50,
        summary: content.substring(0, 200),
        strengths: [],
        weaknesses: [],
        missingKeywords: [],
        suggestions: ["Unable to parse detailed analysis. Please try again."],
        keySkillsMatch: []
      };
    }

    console.log("Resume analysis complete, match score:", analysis.matchScore);

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in analyze-resume function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
