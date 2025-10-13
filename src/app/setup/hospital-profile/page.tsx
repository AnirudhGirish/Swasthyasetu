'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function HospitalProfileSetup() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [country, setCountry] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [speciality, setSpeciality] = useState('General')
  const [specialities, setSpecialities] = useState<string[]>([])
  const [chipInput, setChipInput] = useState('')

  const [error, setError] = useState('')

  // Redirect if already setup
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

        if (existing) router.replace('/dashboard/hospital')
      }
    }

    checkIfAlreadySetup()
  }, [router])

  // Fetch name + location from authorized_hospitals
  useEffect(() => {
    const fetchMeta = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const email = user?.email

      if (email) {
        const { data: authorized } = await supabase
          .from('authorized_hospitals')
          .select('name, location')
          .eq('email', email)
          .maybeSingle()

        if (authorized) {
          setName(authorized.name)
          setLocation(authorized.location)
        }
      }
    }

    fetchMeta()
  }, [])

  const addChip = () => {
    const trimmed = chipInput.trim()
    if (trimmed && !specialities.includes(trimmed)) {
      setSpecialities([...specialities, trimmed])
      setChipInput('')
    }
  }

  const removeChip = (chip: string) => {
    setSpecialities(specialities.filter((s) => s !== chip))
  }

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
        address,
        city,
        state: stateName,
        country,
        postal_code: postalCode,
        speciality_type: speciality,
        specialities,
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
    <div className="max-w-2xl mx-auto mt-12 space-y-6">
      <h1 className="text-xl font-bold text-center">Complete Your Hospital Profile</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          value={name}
          disabled
          className="w-full border rounded px-4 py-2 bg-gray-100"
          placeholder="Hospital Name"
        />
        <input
          type="text"
          value={location}
          disabled
          className="w-full border rounded px-4 py-2 bg-gray-100"
          placeholder="Location"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          placeholder="State"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          className="w-full border rounded px-4 py-2"
        />
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="Postal Code"
          className="w-full border rounded px-4 py-2"
        />

        <select
          value={speciality}
          onChange={(e) => setSpeciality(e.target.value)}
          className="w-full border rounded px-4 py-2"
        >
          <option value="General">General</option>
          <option value="Multi Speciality">Multi Speciality</option>
          <option value="Super Speciality">Super Speciality</option>
        </select>

        <div className="w-full">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip())}
              placeholder="Add Specialities (Press Enter)"
              className="flex-1 border rounded px-4 py-2"
            />
            <button onClick={addChip} className="px-4 py-2 bg-blue-600 text-white rounded">
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {specialities.map((chip) => (
              <span
                key={chip}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {chip}
                <button onClick={() => removeChip(chip)} className="text-red-500 font-bold ml-2">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Submit Profile
      </button>
    </div>
  )
}
