/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type City = { city: string }
type RangeOption = 'Today' | '7 Days' | 'Month'

const getStartDate = (range: string) => {
  const today = new Date()
  if (range === '7 Days') today.setDate(today.getDate() - 6)
  else if (range === 'Month') today.setDate(today.getDate() - 29)
  return today.toISOString().split('T')[0]
}

const getRangeDescription = (range: RangeOption) => {
  switch (range) {
    case 'Today': return 'Current day analysis'
    case '7 Days': return 'Weekly trend analysis'
    case 'Month': return '30-day comprehensive analysis'
    default: return 'Data analysis'
  }
}

export default function CityWideInsightPanel() {
  const [range, setRange] = useState<RangeOption>('7 Days')
  const [summary, setSummary] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')

  const fetchDataAndSendToAI = async () => {
    setLoading(true)
    setError(null)
    setSummary('')
    setHighlights([])

    try {
      const loc = localStorage.getItem('user_location')
      if (!loc) {
        setError('Location not found. Please set your location.')
        return
      }

      const { city } = JSON.parse(loc) as City
      setCityName(city)
      
      const startDate = getStartDate(range)
      const today = new Date().toISOString().split('T')[0]

      // Step 1: Get hospital ids for this city
      const { data: hospitals, error: hospitalError } = await supabase
        .from('hospitals')
        .select('department_id, location')
        .eq('location', city)

      if (hospitalError) {
        throw new Error('Failed to fetch hospitals: ' + hospitalError.message)
      }

      const departmentIds = hospitals?.map((h) => h.department_id) ?? []
      
      if (!departmentIds.length) {
        setError('No hospitals found in your city.')
        return
      }

      // Step 2: Get resources
      const { data: resources, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .in('hospital_id', departmentIds)
        .gte('date', startDate)
        .lte('date', today)

      if (resourceError) {
        throw new Error('Failed to fetch resource data: ' + resourceError.message)
      }

      if (!resources || resources.length === 0) {
        setError('No data available for the selected time period.')
        return
      }

      // Step 3: Send to API
      const res = await fetch('/api/forecasts', {
        method: 'POST',
        body: JSON.stringify({ resources }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        throw new Error('Failed to generate insights: ' + res.statusText)
      }

      const result = await res.json()
      
      if (result.success) {
        setSummary(result.paragraph || 'No summary available.')
        setHighlights(result.highlights || [])
        setLastUpdated(new Date().toLocaleString())
      } else {
        throw new Error(result.error || 'Failed to generate insights')
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataAndSendToAI()
  }, [range])

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#81c3d7] to-[#81c3d7]/85 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">City-Wide AI Analysis</h2>
              <p className="text-black text-sm">
                {cityName ? `${cityName} - ` : ''}{getRangeDescription(range)}
              </p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-3">
            <label className="text-black text-sm font-medium">Time Range:</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeOption)}
              className="bg-white/20 border border-black text-black rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            >
              <option value="Today" className="text-gray-900">Today</option>
              <option value="7 Days" className="text-gray-900">7 Days</option>
              <option value="Month" className="text-gray-900">Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Last Updated */}
        {lastUpdated && !loading && (
          <div className="flex items-center justify-between bg-[#81c3d7]/50 border border-[#81c3d7] rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-black">
                Last updated: {lastUpdated}
              </span>
            </div>
            <button
              onClick={fetchDataAndSendToAI}
              disabled={loading}
              className="bg-[#81c3d7] hover:bg-[#81c3d7]/50 text-black px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 border border-black"
            >
              Refresh
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generating AI Analysis</h3>
                <p className="text-gray-600">Processing {range.toLowerCase()} healthcare data...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDataAndSendToAI}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              Retry Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Section */}
            {summary && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Analysis Summary</span>
                </h3>
                <p className="text-gray-800 leading-relaxed text-lg">{summary}</p>
              </div>
            )}

            {/* Highlights Section */}
            {highlights.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Key Insights</span>
                </h3>
                
                <div className="space-y-3">
                  {highlights.map((point, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-gray-800 leading-relaxed font-medium">{point}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!summary && !highlights.length && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">No insights generated for the selected time period. Try a different range or check back later.</p>
              </div>
            )}

            {/* AI Analysis Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-800 mb-1">Trend Analysis</h4>
                <p className="text-xs text-blue-700">Identifies patterns in resource usage</p>
              </div>
              
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-red-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-black mb-1">Risk Assessment</h4>
                <p className="text-xs text-black">Evaluates potential issues</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-black mb-1">Recommendations</h4>
                <p className="text-xs text-black">Suggests improvements</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-[#81c3d7]/75 border border-[#81c3d7] rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-black mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-black mb-1">AI Analysis Disclaimer</h4>
                  <p className="text-sm text-black leading-relaxed">
                    This analysis is generated by artificial intelligence based on submitted data patterns. 
                    Use as supplementary guidance and always consult healthcare professionals for critical decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}