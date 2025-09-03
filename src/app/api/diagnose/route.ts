// src/app/api/diagnose/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { symptoms } = await req.json()

  const prompt = `
You are a medical assistant. A patient describes: "${symptoms}".
Return a JSON object like: {"condition": "...", "urgency": "Low | Moderate | High"}.
Only return raw JSON. Do not include any other text.
`.trim()

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })

  const json = await openaiRes.json()
  // console.log('📦 Full OpenAI Response:', JSON.stringify(json, null, 2))

  if (!openaiRes.ok || !json.choices || !json.choices[0]?.message?.content) {
    return NextResponse.json(
      {
        success: false,
        error: json?.error?.message || 'OpenAI API returned invalid response',
      },
      { status: 500 }
    )
  }

  try {
    const content = json.choices[0].message.content
    const diagnosis = JSON.parse(content)
    return NextResponse.json({ success: true, diagnosis })
  } catch (err) {
    console.log('❌ JSON parse error:', err)
    return NextResponse.json(
      { success: false, error: 'Invalid JSON response from OpenAI' },
      { status: 500 }
    )
  }
}
