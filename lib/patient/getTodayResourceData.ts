import { supabase } from '@/lib/supabase/client'

export async function getTodayResourceData() {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('resources')
    .select('hospital_id, icu_beds, oxygen_units')
    .eq('date', today)

  if (error) {
    console.error('❌ Failed to fetch resource data:', error.message)
    return []
  }

  return data
}
