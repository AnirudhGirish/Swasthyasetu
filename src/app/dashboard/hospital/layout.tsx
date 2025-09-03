// src/app/dashboard/hospital/layout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUserRole } from '@/lib/auth/useUserRole'

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role !== 'HOSPITAL') {
      router.replace('/unauthorized')
    }
  }, [role, loading, router])

  if (loading) return <p className="p-6 text-sm">Checking access...</p>
  if (role !== 'HOSPITAL') return null

  return <>{children}</>
}
