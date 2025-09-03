// src/app/dashboard/hospital/layout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUserRole } from '@/lib/auth/useUserRole'

export default function HealthDeptLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    if (!loading && role !== 'HEALTH_DEPT') {
      router.replace('/unauthorized')
    }
  }, [role, loading, router])

  if (loading) return <p className="p-6 text-sm">Checking access...</p>
  if (role !== 'HEALTH_DEPT') return null

  return <>{children}</>
}
