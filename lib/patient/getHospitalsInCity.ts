import { supabase } from '@/lib/supabase/client'

export async function getHospitalsInCity(city: string) {
  const { data, error } = await supabase
    .from('hospitals')
    .select('id, name, location')
    .ilike('location', `%${city}%`)

  if (error) {
    console.error('❌ Failed to fetch hospitals:', error.message)
    return []
  }

  return data
}
