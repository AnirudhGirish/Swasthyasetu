export async function getForecastFromAI(resources:string) {
  try {
    const res = await fetch('/api/forecast', 
      {method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resources })
    })


    const json = await res.json()

    if (!res.ok || !json.success) {
      console.error('❌ Forecast fetch error:', json.error)
      return null
    }

     return json;
  } catch (err) {
    console.error('❌ Forecast fetch failed:', err)
    return null
  }
}
