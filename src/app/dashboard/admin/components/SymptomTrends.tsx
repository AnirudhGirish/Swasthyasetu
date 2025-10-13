/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SymptomTrendsPanel() {
  const [summary, setSummary] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')
  const [dataCount, setDataCount] = useState<number>(0)

  const fetchSymptomInsights = async () => {
    setLoading(true)
    setError(null)
    setSummary('')
    setHighlights([])

    try {
      const stored = localStorage.getItem('user_location')
      if (!stored) {
        setError('Location not found. Please set your location.')
        return
      }

      const { city } = JSON.parse(stored)
      setCityName(city)

      const { data: hospitals, error: hospitalError } = await supabase
        .from('hospitals')
        .select('department_id')
        .eq('location', city)

      if (hospitalError) {
        throw new Error('Failed to fetch hospitals: ' + hospitalError.message)
      }

      const departmentIds = hospitals?.map(h => h.department_id) || []
      
      if (departmentIds.length === 0) {
        setError('No hospitals found in your city.')
        return
      }

      const pastWeek = new Date()
      pastWeek.setDate(pastWeek.getDate() - 7)
      const pastWeekISO = pastWeek.toISOString().split('T')[0]

      const { data: resources, error: resourceError } = await supabase
        .from('resources')
        .select('date, common_symptoms, weekly_diagnosis_summary')
        .in('hospital_id', departmentIds)
        .gte('date', pastWeekISO)

      if (resourceError) {
        throw new Error('Failed to fetch symptom data: ' + resourceError.message)
      }

      const clean = (resources ?? []).filter(r =>
        r.common_symptoms?.length > 0 || r.weekly_diagnosis_summary
      )

      setDataCount(clean.length)

      if (clean.length === 0) {
        setError('No symptom data available for the past week.')
        return
      }

      const res = await fetch('/api/symptop-insight', {
        method: 'POST',
        body: JSON.stringify({ symptomsData: clean }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        throw new Error('Failed to generate insights: ' + res.statusText)
      }

      const result = await res.json()
      
      if (result.success) {
        setSummary(result.summary || 'No summary available.')
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
    fetchSymptomInsights()
  }, [])

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#b39c4d] to-[#b39c4d]/75 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Symptom & Diagnosis Trends</h2>
              <p className="text-white text-sm">
                {cityName ? `${cityName} - ` : ''}Weekly healthcare pattern analysis
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchSymptomInsights}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center space-x-2 border border-black"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Last Updated */}
        {lastUpdated && !loading && (
          <div className="flex items-center justify-between bg-[#b39c4d]/20 border border-[#b39c4d] rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-[#b39c4d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-[#b39c4d]">
                Last updated: {lastUpdated}
              </span>
            </div>
            {dataCount > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-900 font-medium">{dataCount} reports analyzed</span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-rose-400 to-rose-500 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Symptom Data</h3>
                <p className="text-gray-600">Processing weekly healthcare reports...</p>
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
              onClick={fetchSymptomInsights}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
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
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Weekly Symptom Analysis</span>
                </h3>
                <p className="text-gray-800 leading-relaxed text-lg">{summary}</p>
              </div>
            )}

            {/* Key Findings */}
            {highlights.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Critical Health Findings</span>
                </h3>
                
                <div className="space-y-3">
                  {highlights.map((point, idx) => (
                    <div key={idx} className="bg-[#b39c4d]/35 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <p className="text-red-800 leading-relaxed font-medium">{point}</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Symptom Analysis Available</h3>
                <p className="text-gray-600">No symptom data or diagnosis summaries found for the past week.</p>
              </div>
            )}

            {/* Analysis Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-800 mb-1">Pattern Detection</h4>
                <p className="text-xs text-blue-700">Identifies emerging health trends</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-red-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-red-800 mb-1">Early Warning</h4>
                <p className="text-xs text-red-700">Detects potential outbreaks</p>
              </div>
              
              <div className="bg-sky-200/50 border border-sky-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-sky-900 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-sky-900 mb-1">Public Health</h4>
                <p className="text-xs text-sky-900">Supports health planning</p>
              </div>
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-[#b39c4d]/30 border border-[#b39c4d] rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Medical Data Analysis</h4>
                  <p className="text-sm text-[#b39c4d] leading-relaxed">
                    This analysis is based on reported symptoms and diagnosis summaries from healthcare facilities. 
                    Use as supplementary information for public health planning and always consult medical professionals for clinical decisions.
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