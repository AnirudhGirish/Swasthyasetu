// src/lib/supabase/uploadHospitalData.ts
import { supabase } from './client'

export async function uploadHospitalData(data: {
  date: string
  beds_available: number
  icu_beds: number
  oxygen_units: number
  dialysis_machines: number
  doctors_available: number
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase.from('resources').insert({
    hospital_id: user.id,
    ...data
  })

  if (error) {
    throw new Error(error.message)
  }

  return true
}
