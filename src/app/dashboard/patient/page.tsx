/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getDiagnosisFromSymptoms } from '@/lib/ai/getDiagnosisFromSymptoms'
import EmergencyPanel from '@/src/components/patient/EmergencyPanel'
import HospitalList from '@/src/components/patient/HospitalList'
import LogoutButton from '@/src/components/auth/LogoutButton'

export default function PatientDashboard() {
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState<{ condition: string, urgency: string } | null>(null)

  const handleSymptomSubmit = async () => {
    if (!symptoms) return alert('Please enter symptoms')

    const result = await getDiagnosisFromSymptoms(symptoms)

    if (!result) return alert('Could not get diagnosis')

    setDiagnosis(result)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className='flex justify-between'>
        <h1 className="text-xl font-bold mb-4">Patient Dashboard</h1>
        <LogoutButton />
      </div>
      
      <EmergencyPanel />
      <div className="mb-6 mt-4">
        <label className="block mb-2 font-medium">Describe your symptoms:</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}  
          className="w-full border rounded p-2 h-24 text-sm"
          placeholder="e.g. shortness of breath, chest pain"
        />
        <button
          onClick={handleSymptomSubmit}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Get Diagnosis
        </button>
      </div>

      {diagnosis && (
        <div className="mb-6 border rounded p-4 bg-gray-50 text-black">
          <h2 className="font-semibold text-lg mb-2">AI Prediction</h2>
          <p><strong>Condition:</strong> {diagnosis.condition}</p>
          <p><strong>Urgency:</strong> {diagnosis.urgency}</p>
        </div>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-2">Nearby Hospitals</h2>
      <HospitalList />
    </div>
  )
}
