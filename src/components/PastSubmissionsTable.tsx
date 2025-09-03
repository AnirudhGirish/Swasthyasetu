/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { saveAs } from "file-saver";

const PAGE_SIZE = 10;

export default function PastSubmissionsTable() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const { count } = await supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("hospital_id", userId);

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("hospital_id", userId)
        .order("date", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (!error && data) {
        setSubmissions(data);
        setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
      }
    };

    fetchSubmissions();
  }, [page]);

  const handleExportCSV = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("hospital_id", userId)
      .order("date", { ascending: false });

    if (error || !data) {
      alert("Failed to export CSV: " + error?.message);
      return;
    }

    const headers = [
      "Date",
      "Beds Used",
      "Total Beds",
      "ICU Beds Used",
      "Total ICU Beds",
      "Oxygen Used",
      "Total Oxygen",
      "Dialysis Used",
      "Total Dialysis",
      "Doctors Available",
      "Total Doctors",
    ];

    const rows = data.map((entry) => [
      entry.date,
      entry.beds_used,
      entry.total_beds,
      entry.icu_beds_used,
      entry.total_icu_beds,
      entry.oxygen_units_used,
      entry.total_oxygen_units,
      entry.dialysis_machines_used,
      entry.total_dialysis_machines,
      entry.doctors_available,
      entry.total_doctors_working,
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "hospital-submissions.csv");
  };

  return (
    <div className="mt-12 bg-white p-6 border rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Past Submissions</h2>
        <button
          onClick={handleExportCSV}
          className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-3 border">Date</th>
            <th className="py-2 px-3 border">Beds</th>
            <th className="py-2 px-3 border">ICU</th>
            <th className="py-2 px-3 border">Oxygen</th>
            <th className="py-2 px-3 border">Dialysis</th>
            <th className="py-2 px-3 border">Doctors</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((item) => (
            <tr key={item.id} className="text-center">
              <td className="py-2 px-3 border">{format(new Date(item.date), "dd MMM yyyy")}</td>
              <td className="py-2 px-3 border">{item.beds_used}/{item.total_beds}</td>
              <td className="py-2 px-3 border">{item.icu_beds_used}/{item.total_icu_beds}</td>
              <td className="py-2 px-3 border">{item.oxygen_units_used}/{item.total_oxygen_units}</td>
              <td className="py-2 px-3 border">{item.dialysis_machines_used}/{item.total_dialysis_machines}</td>
              <td className="py-2 px-3 border">{item.doctors_available}/{item.total_doctors_working}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-1 bg-gray-300 text-sm rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-1 bg-gray-300 text-sm rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
