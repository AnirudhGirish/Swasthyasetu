// src/app/dashboard/hospital/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { uploadHospitalData } from '@/lib/supabase/uploadHospitalData'
import { supabase } from '@/lib/supabase/client'

const today = new Date().toISOString().split('T')[0]

export default function HospitalDashboard() {
  const [formData, setFormData] = useState({
    beds_available: 0,
    icu_beds: 0,
    oxygen_units: 0,
    dialysis_machines: 0,
    doctors_available: 0
  })

  const [submitted, setSubmitted] = useState(false)
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [history, setHistory] = useState<any[]>([])


  useEffect(() => {
    const fetchHistory = async () => {
      const {
        data,
        error
      } = await supabase
        .from('resources')
        .select('*')
        .eq('hospital_id', (await supabase.auth.getUser()).data.user?.id)
        .order('date', { ascending: false })

      if (!error && data) {
        setHistory(data)
        setSubmitted(data.some(d => d.date === today))
      }
    }

    fetchHistory()
  }, [submitted])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleSubmit = async () => {
    try {
      await uploadHospitalData({ ...formData, date: today })
      setSubmitted(true)
    } catch (err) {
      alert(`Error: ${(err as Error).message}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Hospital Dashboard</h1>

      {submitted ? (
        <p className="text-green-600 mb-4">
          You have already submitted data for ({today}).
        </p>
      ) : (
        <div className="grid gap-4 max-w-md">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="capitalize">{key.replace(/_/g, ' ')}</label>
              <input
                type="number"
                name={key}
                value={formData[key as keyof typeof formData]}
                onChange={handleChange}
                className="border rounded px-2 py-1"
              />
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Submit Today&apos;s Data
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold mt-8">Previous Submissions</h2>
      <table className="mt-4 text-sm w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Date</th>
            <th className="p-2">Beds</th>
            <th className="p-2">ICU</th>
            <th className="p-2">O2</th>
            <th className="p-2">Dialysis</th>
            <th className="p-2">Doctors</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id}>
              <td className="p-2">{entry.date}</td>
              <td className="p-2">{entry.beds_available}</td>
              <td className="p-2">{entry.icu_beds}</td>
              <td className="p-2">{entry.oxygen_units}</td>
              <td className="p-2">{entry.dialysis_machines}</td>
              <td className="p-2">{entry.doctors_available}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
