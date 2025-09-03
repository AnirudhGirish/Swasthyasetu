'use client'

import { getForecastFromAI } from '@/lib/ai/getForecastFromAi';
import { useEffect, useState } from 'react'

export default function ForecastCard() {
  const [forecast, setForecast] = useState<
    { date: string; icu_beds: number; oxygen_units: number }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadForecast = async () => {
      const data = await getForecastFromAI()
      if (data) setForecast(data)
      setLoading(false)
    }
    loadForecast()
  }, [])

  return (
    <div className="bg-white rounded-xl p-6 shadow border w-full max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">🔮 7-Day Resource Forecast</h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading forecast...</p>
      ) : forecast.length === 0 ? (
        <p className="text-red-600 text-sm">No forecast data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">ICU Beds</th>
                <th className="px-4 py-2 border">Oxygen Units</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((entry) => (
                <tr key={entry.date} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{entry.date}</td>
                  <td className="px-4 py-2 border">{entry.icu_beds}</td>
                  <td className="px-4 py-2 border">{entry.oxygen_units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
