/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function HospitalProfileSetup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
  const checkIfAlreadySetup = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (userId) {
      const { data: existing } = await supabase
        .from('hospitals')
        .select('id')
        .eq('department_id', userId)
        .maybeSingle()

      if (existing) {
        router.replace('/dashboard/hospital')
      }
    }
  }

  checkIfAlreadySetup()
}, [])


  const handleSubmit = async () => {
    setError('')

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setError('Authentication failed.')
      return
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      setError('Profile not found.')
      return
    }

    

    const { error: insertErr } = await supabase.from('hospitals').insert([
      {
        name,
        location,
        specialty: speciality,
        department_id: profile.id,
      },
    ])

    if (insertErr) {
      setError('Insert failed: ' + insertErr.message)
      return
    }

    router.replace('/dashboard/hospital')
  }

  return (
    <div className="max-w-lg mx-auto mt-12 space-y-6">
      <h1 className="text-xl font-bold text-center">Complete Your Hospital Profile</h1>

      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hospital Name"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (City or Area)"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          placeholder="Hospital Speciality (e.g. Cardiology, Trauma)"
          className="w-full border rounded px-4 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
