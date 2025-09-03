// src/lib/supabase/getUserRole.ts
import { supabase } from './client'

export async function getUserRole(): Promise<'PATIENT' | 'HOSPITAL' | 'HEALTH_DEPT' | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data?.role) {
    console.error('Role fetch error:', error?.message)
    return null
  }

  return data.role as 'PATIENT' | 'HOSPITAL' | 'HEALTH_DEPT'
}
