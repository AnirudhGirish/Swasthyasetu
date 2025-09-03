'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AddHospitalForm() {
  const [form, setForm] = useState({ name: '', location: '', email: '' })
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    const { name, location, email } = form

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      setStatus({ message: 'Not authenticated', type: 'error' })
      setSubmitting(false)
      return
    }

    // ✅ Insert into authorized_hospitals
    const { error: insertError } = await supabase.from('authorized_hospitals').insert({
      email,
      name,
      location,
      added_by: userData.user.id,
    })

    if (insertError) {
      setStatus({ message: `Insert failed: ${insertError.message}`, type: 'error' })
    } else {
      setStatus({ message: 'Hospital added and Gmail authorized successfully ✅', type: 'success' })
      setForm({ name: '', location: '', email: '' })
    }

    setSubmitting(false)
  }

  return (
    <div className="mt-10 max-w-xl bg-white border rounded shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Add New Hospital</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hospital Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hospital Gmail ID</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          {submitting ? 'Adding...' : 'Add Hospital'}
        </button>
      </form>

      {status && (
        <div
          className={`mt-4 text-sm ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  )
}











// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase/client";

// export default function AddHospitalForm() {
//   const [form, setForm] = useState({ name: "", location: "", email: "" });
//   const [status, setStatus] = useState<{
//     message: string;
//     type: "success" | "error";
//   } | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setStatus(null);

//     const { name, location, email } = form;

//     // Step 1: Get admin user ID
//     const { data: userData, error: userError } = await supabase.auth.getUser();
//     if (userError || !userData?.user) {
//       setStatus({ message: "Not authenticated", type: "error" });
//       setSubmitting(false);
//       return;
//     }

//     // Step 2: Insert placeholder profile with role = HOSPITAL and given Gmail
//     const { error: profileError } = await supabase.from("profiles").insert({
//       email,
//       role: "HOSPITAL",
//       full_name: name,
//     });

//     if (profileError) {
//       setStatus({
//         message: `Profile insert failed: ${profileError.message}`,
//         type: "error",
//       });
//       setSubmitting(false);
//       return;
//     }

//     // Step 3: Insert hospital record
//     const { error: hospitalError } = await supabase.from("hospitals").insert({
//       name,
//       location,
//       department_id: userData.user.id,
//     });

//     if (hospitalError) {
//       setStatus({
//         message: `Hospital insert failed: ${hospitalError.message}`,
//         type: "error",
//       });
//     } else {
//       setStatus({
//         message: "Hospital added and Gmail authorized successfully ✅",
//         type: "success",
//       });
//       setForm({ name: "", location: "", email: "" });
//     }

//     setSubmitting(false);
//   };

//   return (
//     <div className="mt-10 max-w-xl bg-white border rounded shadow-sm p-6">
//       <h2 className="text-lg font-semibold mb-4">Add New Hospital</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Hospital Name
//           </label>
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             required
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Location</label>
//           <input
//             type="text"
//             name="location"
//             value={form.location}
//             onChange={handleChange}
//             required
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Hospital Gmail ID
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={submitting}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
//         >
//           {submitting ? "Adding..." : "Add Hospital"}
//         </button>
//       </form>

//       {status && (
//         <div
//           className={`mt-4 text-sm ${
//             status.type === "success" ? "text-green-600" : "text-red-600"
//           }`}
//         >
//           {status.message}
//         </div>
//       )}
//     </div>
//   );
// }
