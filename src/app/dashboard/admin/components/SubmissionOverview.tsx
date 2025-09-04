/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

interface Hospital {
  id: string
  name: string
  location: string | null
  department_id: string
}

export default function SubmissionOverview() {
  const [submittedCount, setSubmittedCount] = useState(0)
  const [missedCount, setMissedCount] = useState(0)
  const [missedHospitals, setMissedHospitals] = useState<Hospital[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const locationStr = localStorage.getItem("user_location")
      if (!locationStr) return

      const { city } = JSON.parse(locationStr)
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      })

      // 1. Get all hospitals in current city
      const { data: hospitals, error: hospitalsError } = await supabase
        .from("hospitals")
        .select("id, name, location, department_id")

      if (!hospitals || hospitalsError) return

      const cityHospitals = hospitals.filter((h) => {
        if (!h.location) return false
        try {
          return h.location === city
        } catch {
          return false
        }
      })
      const hospitalProfileIds = cityHospitals.map((h) => h.department_id)

      // 2. Get today's submissions from resources
      const { data: submissions, error: submissionError } = await supabase
        .from("resources")
        .select("hospital_id")
        .eq("date", today)

      if (!submissions || submissionError) return
      const submittedHospitalIds = new Set(
        submissions.map((s) => s.hospital_id)
      )

      const missed = cityHospitals.filter(
        (h) => !submittedHospitalIds.has(h.department_id)
      )

      setSubmittedCount(cityHospitals.length - missed.length)
      setMissedCount(missed.length)
      setMissedHospitals(missed)
    }

    fetchData()
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">Daily Submission Status</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-green-100 text-green-800 p-4 rounded-xl">
          <p className="font-semibold text-lg">Submitted</p>
          <p className="text-2xl font-bold">{submittedCount}</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-xl">
          <p className="font-semibold text-lg">Missed</p>
          <p className="text-2xl font-bold">{missedCount}</p>
        </div>
      </div>

      {missedHospitals.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">
            Hospitals that missed today&apos;s submission:
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {missedHospitals.map((h) => (
              <li key={h.department_id}>{h.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
