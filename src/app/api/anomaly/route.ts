import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { resources } = await req.json();

  const prompt = `You are a government healthcare AI assistant performing anomaly detection on hospital resource data.

The input is daily submissions from multiple hospitals in a city over the last 14 days.
Each object contains:
- hospital_name
- date
- beds, icu, oxygen, dialysis used vs total
- doctors, nurses, staff-to-patient ratio
- male/female/age group breakdowns
- common_symptoms
- weekly_diagnosis_summary

JSON data:
${JSON.stringify(resources, null, 2)}

Analyze this data and return:
1. A **brief paragraph** describing overall city-wide anomalies
2. A **list of anomalies**, each mentioning:
   - The hospital name
   - The date
   - The specific issue (e.g. mismatch, spike, low staff, etc.)

Only return JSON using this format:
{
  "paragraph": "City-wide summary of anomalies...",
  "anomalies": [
    "United Hospital on 2025-09-19: Gender total mismatch (22M + 12F != 30 total)",
    "Metro Care on 2025-09-18: ICU usage exceeded total reported capacity",
    "Narayana Hospital on 2025-09-17: Missing staff data"
  ]
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
            content: "You detect hospital-level anomalies in city-wide hospital data.",
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
    console.error("❌ Anomaly detection error:", err);
    return NextResponse.json({ success: false, error: "AI anomaly detection error" });
  }
}
