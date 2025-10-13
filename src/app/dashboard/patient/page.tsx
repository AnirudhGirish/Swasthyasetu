/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getDiagnosisFromSymptoms } from '@/lib/ai/getDiagnosisFromSymptoms'
import EmergencyPanel from '@/src/components/patient/EmergencyPanel'
import HospitalList from '@/src/components/patient/HospitalList'
import LogoutButton from '@/src/components/auth/LogoutButton'
import Image from 'next/image'

export default function PatientDashboard() {
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState<{ condition: string, urgency: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      setLocation(JSON.parse(stored));
    }
  }, []);

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim()) {
      alert('Please describe your symptoms to get AI-powered health insights')
      return
    }
    
    setLoading(true)
    try {
      const result = await getDiagnosisFromSymptoms(symptoms)
      if (!result) {
        alert('Unable to process symptoms at this time. Please try again or consult a healthcare provider.')
        return
      }
      setDiagnosis(result)
    } catch (error) {
      alert('Error processing symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'from-red-500 to-red-600'
      case 'medium':
      case 'moderate':
        return 'from-yellow-500 to-yellow-600'
      case 'low':
      case 'mild':
        return 'from-green-500 to-green-600'
      default:
        return 'from-blue-500 to-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-sky-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image alt="logo" src="/logo.png" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-sky-800 bg-clip-text text-transparent">
                Swasthya<span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">Setu</span>
              </h1>
              <p className="text-sm font-semibold text-gray-600 -mt-1">User Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {location && (
              <div className="flex items-center space-x-2 bg-sky-50 px-3 py-2 rounded-full border border-sky-200">
                <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-900 font-medium">
                  {location.city}, {location.state}
                </span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-[#e2711d]/80 via-[#ff9505]/80 via-[#ff9e00]/80 to-[#ffaa00]/80 rounded-3xl p-8 border border-sky-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to <span className='text-sky-700'>Swasthya</span><span className='text-orange-700'>Setu</span>
              </h2>
              <p className="text-lg text-gray-900">
                Access AI-powered health insights, emergency services, and nearby healthcare facilities
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-gradient-to-br from-[#cc5803] to-[#cc5803]/65  rounded-2xl flex items-center justify-center shadow-lg border border-black">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Panel */}
        <EmergencyPanel />

        {/* AI Symptom Analysis */}
        <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-black">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Health Assistant</h3>
                <p className="text-sky-100 text-sm">Get instant preliminary health insights</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Describe your symptoms in detail:
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full border-2 border-gray-400 rounded-2xl p-4 h-32 text-gray-800 placeholder-gray-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all duration-300 resize-none"
                  placeholder="Please describe what you're experiencing... For example: 'I have been feeling chest pain and shortness of breath for the past 2 hours'"
                />
              </div>
              
              <button
                onClick={handleSymptomSubmit}
                disabled={loading || !symptoms.trim()}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Get AI Health Insights</span>
                  </>
                )}
              </button>
            </div>

            {diagnosis && (
              <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-l-4 border-sky-500">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">AI Health Analysis</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Possible Condition:</p>
                        <p className="text-lg font-bold text-gray-900">{diagnosis.condition}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Urgency Level:</p>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getUrgencyColor(diagnosis.urgency)} text-white font-bold text-sm shadow-lg`}>
                          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          {diagnosis.urgency}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-yellow-800 leading-relaxed">
                          <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
                          Please consult with a qualified healthcare provider for proper diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hospital List */}
        <HospitalList />
      </div>
    </div>
  )
}