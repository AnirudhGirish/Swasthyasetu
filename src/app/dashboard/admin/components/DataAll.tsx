/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
// =============================
// 1. Trend Chart Data (last 14 days)
// =============================

export async function fetchTrendData(city: string) {
  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("department_id, location")

  const departmentIds = (hospitals || [])
    .filter((h) => {
      try {
        return h.location === city
      } catch {
        return false
      }
    })
    .map((h) => h.department_id)

  const { data: resources } = await supabase
    .from("resources")
    .select("date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units")
    .in("hospital_id", departmentIds)
    .order("date", { ascending: true })

  return resources
}

// =============================
// 2. Export All Submission Data as CSV
// =============================

export async function exportAllResourceDataAsCSV() {
  const { data, error } = await supabase.from("resources").select("*")
  if (error || !data) return null

  const headers = Object.keys(data[0])
  const csvRows = data.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
  )
  const csv = [headers.join(","), ...csvRows].join("\n")

  const blob = new Blob([csv], { type: "text/csv" })
  return URL.createObjectURL(blob)
}

// =============================
// 3. Registered Hospitals List
// =============================

export async function fetchRegisteredHospitals(city: string) {
  const { data } = await supabase
    .from("hospitals")
    .select("id, name, location, created_at")

  const filtered = (data || []).filter((h) => {
    try {

      return h.location === city
    } catch {
      return false
    }
  })

  return filtered
}

// =============================
// 4. Frontend: TrendChart Component
// =============================



import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { supabase } from "@/lib/supabase/client"

export function TrendChart() {
  const [data, setData] = useState<{ date: string; icu: number; oxygen: number }[]>([])

  useEffect(() => {
    const locationStr = localStorage.getItem("user_location")
    if (!locationStr) return
    const { city } = JSON.parse(locationStr)

    fetchTrendData(city).then((rows) => {
      const aggregated = rows!.reduce((acc: { date: string; icu: number; oxygen: number }[], row) => {
        const entry = acc.find((d) => d.date === row.date)
        if (!entry) {
          acc.push({
            date: row.date,
            icu: row.icu_beds_used,
            oxygen: row.oxygen_units_used,
          })
        } else {
          entry.icu += row.icu_beds_used
          entry.oxygen += row.oxygen_units_used
        }
        return acc
      }, [] as { date: string; icu: number; oxygen: number }[])
      setData(aggregated)
    })
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">
      <h2 className="text-xl font-bold mb-4">City-Wide ICU & Oxygen Usage Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="icu" stroke="#8884d8" name="ICU Beds Used" />
          <Line type="monotone" dataKey="oxygen" stroke="#82ca9d" name="Oxygen Units Used" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// =============================
// 5. CSV Export Button
// =============================

export function ResourceExportButton() {
  const handleExport = async () => {
    const url = await exportAllResourceDataAsCSV()
    if (url) {
      const link = document.createElement("a")
      link.href = url
      link.download = "resource_data.csv"
      link.click()
    }
  }

  return (
    <button onClick={handleExport} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
      Export Resource Data CSV
    </button>
  )
}

// =============================
// 6. Registered Hospitals List
// =============================

export function RegisteredHospitalsList() {
  const [hospitals, setHospitals] = useState<any[]>([])

  useEffect(() => {
    const locationStr = localStorage.getItem("user_location")
    if (!locationStr) return
    const { city } = JSON.parse(locationStr)

    fetchRegisteredHospitals(city).then(setHospitals)
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 mt-6">
      <h2 className="text-xl font-bold">Registered Hospitals</h2>
      <ul className="list-disc list-inside text-gray-800">
        {hospitals.map((h) => (
          <li key={h.id}>
            <span className="font-semibold">{h.name}</span> — Registered on {new Date(h.created_at).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
