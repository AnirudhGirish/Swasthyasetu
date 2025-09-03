/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ResourceTrends() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const fetchTrendData = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('date, beds_available, icu_beds, oxygen_units, doctors_available')
        .order('date', { ascending: true })

      if (!error && data) {
        // Aggregate daily totals across hospitals
        const totals: { [key: string]: any } = {}

        data.forEach((entry) => {
          const d = entry.date
          if (!totals[d]) {
            totals[d] = {
              date: d,
              beds: 0,
              icu: 0,
              oxygen: 0,
              doctors: 0,
            }
          }
          totals[d].beds += entry.beds_available ?? 0
          totals[d].icu += entry.icu_beds ?? 0
          totals[d].oxygen += entry.oxygen_units ?? 0
          totals[d].doctors += entry.doctors_available ?? 0
        })

        const result = Object.values(totals).sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        setChartData(result)
      }
    }

    fetchTrendData()
  }, [])

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Resource Trends Over Time</h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="beds" stroke="#8884d8" name="Beds" />
          <Line type="monotone" dataKey="icu" stroke="#82ca9d" name="ICU Beds" />
          <Line type="monotone" dataKey="oxygen" stroke="#ff7f0e" name="Oxygen Units" />
          <Line type="monotone" dataKey="doctors" stroke="#d62728" name="Doctors" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
