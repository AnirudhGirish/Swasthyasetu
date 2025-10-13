/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

interface Hospital {
  id: string
  name: string
  location: string | null
  department_id: string
}

export default function SubmissionOverview() {
  const [submittedCount, setSubmittedCount] = useState(0)
  const [missedCount, setMissedCount] = useState(0)
  const [missedHospitals, setMissedHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [totalHospitals, setTotalHospitals] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const locationStr = localStorage.getItem("user_location")
      if (!locationStr) return

      const { city } = JSON.parse(locationStr)
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      })

      // 1. Get all hospitals in current city
      const { data: hospitals, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("id, name, location, department_id")

      if (!hospitals || hospitalsError) {
        setLoading(false)
        return
      }

      const cityHospitals = hospitals.filter((h) => {
        if (!h.location) return false
        try {
          return h.location === city
        } catch {
          return false
        }
      })

      setTotalHospitals(cityHospitals.length)
      const hospitalProfileIds = cityHospitals.map((h) => h.department_id)

      // 2. Get today's submissions from resources
      const { data: submissions, error: submissionError } = await supabase
        .from("resources")
        .select("hospital_id")
        .eq("date", today)

      if (!submissions || submissionError) {
        setLoading(false)
        return
      }

      const submittedHospitalIds = new Set(
        submissions.map((s) => s.hospital_id)
      )

      const missed = cityHospitals.filter(
        (h) => !submittedHospitalIds.has(h.department_id)
      )

      setSubmittedCount(cityHospitals.length - missed.length)
      setMissedCount(missed.length)
      setMissedHospitals(missed)
      setLoading(false)
    }

    fetchData()
  }, [])

  const getSubmissionRate = () => {
    if (totalHospitals === 0) return 0
    return Math.round((submittedCount / totalHospitals) * 100)
  }

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-blsck bg-green-50 border-green-400'
    if (rate >= 70) return 'text-black bg-yellow-50 border-yellow-400'
    return 'text-black bg-red-50 border-red-400'
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Submissions</h2>
            <p className="text-green-100 text-sm">Hospital reporting compliance status</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading submission status...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Rate */}
            <div className={`rounded-2xl p-6 border-2 ${getStatusColor(getSubmissionRate())}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Submission Rate</h3>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold">{getSubmissionRate()}%</span>
                </div>
              </div>
              <div className="bg-white/50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-green-900 rounded-full transition-all duration-1000"
                  style={{ width: `${getSubmissionRate()}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2 opacity-75">
                {submittedCount} of {totalHospitals} hospitals submitted today
              </p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-400">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-black">Submitted</h4>
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-black">{submittedCount}</p>
                <p className="text-sm text-black mt-1">On-time reports</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-400">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-black">Pending</h4>
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-black">{missedCount}</p>
                <p className="text-sm text-black mt-1">Missing reports</p>
              </div>
            </div>

            {/* Missed Hospitals List */}
            {missedHospitals.length > 0 && (
              <div className="bg-red-50 border border-red-400 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="font-bold text-red-800 text-lg">
                    Hospitals Missing Today&apos;s Submission
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {missedHospitals.map((hospital) => (
                    <div 
                      key={hospital.department_id} 
                      className="bg-white rounded-xl p-4 border border-red-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800">{hospital.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Overdue
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-white rounded-xl border border-red-200">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Action Required</h4>
                      <p className="text-sm text-red-700 leading-relaxed">
                        Please contact these hospitals to ensure timely submission of daily reports. 
                        Missing data affects city-wide healthcare monitoring and emergency preparedness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Submitted Success */}
            {missedHospitals.length === 0 && totalHospitals > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 text-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-black text-lg">Perfect Compliance!</h3>
                    <p className="text-black">All hospitals have submitted their daily reports.</p>
                  </div>
                </div>
              </div>
            )}

            {/* No Hospitals */}
            {totalHospitals === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">No Hospitals Found</h3>
                <p className="text-gray-600">No hospitals registered in your current location.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}