// src/app/api/insights/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ success: false, error: "Missing prompt" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a healthcare analytics AI assistant. Respond with clear and concise insights based on structured hospital resource data provided by the user.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
      }),
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content returned from OpenAI");

    return NextResponse.json({ success: true, insight: content });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate insights" }, { status: 500 });
  }
}
