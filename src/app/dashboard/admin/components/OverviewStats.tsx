'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function OverviewStats() {
  const [summary, setSummary] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    hospitalCount: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0]

      const now = new Date()
      const lastWeek = new Date(now)
      lastWeek.setDate(now.getDate() - 7)
      const lastMonth = new Date(now)
      lastMonth.setDate(now.getDate() - 30)

      const [todayRes, weekRes, monthRes, hospitalRes] = await Promise.all([
        supabase
          .from('resources')
          .select('id', { count: 'exact', head: true })
          .eq('date', today),

        supabase
          .from('resources')
          .select('id', { count: 'exact', head: true })
          .gte('date', lastWeek.toISOString().split('T')[0]),

        supabase
          .from('resources')
          .select('id', { count: 'exact', head: true })
          .gte('date', lastMonth.toISOString().split('T')[0]),

        supabase
          .from('hospitals')
          .select('id', { count: 'exact', head: true }),
      ])

      setSummary({
        todayCount: todayRes.count || 0,
        weekCount: weekRes.count || 0,
        monthCount: monthRes.count || 0,
        hospitalCount: hospitalRes.count || 0,
      })
    }

    fetchStats()
  }, [])

  const { todayCount, weekCount, monthCount, hospitalCount } = summary

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <StatBox label="Hospitals Submitted Today" value={todayCount} />
      <StatBox label="Past 7 Days" value={weekCount} />
      <StatBox label="Past 30 Days" value={monthCount} />
      <StatBox
        label="Hospitals Missing Today"
        value={Math.max(hospitalCount - todayCount, 0)}
      />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded p-4 shadow-sm text-center">
      <div className="text-xl font-bold text-blue-700">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
