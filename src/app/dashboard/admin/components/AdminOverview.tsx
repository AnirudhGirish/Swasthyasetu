/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface City {
  country: string
  state: string
  city: string
}

export default function AdminOverviewPanel() {
  const [city, setCity] = useState<City | null>(null)
  const [hospitalCount, setHospitalCount] = useState<number | null>(null)
  const [icuAvailable, setIcuAvailable] = useState<number | null>(null)
  const [oxygenAvailable, setOxygenAvailable] = useState<number | null>(null)
  const [totalBeds, setTotalBeds] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true)
      const stored = localStorage.getItem('user_location')
      if (!stored) return
      
      const location = JSON.parse(stored) as City
      setCity(location)

      const { data: hospitals, error: hospitalErr } = await supabase
        .from('hospitals')
        .select('department_id')
        .eq('location', location.city)

      if (hospitalErr || !hospitals || hospitals.length === 0) {
        setHospitalCount(0)
        setLoading(false)
        return
      }

      const departmentIds = hospitals.map(h => h.department_id)
      setHospitalCount(departmentIds.length)

      const { data: resourcesToday, error: resourcesErr } = await supabase
        .from('resources')
        .select('total_icu_beds, icu_beds_used, total_oxygen_units, oxygen_units_used, total_beds, beds_used')
        .in('hospital_id', departmentIds)
        .eq('date', today)

      if (resourcesErr || !resourcesToday) {
        setLoading(false)
        return
      }

      const icu = resourcesToday.reduce(
        (sum, r) => sum + (r.total_icu_beds - r.icu_beds_used),
        0
      )
      const oxygen = resourcesToday.reduce(
        (sum, r) => sum + (r.total_oxygen_units - r.oxygen_units_used),
        0
      )
      const beds = resourcesToday.reduce(
        (sum, r) => sum + (r.total_beds - r.beds_used),
        0
      )

      setIcuAvailable(icu)
      setOxygenAvailable(oxygen)
      setTotalBeds(beds)
      setLoading(false)
    }

    fetchOverview()
  }, [today])

  const getAvailabilityColor = (available: number, type: string) => {
    if (available === 0) return 'text-black bg-red-50 border-red-400'
    if (available < 10) return 'text-black bg-orange-50 border-orange-400'
    return 'text-black bg-green-50 border-green-400'
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2d6a4f]/125 to-sky-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">City Overview</h2>
            <p className="text-sky-100 text-sm">Today&apos;s healthcare status - {today}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading city overview...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* City Info */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-6 border border-indigo-400">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-600 text-lg">Monitoring City</h3>
                  <p className="text-2xl font-bold text-black">{city?.city || 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OverviewCard
                title="Total Hospitals"
                value={hospitalCount !== null ? hospitalCount : 'Loading...'}
                icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                className="text-black bg-blue-50 border-blue-400"
              />
              
              <OverviewCard
                title="Available Beds"
                value={totalBeds !== null ? totalBeds : 'Loading...'}
                icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                className={totalBeds !== null ? getAvailabilityColor(totalBeds, 'beds') : 'text-black bg-gray-50 border-gray-200'}
              />
              
              <OverviewCard
                title="ICU Beds Available"
                value={icuAvailable !== null ? icuAvailable : 'Loading...'}
                icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                className={icuAvailable !== null ? getAvailabilityColor(icuAvailable, 'icu') : 'text-gray-600 bg-gray-50 border-gray-200'}
              />
              
              <OverviewCard
                title="Oxygen Units Available"
                value={oxygenAvailable !== null ? oxygenAvailable : 'Loading...'}
                icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                className={oxygenAvailable !== null ? getAvailabilityColor(oxygenAvailable, 'oxygen') : 'text-black bg-gray-50 border-gray-200'}
              />
            </div>

            {/* Status Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">
                  Data reflects real-time availability as of today&apos;s hospital submissions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OverviewCard({
  title,
  value,
  icon,
  className = 'text-black bg-gray-50 border-gray-200'
}: {
  title: string
  value: string | number
  icon: string
  className?: string
}) {
  return (
    <div className={`p-6 rounded-2xl border-2 ${className} transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-md">{title}</h3>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center opacity-70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}