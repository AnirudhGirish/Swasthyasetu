/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function MissingSubmissions() {
  const [missingHospitals, setMissingHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMissing = async () => {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // 1. Fetch all hospitals
      const { data: hospitals, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name, location')

      if (hospitalsError || !hospitals) return

      // 2. Fetch today's submissions
      const { data: submitted, error: submissionError } = await supabase
        .from('resources')
        .select('hospital_id')
        .eq('date', today)

      const submittedIds = submitted?.map((r) => r.hospital_id) || []

      // 3. Filter hospitals that are missing
      const missing = hospitals.filter((h) => !submittedIds.includes(h.id))

      setMissingHospitals(missing)
      setLoading(false)
    }

    fetchMissing()
  }, [])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Hospitals Missing Submission Today</h2>
      {loading ? (
        <p>Loading...</p>
      ) : missingHospitals.length === 0 ? (
        <p className="text-green-700">All hospitals have submitted today ✅</p>
      ) : (
        <ul className="list-disc pl-6 text-sm text-red-700">
          {missingHospitals.map((h) => (
            <li key={h.id}>
              <strong>{h.name}</strong> – {h.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
