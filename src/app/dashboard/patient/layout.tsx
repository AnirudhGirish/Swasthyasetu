// src/app/dashboard/patient/layout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUserRole } from '@/lib/auth/useUserRole'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role !== 'PATIENT') {
      router.replace('/unauthorized')
    }
  }, [role, loading, router])

  if (loading) return <p className="p-4 text-sm">Loading...</p>
  if (role !== 'PATIENT') return null

  return <>{children}</>
}
