/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { getCurrentPosition } from '@/lib/geolocation/getLocation'

type Location = {
  country: string
  state: string
  city: string
}

export default function LocationSelector({
  onLocationSet,
}: {
  onLocationSet: (location: Location) => void
}) {
  const [manualMode, setManualMode] = useState(false)
  const [countries, setCountries] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [location, setLocation] = useState<Location>({
    country: '',
    state: '',
    city: '',
  })

  // On mount → try to auto-locate
  useEffect(() => {
    const stored = localStorage.getItem('user_location')
    if (stored) {
      onLocationSet(JSON.parse(stored))
      return
    }

    const detectLocation = async () => {
      const position = await getCurrentPosition()

      if (!position) {
        setManualMode(true)
        return
      }

      const { latitude, longitude } = position.coords

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
        const geo = await res.json()
        const detected: Location = {
          country: geo.address.country || '',
          state: geo.address.state || '',
          city:
            geo.address.city ||
            geo.address.town ||
            geo.address.village ||
            geo.address.county ||
            '',
        }

        localStorage.setItem('user_location', JSON.stringify(detected))
        onLocationSet(detected)
      } catch (err) {
        console.error('Geocoding failed:', err)
        setManualMode(true)
      }
    }

    detectLocation()
  }, [onLocationSet])

  // Fetch country list
  useEffect(() => {
    if (!manualMode) return

    const fetchCountries = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/positions')
        const json = await res.json()
        const countryNames = json.data.map((c: any) => c.name)
        setCountries(countryNames.sort())
        setLoading(false)
      } catch (err) {
        console.error('Failed to load countries:', err)
      }
    }

    fetchCountries()
  }, [manualMode])

  // Fetch states for selected country
  useEffect(() => {
    if (!location.country) return

    const fetchStates = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: location.country }),
        })
        const json = await res.json()
        setStates(json.data.states.map((s: any) => s.name).sort())
      } catch (err) {
        console.error('Failed to load states:', err)
      }
    }

    fetchStates()
  }, [location.country])

  // Fetch cities for selected state
  useEffect(() => {
    if (!location.state || !location.country) return

    const fetchCities = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: location.country,
            state: location.state,
          }),
        })
        const json = await res.json()
        setCities(json.data.sort())
      } catch (err) {
        console.error('Failed to load cities:', err)
      }
    }

    fetchCities()
  }, [location.state, location.country])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setLocation((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '', city: '' } : {}),
      ...(name === 'state' ? { city: '' } : {}),
    }))
  }

  const handleConfirm = () => {
    localStorage.setItem('user_location', JSON.stringify(location))
    onLocationSet(location)
  }

  if (!manualMode) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow border max-w-md">
      <h2 className="text-lg font-semibold mb-4">Select Your Location</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading countries...</p>
      ) : (
        <div className="space-y-4">
          <select
            name="country"
            value={location.country}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            name="state"
            value={location.state}
            onChange={handleChange}
            disabled={!location.country}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            name="city"
            value={location.city}
            onChange={handleChange}
            disabled={!location.state}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            disabled={!location.country || !location.state || !location.city}
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm Location
          </button>
        </div>
      )}
    </div>
  )
}
