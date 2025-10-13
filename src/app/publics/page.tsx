/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import EmergencyPanel from '@/src/components/patient/EmergencyPanel'
import Image from 'next/image'
import HospitalList from '@/src/components/public_list'
import Link from 'next/link'

export default function PatientDashboard() {
  const [location, setLocation] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      setLocation(JSON.parse(stored));
    }
  }, []);

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
            <Link href={"/"}>
            <button className='bg-gradient-to-r from-indigo-400  to-green-400 px-4 py-1 rounded-3xl text-white hover:from-green-400 hover:to-indigo-400 transition-all duration-300 cursor-pointer'>
              Home
            </button>
            </Link>
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
                Access emergency services, and nearby healthcare facilities
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
        <HospitalList />
      </div>
    </div>
  )
}