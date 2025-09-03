// lib/ai/getAIInsight.ts

export async function getOpenAIInsight(prompt: string): Promise<string | null> {
  try {
      const res = await fetch('/api/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

    const json = await res.json();

    if(!res.ok || !json.success){
        console.error("Insight API error: ", json.error)
        return null
    }

    return json.insight
  } catch (err) {
    console.error("AI insight fetch error:", err);
    return null;
  }
}
