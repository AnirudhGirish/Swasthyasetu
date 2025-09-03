export async function getForecastFromAI() {
  try {
    const res = await fetch('/api/forecast')
    const json = await res.json()

    if (!res.ok || !json.success) {
      console.error('❌ Forecast fetch error:', json.error)
      return null
    }

    return json.forecast as {
      date: string
      icu_beds: number
      oxygen_units: number
    }[]
  } catch (err) {
    console.error('❌ Forecast fetch failed:', err)
    return null
  }
}
