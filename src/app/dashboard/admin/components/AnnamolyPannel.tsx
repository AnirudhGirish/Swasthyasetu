/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AnomalyResult {
  paragraph: string
  anomalies: string[]
}

export default function AnomalyPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnomalyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string>('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const locationStr = localStorage.getItem('user_location')
      if (!locationStr) {
        setError('Location not found. Please set your location.')
        return
      }
      
      const { city } = JSON.parse(locationStr)
      setCityName(city)

      // 1. Get hospitals in city
      const { data: hospitals, error: hospitalError } = await supabase
        .from('hospitals')
        .select('department_id, location')
        .eq('location', city)

      if (hospitalError) {
        throw new Error('Failed to fetch hospitals: ' + hospitalError.message)
      }

      const departmentIds = hospitals?.map(h => h.department_id) || []
      
      if (departmentIds.length === 0) {
        setError('No hospitals found in your city.')
        return
      }

      // 2. Get recent submissions (last 14 days)
      const since = new Date()
      since.setDate(since.getDate() - 14)
      const fromDate = since.toISOString().split('T')[0]
      
      const { data: resources, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .in('hospital_id', departmentIds)
        .gte('date', fromDate)
        .order('date', { ascending: true })

      if (resourceError) {
        throw new Error('Failed to fetch resource data: ' + resourceError.message)
      }

      if (!resources || resources.length === 0) {
        setError('No recent data available for anomaly detection.')
        return
      }

      // 3. Send to /api/anomaly
      const res = await fetch('/api/anomaly', {
        method: 'POST',
        body: JSON.stringify({ resources }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        throw new Error('Failed to analyze anomalies: ' + res.statusText)
      }

      const json = await res.json()
      
      if (json.success) {
        setResult({ 
          paragraph: json.paragraph || 'No analysis summary available.', 
          anomalies: json.anomalies || [] 
        })
        setLastUpdated(new Date().toLocaleString())
      } else {
        throw new Error(json.error || 'Failed to detect anomalies')
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getAnomalySeverity = (anomaly: string) => {
    const lowerAnomaly = anomaly.toLowerCase()
    if (lowerAnomaly.includes('critical') || lowerAnomaly.includes('severe') || lowerAnomaly.includes('emergency')) {
      return 'critical'
    }
    if (lowerAnomaly.includes('significant') || lowerAnomaly.includes('unusual') || lowerAnomaly.includes('concern')) {
      return 'warning'
    }
    return 'info'
  }

  // const getAnomalyColor = (severity: string) => {
  //   switch (severity) {
  //     case 'critical': return 'bg-red-50 border-red-300 text-red-800'
  //     case 'warning': return 'bg-yellow-50 border-yellow-300 text-yellow-800'
  //     default: return 'bg-blue-50 border-blue-300 text-blue-800'
  //   }
  // }

  const getAnomalyIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
        return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
      case 'warning':
        return "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      default:
        return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#bc6c25] to-[#bc6c25]/75 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Anomaly Detection</h2>
              <p className="text-orange-100 text-sm">
                {cityName ? `${cityName} - ` : ''}AI-powered pattern analysis
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchData}
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
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-800">
                Last analysis: {lastUpdated}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-900 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-900 font-medium">Live Detection</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Detecting Anomalies</h3>
                <p className="text-gray-600">Analyzing recent healthcare data patterns...</p>
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
              onClick={fetchData}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              Retry Analysis
            </button>
          </div>
        ) : result ? (
          <div className="space-y-8">
            {/* Analysis Summary */}
            {result.paragraph && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Analysis Summary</span>
                </h3>
                <p className="text-gray-800 leading-relaxed text-lg">{result.paragraph}</p>
              </div>
            )}

            {/* Anomalies */}
            {result.anomalies.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Detected Anomalies</span>
                </h3>
                
                <div className="space-y-3">
                  {result.anomalies.map((anomaly, i) => {
                    const severity = getAnomalySeverity(anomaly)
                    return (
                      <div key={i} className={`rounded-2xl p-4 border-2 bg-[#bc6c25]/50 border border-[#bc6c25]`}>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getAnomalyIcon(severity)} />
                          </svg>
                          <p className="font-medium leading-relaxed">{anomaly}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 justify-center text-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">No Anomalies Detected</h3>
                    <p className="text-green-700">All healthcare data patterns appear normal.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detection Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-800 mb-1">Pattern Analysis</h4>
                <p className="text-xs text-blue-700">14-day data analysis</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-orange-800 mb-1">Alert System</h4>
                <p className="text-xs text-orange-700">Automatic detection</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-green-800 mb-1">Quick Response</h4>
                <p className="text-xs text-green-700">Real-time monitoring</p>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="bg-[#bc6c25]/40 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Anomaly Detection Disclaimer</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Anomaly detection is AI-generated based on pattern analysis. Use as supplementary guidance and always 
                    consult with healthcare professionals to investigate and verify any detected anomalies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analysis Available</h3>
            <p className="text-gray-600">No anomaly detection results available. Please try refreshing the analysis.</p>
          </div>
        )}
      </div>
    </div>
  )
}