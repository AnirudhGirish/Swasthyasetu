'use client'

import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation' 
import LocationSelector from '../components/LocationSelector'
import { LoginButton } from '../components/auth/LoginButton'

type Location = {
  country: string
  state: string
  city: string
}

export default function HomePage() {
  const [locationReady, setLocationReady] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)

  // const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('user_location')
    if (stored) {
      const parsed = JSON.parse(stored)
      setLocation(parsed)
      setLocationReady(true)
    }
  }, [])

  const handleLocationSet = (loc: Location) => {
    setLocation(loc)
    setLocationReady(true)
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-20">
      {!locationReady ? (
        <LocationSelector onLocationSet={handleLocationSet} />
      ) : (
        <div className="space-y-6 text-center">
          <h1 className="text-2xl font-bold">Welcome to SwasthyaSetu</h1>
          <p className="text-gray-600">Your Health, Our Intelligence</p>

          {location && (
            <p className="text-sm text-gray-500">
              📍 Location: <strong>{location.city}, {location.state}, {location.country}</strong>
            </p>
          )}

          <LoginButton />
        </div>
      )}
    </main>
  )
}
