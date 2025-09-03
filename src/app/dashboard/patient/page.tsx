/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
// import { getCurrentPosition } from '@/lib/geolocation/getLocation'
import { getDiagnosisFromSymptoms } from '@/lib/ai/getDiagnosisFromSymptoms'
import EmergencyPanel from '@/src/components/patient/EmergencyPanel'
import HospitalList from '@/src/components/patient/HospitalList'

export default function PatientDashboard() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState<{ condition: string, urgency: string } | null>(null)
  // const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)

  // // Get geolocation once on load
  // useEffect(() => {
  //   getCurrentPosition().then((pos) => {
  //     if (pos) {
  //       setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
  //     }
  //     else {
  //       setCoords(null)
  //     }
  //   })
  // }, [])

  // Fetch latest public hospital data
  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('hospital_id, date, beds_available, icu_beds, oxygen_units')
        .eq('date', new Date().toISOString().split('T')[0])

      if (!error && data) setHospitals(data)
    }

    fetchResources()
  }, [])

  const handleSymptomSubmit = async () => {
    if (!symptoms) return alert('Please enter symptoms')

    const result = await getDiagnosisFromSymptoms(symptoms)

    if (!result) return alert('Could not get diagnosis')

    setDiagnosis(result)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Patient Dashboard</h1>
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
      {/* <table className="w-full text-sm border text-black">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Hospital ID</th>
            <th className="p-2">Beds</th>
            <th className="p-2">ICU</th>
            <th className="p-2">Oxygen</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h.hospital_id}>
              <td className="p-2">{h.hospital_id}</td>
              <td className="p-2">{h.beds_available}</td>
              <td className="p-2">{h.icu_beds}</td>
              <td className="p-2">{h.oxygen_units}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  )
}
