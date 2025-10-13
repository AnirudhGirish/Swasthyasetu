/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function AddHospitalForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAdd = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Please fill in all required fields")
      return
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address")
      return
    }

    const locationStr = localStorage.getItem("user_location")
    if (!locationStr) {
      alert("Location not found. Please refresh the page and try again.")
      return
    }

    const { city } = JSON.parse(locationStr)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      alert("Authentication error. Please log in again.")
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.from("authorized_hospitals").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        location: city,
        added_by: user.id
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      setName("")
      setEmail("")
      
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error: any) {
      alert("Failed to add hospital: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#358f80] to-[#358f80]/90 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Hospital</h2>
            <p className="text-white text-sm">Register a hospital for system access</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-800">Hospital Added Successfully!</h3>
                <p className="text-green-700 text-sm">The hospital has been registered and can now access the system.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#358f80] focus:ring-4 focus:ring-[#358f80]/50 focus:outline-none transition-all duration-300"
                placeholder="e.g., City General Hospital"
                maxLength={100}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Official Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#358f80]/50 focus:ring-4 focus:ring-[#358f80]/30 focus:outline-none transition-all duration-300"
                placeholder="hospital@example.com"
                maxLength={100}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This email will be used for system notifications and login access
            </p>
          </div>

          {/* Location Info */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-700 font-medium">
                Hospital will be registered for your current location
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAdd}
            disabled={loading || !name.trim() || !email.trim()}
            className="w-full bg-gradient-to-r from- to-[#358f80] hover:from-[#358f80]/50 hover:to-[#358f80]/95 disabled:from-gray-300 disabled:to-gray-400 text-white disabled:text-neutral-600 py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Adding Hospital...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Hospital to System</span>
              </>
            )}
          </button>

          {/* Information Panel */}
          <div className="bg-[#99e2b4]/20 border border-[#99e2b4] rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-[#99e2b4]mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-[#358f80] mb-2">Registration Process</h4>
                <ul className="text-sm text-[#358f80]/90 space-y-1">
                  <li>• Hospital will be added to the authorized list</li>
                  <li>• They can use the provided email for Google OAuth login</li>
                  <li>• Access will be granted to submit daily reports</li>
                  <li>• All data will be monitored by your department</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[#358f80]/25 border border-[#358f80] rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-semibold text-[#358f80]/125 mb-1">Security Note</h4>
                <p className="text-sm text-[#358f80]">
                  Ensure the email address belongs to the official hospital administration. 
                  This email will have access to submit sensitive healthcare data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}