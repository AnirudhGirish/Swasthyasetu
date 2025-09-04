import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { resources } = await req.json();

  const prompt = `You're a government healthcare AI assistant.
Given the following resource(ICU bed, oxygen unit, and doctor availability across hospitals) usage for a city over 2 weeks:

${JSON.stringify(resources, null, 2)}
Give:
1. Any immediate alerts
2. Forecast ICU/Oxygen demand for next 3 days
3. Highlight shortages or trends

Respond in JSON like Example:
{
  "alerts": [ "Low ICU capacity", ... ],
  "forecast": {
    "icu_beds": ["12", "15", "18"],
    "oxygen_units": ["85", "92", "100"]
  }
}
Provide JSON Format:
{
  "alerts": ["..."],
  "forecast": {
    "icu_beds": [day1, day2, day3],
    "oxygen_units": [day1, day2, day3]
  }
}`;

  try {
    const complete = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or 'gpt-3.5-turbo'
        messages: [
          {
            role: "system",
            content: "You analyze hospital resource data and forecast demand.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    const completion = await complete.json();
    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw || "{}");
    return NextResponse.json({ success: true, ...data });
  } catch (err) {
    console.error("❌ Forecast error:", err);
    return NextResponse.json({ success: false, error: "AI forecast error" });
  }
}
