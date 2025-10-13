import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { resources } = await req.json();

  const prompt = `You're a government healthcare AI data analyzer.

Given the following hospital data (ICU beds, oxygen units, doctor availability, dialysis machine, gender data, age data, symptoms and weekly remarks) for a city over a selected time period:

${JSON.stringify(resources, null, 2)}

Please respond **in JSON format** with the following structure:
{
  "paragraph": "Overall paragraph summary and trend analysis",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}
`;

  try {
    const complete = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You analyze city-wide hospital resource data and return summaries and insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }, // requires the word "json" in prompt
      }),
    });

    const completion = await complete.json();

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw || "{}");

    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("❌ Insight error:", err);
    return NextResponse.json({ success: false, error: "AI insight error" });
  }
}
