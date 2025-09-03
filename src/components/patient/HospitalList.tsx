/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getHospitalsInCity } from '@/lib/patient/getHospitalsInCity'
import { getTodayResourceData } from '@/lib/patient/getTodayResourceData'

export default function HospitalList() {
  const [loading, setLoading] = useState(true)
  const [hospitals, setHospitals] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem('user_location')
      if (!stored) return

      const { city } = JSON.parse(stored)

      const hospitalList = await getHospitalsInCity(city)
      const resourceData = await getTodayResourceData()

      const combined = hospitalList.map((h) => {
        const match = resourceData.find((r) => r.hospital_id === h.id)
        return {
          ...h,
          icu_beds: match?.icu_beds ?? 0,
          oxygen_units: match?.oxygen_units ?? 0,
        }
      })

      setHospitals(combined)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white rounded-xl p-6 border shadow">
      <h2 className="text-lg font-semibold mb-6">Hospitals in Your City</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading hospitals...</p>
      ) : hospitals.length === 0 ? (
        <p className="text-sm text-red-500">No hospitals found in your city.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{h.name}</h3>
              <p className="text-sm text-gray-700">
                ICU Beds Available: <span className="font-medium">{h.icu_beds}</span>
              </p>
              <p className="text-sm text-gray-700">
                Oxygen Units Available: <span className="font-medium">{h.oxygen_units}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
