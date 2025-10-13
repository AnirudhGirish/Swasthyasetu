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
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"
import { supabase } from "@/lib/supabase/client"

type RangeOption = "Today" | "7 Days" | "Month"

export async function AdvancedChart(city: string, range: RangeOption) {
  const { data: hospitals } = await supabase
    .from("hospitals")
    .select("department_id, location")

  const departmentIds = (hospitals || [])
    .filter((h) => h.location === city)
    .map((h) => h.department_id)

  const daysMap: Record<RangeOption, number> = {
    Today: 1,
    "7 Days": 7,
    Month: 30
  }
  const days = daysMap[range] || 14
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)
  const fromDateStr = fromDate.toISOString().split("T")[0]

  const { data: resources } = await supabase
    .from("resources")
    .select(
      "date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units, beds_used, total_beds, dialysis_machines_used, total_dialysis_machines, doctors_available, total_doctors_working, patients_below_16, patients_16_to_30, patients_30_to_50, patients_50_to_70, patients_above_70, male_patients, female_patients"
    )
    .in("hospital_id", departmentIds)
    .gte("date", fromDateStr)
    .order("date", { ascending: true })

  return resources
}

const getRangeDescription = (range: RangeOption) => {
  switch (range) {
    case 'Today': return 'Current day analysis'
    case '7 Days': return 'Weekly trend overview'
    case 'Month': return '30-day comprehensive view'
    default: return 'Trend analysis'
  }
}

export function AdvancedTrendChart() {
  const [range, setRange] = useState<RangeOption>("7 Days")
  const [resourceData, setResourceData] = useState<any[]>([])
  const [demographicData, setDemographicData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')
  const [activeChart, setActiveChart] = useState<'resources' | 'demographics'>('resources')

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

        const rows = await AdvancedChart(city, range)
        
        if (!rows || rows.length === 0) {
          setError(`No data available for ${range.toLowerCase()} analysis.`)
          return
        }

        const resourceAgg: any = {}
        const demoAgg: any = {}

        for (const row of rows) {
          const formattedDate = new Date(row.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short"
          })

          if (!resourceAgg[row.date]) {
            resourceAgg[row.date] = {
              date: formattedDate,
              icu: 0,
              oxygen: 0,
              beds: 0,
              dialysis: 0,
              doctors: 0
            }
          }
          resourceAgg[row.date].icu += row.icu_beds_used
          resourceAgg[row.date].oxygen += row.oxygen_units_used
          resourceAgg[row.date].beds += row.beds_used
          resourceAgg[row.date].dialysis += row.dialysis_machines_used
          resourceAgg[row.date].doctors += row.doctors_available

          if (!demoAgg[row.date]) {
            demoAgg[row.date] = {
              date: formattedDate,
              below16: 0,
              age16to30: 0,
              age30to50: 0,
              age50to70: 0,
              above70: 0,
              male: 0,
              female: 0,
              total: 0
            }
          }
          demoAgg[row.date].below16 += row.patients_below_16
          demoAgg[row.date].age16to30 += row.patients_16_to_30
          demoAgg[row.date].age30to50 += row.patients_30_to_50
          demoAgg[row.date].age50to70 += row.patients_50_to_70
          demoAgg[row.date].above70 += row.patients_above_70
          demoAgg[row.date].male += row.male_patients
          demoAgg[row.date].female += row.female_patients
          demoAgg[row.date].total += (row.patients_below_16 + row.patients_16_to_30 + row.patients_30_to_50 + row.patients_50_to_70 + row.patients_above_70)
        }

        setResourceData(Object.values(resourceAgg))
        setDemographicData(Object.values(demoAgg))
      } catch (err: any) {
        setError(err.message || "Failed to load trend data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [range])

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
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">Advanced Analytics</h2>
              <p className="text-black text-sm">
                {cityName ? `${cityName} - ` : ''}{getRangeDescription(range)}
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Chart Type Selector */}
            <div className="flex bg-white/20 rounded-xl p-1">
              <button
                onClick={() => setActiveChart('resources')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300  ${
                  activeChart === 'resources' 
                    ? 'bg-white text-black shadow-lg border border-black' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveChart('demographics')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300  ${
                  activeChart === 'demographics' 
                    ? 'bg-white text-black shadow-lg border border-black' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Demographics
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-black text-sm font-medium">Range:</label>
              <select
                className="bg-white/20 text-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm border border-black"
                value={range}
                onChange={(e) => setRange(e.target.value as RangeOption)}
              >
                <option value="Today" className="text-gray-900">Today</option>
                <option value="7 Days" className="text-gray-900">7 Days</option>
                <option value="Month" className="text-gray-900">Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading advanced analytics...</p>
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
        ) : (
          <div className="space-y-8">
            {activeChart === 'resources' ? (
              <>
                {/* Resource Usage Chart */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Resource Usage Trends</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
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
                        <Line type="monotone" dataKey="icu" stroke="#ef4444" strokeWidth={3} name="ICU Beds Used" dot={{ fill: '#ef4444', r: 4 }} />
                        <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={3} name="Oxygen Units Used" dot={{ fill: '#10b981', r: 4 }} />
                        <Line type="monotone" dataKey="beds" stroke="#f59e0b" strokeWidth={3} name="Beds Used" dot={{ fill: '#f59e0b', r: 4 }} />
                        <Line type="monotone" dataKey="dialysis" stroke="#8b5cf6" strokeWidth={3} name="Dialysis Used" dot={{ fill: '#8b5cf6', r: 4 }} />
                        <Line type="monotone" dataKey="doctors" stroke="#06b6d4" strokeWidth={3} name="Doctors Available" dot={{ fill: '#06b6d4', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resource Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: 'icu', label: 'ICU Beds', color: 'red', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                    { key: 'oxygen', label: 'Oxygen Units', color: 'green', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                    { key: 'beds', label: 'General Beds', color: 'yellow', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
                    { key: 'dialysis', label: 'Dialysis', color: 'purple', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
                    { key: 'doctors', label: 'Doctors', color: 'cyan', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
                  ].map((resource) => (
                    <div key={resource.key} className={`bg-${resource.color}-50 border border-${resource.color}-200 rounded-2xl p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <svg className={`w-6 h-6 text-${resource.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resource.icon} />
                        </svg>
                        <span className={`text-xs font-medium text-${resource.color}-600`}>Total</span>
                      </div>
                      <p className={`text-2xl font-bold text-${resource.color}-700`}>
                        {resourceData.reduce((sum, item) => sum + (item[resource.key] || 0), 0)}
                      </p>
                      <p className={`text-sm text-${resource.color}-600 mt-1`}>{resource.label}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Demographics Charts */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    <span>Age Distribution Trends</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={demographicData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
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
                        <Line type="monotone" dataKey="below16" stroke="#8b5cf6" strokeWidth={2} name="Below 16" />
                        <Line type="monotone" dataKey="age16to30" stroke="#10b981" strokeWidth={2} name="16-30" />
                        <Line type="monotone" dataKey="age30to50" stroke="#f59e0b" strokeWidth={2} name="30-50" />
                        <Line type="monotone" dataKey="age50to70" stroke="#ef4444" strokeWidth={2} name="50-70" />
                        <Line type="monotone" dataKey="above70" stroke="#dc2626" strokeWidth={2} name="Above 70" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                    <span>Gender Distribution</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={demographicData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
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
                        <Bar dataKey="male" fill="#3b82f6" name="Male Patients" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="female" fill="#ec4899" name="Female Patients" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Demographics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'below16', label: 'Children (<16)', color: 'purple' },
                    { key: 'age16to30', label: 'Young Adults', color: 'green' },
                    { key: 'age50to70', label: 'Senior Adults', color: 'orange' },
                    { key: 'above70', label: 'Elderly (70+)', color: 'red' }
                  ].map((demo) => (
                    <div key={demo.key} className={`bg-${demo.color}-50 border border-${demo.color}-200 rounded-2xl p-4`}>
                      <p className={`text-2xl font-bold text-${demo.color}-700`}>
                        {demographicData.reduce((sum, item) => sum + (item[demo.key] || 0), 0)}
                      </p>
                      <p className={`text-sm text-${demo.color}-600 mt-1`}>{demo.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}