import { supabase } from './client'

export async function ensurePatientProfile(id: string, fullName: string, email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') return error

  if (!data) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id,
      full_name: fullName,
      email,
      role: 'PATIENT',
    })
    return insertError || null
  }

  return null
}
