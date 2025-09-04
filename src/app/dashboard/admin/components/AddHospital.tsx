"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function AddHospitalForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name || !email) {
      alert("Please fill all fields")
      return
    }

    const locationStr = localStorage.getItem("user_location")
    if (!locationStr) {
      alert("No location found. Please set location first.")
      return
    }

    const {city} = JSON.parse(locationStr)

    const {data: {user}, error: userError} = await supabase.auth.getUser()
    if(userError || !user){
        alert("Failed to fetch current user")
        return
    }
    setLoading(true)

    const { error } = await supabase.from("authorized_hospitals").insert({
      name,
      email,
      location:city,
      added_by: user.id
    })

    setLoading(false)

    if (error) {
      alert("Insert failed: " + error.message)
    } else {
      alert("Hospital added successfully!")
      setName("")
      setEmail("")
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-xl font-bold">Add New Hospital</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Hospital Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. City Hospital"
          />
        </div>
        {/* <div>
          <label className="block text-sm font-medium">Speciality</label>
          <input
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. Cardiology"
          />
        </div> */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Hospital Gmail ID</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. hospital123@gmail.com"
          />
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Adding..." : "Add Hospital"}
      </button>
    </div>
  )
}
