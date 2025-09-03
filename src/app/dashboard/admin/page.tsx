/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import OverviewStats from './components/OverviewStats'
import CSVExportButton from './components/CSVExportButton'
import MissingSubmissions from './components/MissingSubmission'
import ResourceTrends from './components/ResourceTrends'
import AddHospitalForm from './components/AddHospitalForm'
import ForecastCard from './components/ForeCast'

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true)

      const [hospitalsRes, resourcesRes] = await Promise.all([
        supabase.from('hospitals').select('id, name, location'),
        supabase
          .from('resources')
          .select('*')
          .order('date', { ascending: false })
      ])

      if (!hospitalsRes.error && !resourcesRes.error) {
        setHospitals(hospitalsRes.data)
        setResources(resourcesRes.data)
      }

      setLoading(false)
    }

    fetchAdminData()
  }, [])

//   const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <OverviewStats />

      <div className="flex justify-end">
        <CSVExportButton />
      </div>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Registered Hospitals</h2>
          <table className="w-full text-sm border mb-6 text-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id}>
                  <td className="p-2">{h.id}</td>
                  <td className="p-2">{h.name}</td>
                  <td className="p-2">{h.location}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mb-2">Resource Submissions</h2>
          <table className="w-full text-sm border text-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Hospital ID</th>
                <th className="p-2">Date</th>
                <th className="p-2">Beds</th>
                <th className="p-2">ICU</th>
                <th className="p-2">Oxygen</th>
                <th className="p-2">Doctors</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td className="p-2">{r.hospital_id}</td>
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.beds_available}</td>
                  <td className="p-2">{r.icu_beds}</td>
                  <td className="p-2">{r.oxygen_units}</td>
                  <td className="p-2">{r.doctors_available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <MissingSubmissions/>
      <ResourceTrends/>
      <AddHospitalForm/>
      <ForecastCard />
    </div>
  )
}
