import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  // Step 1: Fetch last 30 days of ICU and oxygen data
  const { data, error } = await supabase
    .from("resources")
    .select("date, icu_beds, oxygen_units")
    .order("date", { ascending: true })
    .limit(30);

  if (error || !data) {
    console.error("❌ Supabase fetch error:", error?.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch resource history" },
      { status: 500 }
    );
  }

  const prompt = `
        You are an expert health infrastructure forecasting model.
        Below is the ICU bed and oxygen unit availability over the past few weeks:
        ${JSON.stringify(data, null, 2)}
        Based on this, forecast the next 7 days of demand for both ICU beds and oxygen units. Respond in valid JSON array with the format:
        [
        {
            "date": "2025-09-03",
            "icu_beds": 12,
            "oxygen_units": 55
        },
        ...
        ]
        Respond with ONLY the JSON array. No comments, no explanation.
        `.trim();

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4", // or 'gpt-3.5-turbo'
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    const json = await openaiRes.json();
    const content = json.choices?.[0]?.message?.content ?? "";

    const forecast = JSON.parse(content);

    return NextResponse.json({ success: true, forecast });
  } catch (err) {
    console.error("❌ Forecast error:", err);
    return NextResponse.json(
      { success: false, error: "OpenAI forecast failed" },
      { status: 500 }
    );
  }
}
