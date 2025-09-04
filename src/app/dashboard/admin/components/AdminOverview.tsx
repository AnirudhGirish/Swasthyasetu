'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface City {
  country: string
  state: string
  city: string
}

export default function AdminDashboard() {
  const [city, setCity] = useState<City | null>(null)
  const [hospitalCount, setHospitalCount] = useState(0)
  const [icuAvailable, setIcuAvailable] = useState(0)
  const [oxygenAvailable, setOxygenAvailable] = useState(0)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  useEffect(() => {
    const fetchOverview = async () => {
      const stored = localStorage.getItem('user_location')
      if (!stored) return
      const location = JSON.parse(stored) as City
      setCity(location)

      

      const { data: hospitals } = await supabase
        .from('hospitals')
        .select('department_id')
        .eq('location', location.city)

      const departmentIds = hospitals?.map(h => h.department_id) || []
      setHospitalCount(departmentIds.length)

      if (departmentIds.length === 0) return

      const { data: resourcesToday } = await supabase
        .from('resources')
        .select('total_icu_beds, icu_beds_used, total_oxygen_units, oxygen_units_used')
        .in('hospital_id', departmentIds)
        .eq('date', today)

      const icu = resourcesToday?.reduce(
        (sum, r) => sum + (r.total_icu_beds - r.icu_beds_used), 0)

      const oxygen = resourcesToday?.reduce(
        (sum, r) => sum + (r.total_oxygen_units - r.oxygen_units_used), 0)

      setIcuAvailable(icu || 0)
      setOxygenAvailable(oxygen || 0)
    }

    fetchOverview()
  }, [today])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">{today}&apos;s Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* City */}
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold">City</h2>
          <p className="text-gray-700 mt-2">{city?.city ?? 'Loading...'}</p>
        </div>

        {/* Total Hospitals */}
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold">Total Hospitals</h2>
          <p className="text-2xl mt-2 text-blue-600 font-bold">{hospitalCount}</p>
        </div>

        {/* ICU Beds Available */}
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold">ICU Beds Available</h2>
          <p className="text-2xl mt-2 text-green-600 font-bold">{icuAvailable}</p>
        </div>

        {/* Oxygen Units Available */}
        <div className="bg-white shadow-md rounded-xl p-6 border">
          <h2 className="text-lg font-semibold">Oxygen Units Available</h2>
          <p className="text-2xl mt-2 text-red-600 font-bold">{oxygenAvailable}</p>
        </div>
      </div>
    </div>
  )
}
