import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { symptomsData } = await req.json()

  const prompt = `You are a government healthcare AI assistant analyzing symptoms and weekly hospital diagnoses.

Below is city-wide hospital data over the past few days. Each record includes:
- hospital_name
- date
- common_symptoms (array)
- weekly_diagnosis_summary (text summary of major cases)

Your task:
1. Identify city-wide symptom and diagnosis **trends** (e.g., more fever cases, infection spike).
2. Point out **any unusual shifts** or patterns (e.g., sudden rise in 'chest pain' or multiple hospitals reporting same symptom).
3. Highlight emerging illness clusters or public health concerns.

Only return a JSON in this format:
{
  "summary": "A short paragraph summarizing trends",
  "highlights": [
    "Fever and throat infection increased across 3 hospitals.",
    "Metro Care and Lifeline Hospital both report suspected dengue cases.",
    "Kalaburagi saw rising gastrointestinal symptoms starting 2025-09-17."
  ]
}

Here is the input:
${JSON.stringify(symptomsData, null, 2)}
`

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
            content: "You analyze symptoms and weekly hospital diagnosis summaries for trend detection.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    const completion = await complete.json()
    const raw = completion.choices?.[0]?.message?.content ?? "{}"
    const data = JSON.parse(raw || "{}")

    return NextResponse.json({ success: true, ...data })
  } catch (err) {
    console.error("❌ Symptom analysis error:", err)
    return NextResponse.json({ success: false, error: "Symptom AI analysis failed" })
  }
}
