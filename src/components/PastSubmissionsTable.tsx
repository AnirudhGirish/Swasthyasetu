/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CSVLink } from "react-csv";

export default function PastSubmissionsTable() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const pageSize = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      const { data, error } = await supabase
        .from("resources")
        .select(`
          date, beds_used, total_beds, icu_beds_used, total_icu_beds,
          oxygen_units_used, total_oxygen_units, dialysis_machines_used, total_dialysis_machines,
          doctors_available, total_doctors_working,
          patients_below_16, patients_16_to_30, patients_30_to_50, patients_50_to_70, patients_above_70,
          male_patients, female_patients,
          er_visits, ot_usage,
          common_symptoms, weekly_diagnosis_summary,
          doctors_by_speciality, nurses_count, staff_to_patient_ratio
        `)
        .eq("hospital_id", userId)
        .order("date", { ascending: false });

      if (!error && data) {
        const enrichedData = data.map(item => ({
          ...item,
          total_patients: item.patients_below_16 + item.patients_16_to_30 + item.patients_30_to_50 + item.patients_50_to_70 + item.patients_above_70,
          bed_utilization: item.total_beds > 0 ? Math.round((item.beds_used / item.total_beds) * 100) : 0,
          icu_utilization: item.total_icu_beds > 0 ? Math.round((item.icu_beds_used / item.total_icu_beds) * 100) : 0,
          formatted_date: new Date(item.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          })
        }));
        setSubmissions(enrichedData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const headers = [
    { label: "Date", key: "date" },
    { label: "Beds Used", key: "beds_used" },
    { label: "Total Beds", key: "total_beds" },
    { label: "ICU Used", key: "icu_beds_used" },
    { label: "Total ICU", key: "total_icu_beds" },
    { label: "Oxygen Used", key: "oxygen_units_used" },
    { label: "Total Oxygen", key: "total_oxygen_units" },
    { label: "Dialysis Used", key: "dialysis_machines_used" },
    { label: "Total Dialysis", key: "total_dialysis_machines" },
    { label: "Doctors Available", key: "doctors_available" },
    { label: "Total Doctors", key: "total_doctors_working" },
    { label: "Patients <16", key: "patients_below_16" },
    { label: "Patients 16-30", key: "patients_16_to_30" },
    { label: "Patients 30-50", key: "patients_30_to_50" },
    { label: "Patients 50-70", key: "patients_50_to_70" },
    { label: "Patients 70+", key: "patients_above_70" },
    { label: "Male Patients", key: "male_patients" },
    { label: "Female Patients", key: "female_patients" },
    { label: "ER Visits", key: "er_visits" },
    { label: "OT Usage", key: "ot_usage" },
    { label: "Common Symptoms", key: "common_symptoms" },
    { label: "Weekly Summary", key: "weekly_diagnosis_summary" },
    { label: "Doctors by Speciality", key: "doctors_by_speciality" },
    { label: "Nurses Count", key: "nurses_count" },
    { label: "Staff Ratio", key: "staff_to_patient_ratio" },
  ];

  const filteredSubmissions = submissions.filter(submission =>
    submission.formatted_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.date.includes(searchTerm)
  );

  const currentData = filteredSubmissions.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredSubmissions.length / pageSize);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-50';
    if (utilization >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#e0e1dd] to-[#e0e1dd]/75 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Submission History</h2>
                <p className="text-black text-sm">Past daily reports and data exports</p>
              </div>
            </div>
            
            <CSVLink data={submissions} headers={headers} filename={`hospital-submissions-${new Date().toISOString().split('T')[0]}.csv`}>
              <button className="bg-white/20 hover:bg-white/30 text-black border border-black px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </CSVLink>
          </div>
        </div>

        <div className="p-8">
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading submission history...</p>
              </div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                {searchTerm ? `No submissions match "${searchTerm}"` : "No submissions yet. Start by submitting your first daily report."}
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">Total Submissions</h4>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{submissions.length}</p>
                </div>

                {submissions.length > 0 && (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-800">Avg Bed Usage</h4>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">%</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {Math.round(submissions.reduce((acc, item) => acc + item.bed_utilization, 0) / submissions.length)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-orange-800">Avg ICU Usage</h4>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">%</span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        {Math.round(submissions.reduce((acc, item) => acc + item.icu_utilization, 0) / submissions.length)}%
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-800">Avg Patients</h4>
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">
                        {Math.round(submissions.reduce((acc, item) => acc + item.total_patients, 0) / submissions.length)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Table */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">Date</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">Bed Usage</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">ICU Usage</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">Total Patients</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-800 border-b border-gray-200">Doctors</th>
                        <th className="px-6 py-4 text-center font-semibold text-gray-800 border-b border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((row, i) => (
                        <tr key={i} className="hover:bg-white transition-colors duration-200">
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className="font-medium text-gray-900">{row.formatted_date}</div>
                            <div className="text-xs text-gray-500">{row.date}</div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUtilizationColor(row.bed_utilization)}`}>
                              {row.bed_utilization}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{row.beds_used}/{row.total_beds}</div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUtilizationColor(row.icu_utilization)}`}>
                              {row.icu_utilization}%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{row.icu_beds_used}/{row.total_icu_beds}</div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className="font-medium text-gray-900">{row.total_patients}</div>
                            <div className="text-xs text-gray-500">M: {row.male_patients} / F: {row.female_patients}</div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100">
                            <div className="font-medium text-gray-900">{row.doctors_available}/{row.total_doctors_working}</div>
                            <div className="text-xs text-gray-500">Available/Total</div>
                          </td>
                          <td className="px-6 py-4 border-b border-gray-100 text-center">
                            <button
                              onClick={() => setSelectedSubmission(row)}
                              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-gray-600">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg font-medium transition-colors duration-200"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                    {page} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg font-medium transition-colors duration-200"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Submission Details</h3>
                  <p className="text-indigo-100">{selectedSubmission.formatted_date}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {headers.slice(1).map(header => (
                  <div key={header.key} className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">{header.label}</label>
                    <p className="text-lg font-medium text-gray-900">
                      {Array.isArray(selectedSubmission[header.key])
                        ? selectedSubmission[header.key].join(", ") || "None"
                        : typeof selectedSubmission[header.key] === "object"
                        ? JSON.stringify(selectedSubmission[header.key]) || "None"
                        : selectedSubmission[header.key] ?? "Not specified"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}