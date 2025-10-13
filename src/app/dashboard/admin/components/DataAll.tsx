/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

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

// =============================
// 1. Trend Chart Data Fetch
// =============================

export async function fetchTrendData(city: string) {
  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("department_id, location")

  const departmentIds = (hospitals || [])
    .filter((h) => h.location === city)
    .map((h) => h.department_id)

  const { data: resources } = await supabase
    .from("resources")
    .select("date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units")
    .in("hospital_id", departmentIds)
    .order("date", { ascending: true })

  return resources
}

// =============================
// 2. Export All Resource Data as CSV
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
// 3. Registered Hospitals Fetch
// =============================

export async function fetchRegisteredHospitals(city: string) {
  const { data } = await supabase
    .from("hospitals")
    .select("id, name, location, created_at")

  const filtered = (data || []).filter((h) => h.location === city)

  return filtered
}

// =============================
// 4. Enhanced Trend Chart Component
// =============================

export function TrendChart() {
  const [data, setData] = useState<{ date: string; icu: number; oxygen: number; formatted_date: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const locationStr = localStorage.getItem("user_location")
        if (!locationStr) {
          setError("Location not found. Please set your location.")
          return
        }
        
        const { city } = JSON.parse(locationStr)
        setCityName(city)

        const rows = await fetchTrendData(city)
        
        if (!rows || rows.length === 0) {
          setError("No data available for analysis.")
          return
        }

        const aggregated = rows.reduce((acc: { date: string; icu: number; oxygen: number; formatted_date: string }[], row: any) => {
          const entry = acc.find((d) => d.date === row.date)
          const formattedDate = new Date(row.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short"
          })
          
          if (!entry) {
            acc.push({
              date: row.date,
              icu: row.icu_beds_used,
              oxygen: row.oxygen_units_used,
              formatted_date: formattedDate,
            })
          } else {
            entry.icu += row.icu_beds_used
            entry.oxygen += row.oxygen_units_used
          }
          return acc
        }, [])
        
        setData(aggregated)
      } catch (err: any) {
        setError(err.message || "Failed to load trend data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">City-Wide Resource Trends</h2>
            <p className="text-white text-sm">
              {cityName ? `${cityName} - ` : ''}ICU beds and oxygen usage patterns
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading trend data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Unavailable</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Trend Data</h3>
            <p className="text-gray-600">No resource usage data available for trend analysis.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="formatted_date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="icu" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="ICU Beds Used" 
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oxygen" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Oxygen Units Used" 
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-red-800">Total ICU Usage</h4>
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-red-700">
                  {data.reduce((sum, item) => sum + item.icu, 0)}
                </p>
                <p className="text-sm text-red-600 mt-1">Total beds used</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-green-800">Total Oxygen Usage</h4>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {data.reduce((sum, item) => sum + item.oxygen, 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">Total units used</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-800">Data Points</h4>
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-blue-700">{data.length}</p>
                <p className="text-sm text-blue-600 mt-1">Days tracked</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================
// 5. Enhanced CSV Export Button
// =============================

export function ResourceExportButton() {
  const [loading, setLoading] = useState(false)
  const [exportCount, setExportCount] = useState<number | null>(null)

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const { count } = await supabase
        .from("resources")
        .select("*", { count: 'exact', head: true })
      
      setExportCount(count || 0)

      const url = await exportAllResourceDataAsCSV()
      if (url) {
        const timestamp = new Date().toISOString().split('T')[0]
        const link = document.createElement("a")
        link.href = url
        link.download = `swasthyasetu-resource-data-${timestamp}.csv`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } else {
        alert("Failed to export data. Please try again.")
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("An error occurred during export. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden max-w-screen mx-auto">
      <div className="bg-gradient-to-r from-sky-800 to-sky-900 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Data Export Center</h2>
            <p className="text-blue-100 text-sm">Download complete resource database</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-sky-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-bold text-sky-800 mb-2">Export Includes</h4>
              <ul className="text-sm text-sky-900 space-y-1">
                <li>• Complete hospital resource submissions</li>
                <li>• Historical data across all dates</li>
                <li>• Patient demographics and metrics</li>
                <li>• CSV format for external analysis</li>
              </ul>
            </div>
          </div>
        </div>

        {exportCount !== null && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-green-800">Available Records</h4>
                <p className="text-sm text-green-700">Ready for download</p>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {exportCount.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-800 to-sky-900 hover:from-sky-600 hover:to-sky-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Exporting Data...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Resource Data</span>
            </>
          )}
        </button>

        <div className="bg-sky-200 border border-sky-400 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-sky-800 mb-1">Data Security Notice</h4>
              <p className="text-sm text-sky-700 leading-relaxed">
                Exported data contains sensitive healthcare information. Handle according to government data protection guidelines and HIPAA compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================
// 6. Enhanced Registered Hospitals List
// =============================

export function RegisteredHospitalsList() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const locationStr = localStorage.getItem("user_location")
        if (!locationStr) {
          setError("Location not found. Please set your location.")
          return
        }
        
        const { city } = JSON.parse(locationStr)
        setCityName(city)
        
        const hospitalData = await fetchRegisteredHospitals(city)
        setHospitals(hospitalData)
      } catch (err: any) {
        setError(err.message || "Failed to load hospitals")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Registered Hospitals</h2>
            <p className="text-teal-100 text-sm">
              {cityName ? `${cityName} - ` : ''}Healthcare facilities in the system
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading hospitals...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Hospitals Found</h3>
            <p className="text-gray-600">No healthcare facilities registered in {cityName || 'your city'}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-teal-800">Total Registered</h4>
                  <p className="text-sm text-teal-700">Active healthcare facilities</p>
                </div>
                <div className="text-3xl font-bold text-teal-700">
                  {hospitals.length}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {hospitals.map((hospital, index) => (
                <div key={hospital.id} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-400 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{hospital.name}</h4>
                        <p className="text-sm text-gray-600">
                          Registered: {new Date(hospital.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 border border-gray-400 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">
                  All registered hospitals can submit daily reports and access the SwasthyaSetu platform.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}