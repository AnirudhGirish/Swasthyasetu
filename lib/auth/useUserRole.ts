
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch user role:', error.message)
        setRole(null)
      } else {
        setRole(data.role)
      }

      setLoading(false)
    }

    fetchRole()
  }, [])

  return { role, loading }
}
