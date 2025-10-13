/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ResourceTrendChart from "@/src/components/ResourceTrendChart";
import AIInsightsPanel from "@/src/components/patient/AiResourceAnalyser";
import PastSubmissionsTable from "@/src/components/PastSubmissionsTable";
import LogoutButton from "@/src/components/auth/LogoutButton";
import Image from "next/image";

export default function HospitalDashboard() {
  const [hospitalName, setHospitalName] = useState("");
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<any>(null);

  const initialForm = {
    beds_used: "" as number | "",
    total_beds: "" as number | "",
    icu_beds_used: "" as number | "",
    total_icu_beds: "" as number | "",
    oxygen_units_used: "" as number | "",
    total_oxygen_units: "" as number | "",
    dialysis_machines_used: "" as number | "",
    total_dialysis_machines: "" as number | "",
    doctors_available: "" as number | "",
    total_doctors_working: "" as number | "",
    patients_below_16: "" as number | "",
    patients_16_to_30: "" as number | "",
    patients_30_to_50: "" as number | "",
    patients_50_to_70: "" as number | "",
    patients_above_70: "" as number | "",
    male_patients: "" as number | "",
    female_patients: "" as number | "",
    er_visits: "" as number | "",
    ot_usage: "" as number | "",
    common_symptoms: [] as string[],
    weekly_diagnosis_summary: "",
    doctors_by_speciality: {} as Record<string, number>,
    nurses_count: "" as number | "",
    staff_to_patient_ratio: "" as number | "",
  };

  const [form, setForm] = useState(initialForm);

  const labels: Record<string, string> = {
  beds_used: "Beds Occupied",
  total_beds: "Beds Available",
  icu_beds_used: "ICU Beds Occupied",
  total_icu_beds: "ICU Beds Available",
  oxygen_units_used: "Oxygen Units Used",
  total_oxygen_units: "Total Oxygen Units",
  dialysis_machines_used: "Dialysis Machines In Use",
  total_dialysis_machines: "Total Dialysis Machines",
  doctors_available: "Doctors On Duty",
  total_doctors_working: "Total Number of Doctors",

  patients_below_16: "Patients Below 16",
  patients_16_to_30: "Patients Between 16–30",
  patients_30_to_50: "Patients Between 30–50",
  patients_50_to_70: "Patients Between 50–70",
  patients_above_70: "Patients Above 70",
  male_patients: "Male Patients",
  female_patients: "Female Patients",

  er_visits: "ER Visits",
  ot_usage: "OT Utilization",
  nurses_count: "Nurses On Duty",
  staff_to_patient_ratio: "Staff to Patient Ratio",
};


  const [symptomInput, setSymptomInput] = useState("");
  const [specialityKey, setSpecialityKey] = useState("");
  const [specialityValue, setSpecialityValue] = useState(0);

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      setLocation(JSON.parse(stored));
    }

    if (hospitalName) return;
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      const { data: hospital } = await supabase
        .from("hospitals")
        .select("name")
        .eq("department_id", userId)
        .maybeSingle();
      setHospitalName(hospital?.name ?? "Unknown Hospital");

      const { data: submissions } = await supabase
        .from("resources")
        .select("date")
        .eq("hospital_id", userId)
        .order("date", { ascending: false });
      if (submissions && submissions.length > 0) {
        setLastSubmission(submissions[0].date);
      }
    };
    fetchData();
  }, [hospitalName]);

  const handleSubmit = async () => {
    if (lastSubmission === today) {
      alert(
        `Data already submitted for today (${today}). Please wait until tomorrow for the next submission.`
      );
      return;
    }

    // Convert "" back to 0 for Supabase
    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? 0 : v])
    );

    if (
      (cleanedForm.beds_used as number) > (cleanedForm.total_beds as number) ||
      (cleanedForm.icu_beds_used as number) > (cleanedForm.total_icu_beds as number) ||
      (cleanedForm.oxygen_units_used as number) > (cleanedForm.total_oxygen_units as number) ||
      (cleanedForm.dialysis_machines_used as number) > (cleanedForm.total_dialysis_machines as number) ||
      (cleanedForm.doctors_available as number) > (cleanedForm.total_doctors_working as number)
    ) {
      alert("⚠️ Used values cannot exceed total values for any resource.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;
    const { error } = await supabase.from("resources").insert({
      hospital_id: userId,
      date: today,
      ...cleanedForm,
    });
    setLoading(false);

    if (error) {
      alert("Failed to submit data: " + error.message);
    } else {
      alert("Data submitted successfully!");
      setLastSubmission(today);
      setShowModal(false);
      setForm(initialForm); // ✅ reset to blank form
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setForm((prev) => ({
        ...prev,
        common_symptoms: [...prev.common_symptoms, symptomInput.trim()],
      }));
      setSymptomInput("");
    }
  };

  const removeSymptom = (index: number) => {
    setForm((prev) => ({
      ...prev,
      common_symptoms: prev.common_symptoms.filter((_, i) => i !== index),
    }));
  };

  const addSpeciality = () => {
    if (specialityKey.trim() && specialityValue > 0) {
      setForm((prev) => ({
        ...prev,
        doctors_by_speciality: {
          ...prev.doctors_by_speciality,
          [specialityKey.trim()]: specialityValue,
        },
      }));
      setSpecialityKey("");
      setSpecialityValue(0);
    }
  };

  const removeSpeciality = (key: string) => {
    const updated = { ...form.doctors_by_speciality };
    delete updated[key];
    setForm((prev) => ({ ...prev, doctors_by_speciality: updated }));
  };

    const handleInputChange = (key: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: val === "" ? "" : Number(val),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-sky-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <Image alt="logo" src="/logo.png" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-700 to-sky-800 bg-clip-text text-transparent">
                Swasthya
                <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Setu
                </span>
              </h1>
              <p className="text-sm text-gray-600 -mt-1">Hospital Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {location && (
              <div className="flex items-center space-x-2 bg-sky-50 px-3 py-2 rounded-full border border-sky-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">
                  {location.city}, {location.state}
                </span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100 rounded-3xl p-8 border border-sky-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {hospitalName}
              </h2>
              <p className="text-lg text-gray-700">
                Manage your hospital resources and submit daily data reports
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Status */}
          <div className="bg-white rounded-3xl shadow-xl border border-sky-200 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Submission Status
                </h3>
                <p className="text-gray-600">Daily data reporting</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Last Submission:
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {lastSubmission || "No submissions yet"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Today&apos;s Status:
                </p>
                <div className="flex items-center space-x-2">
                  {lastSubmission === today ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-semibold">
                        Completed
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-orange-700 font-semibold">
                        Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-xl border border-sky-200 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Quick Actions
                </h3>
                <p className="text-gray-600">Daily operations</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowModal(true)}
                disabled={lastSubmission === today}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-sky-200 disabled:to-sky-100 text-white disabled:text-gray-500 py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>
                  {lastSubmission === today
                    ? "Data Already Submitted"
                    : "Submit Today's Data"}
                </span>
              </button>

              {lastSubmission === today && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-sky-800 font-medium">
                      Today&apos;s data has been successfully submitted. Next
                      submission available tomorrow.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <ResourceTrendChart />
        <AIInsightsPanel />
        <PastSubmissionsTable />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-sky-200 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Submit Daily Hospital Data
                    </h2>
                    <p className="text-sky-100 text-sm">Date: {today}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Resource Data */}
              <div className="bg-sky-100/75 p-3 rounded-xl border border-sky-400">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Resource Utilization & Staff
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "beds_used",
                    "total_beds",
                    "icu_beds_used",
                    "total_icu_beds",
                    "oxygen_units_used",
                    "total_oxygen_units",
                    "dialysis_machines_used",
                    "total_dialysis_machines",
                    "doctors_available",
                    "total_doctors_working",
                  ].map((key) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-xl border border-black/50">
                      <label className="block font-semibold text-gray-700 mb-2">
                        {labels[key]
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={(form as any)[key]}
                        onChange={(e) =>
                          handleInputChange(key, e.target.value)
                        }
                        placeholder="Enter number"
                        className="w-full border px-3 py-2 rounded border-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-sky-100/75 p-3 rounded-xl border border-sky-400">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Patient Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "male_patients",
                    "female_patients",
                    "patients_below_16",
                    "patients_16_to_30",
                    "patients_30_to_50",
                    "patients_50_to_70",
                    "patients_above_70",
                  ].map((key) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-xl border border-black/50">
                      <label className="block font-semibold text-gray-700 mb-2">
                        {labels[key]
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={(form as any)[key]}
                        placeholder="Enter number"
                        onChange={(e) =>
                          handleInputChange(key, e.target.value)
                        }
                        className="w-full border px-3 py-2 rounded border border-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3 */}
              <div className="bg-sky-100/75 p-3 rounded-xl border border-sky-400">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Operations & Staffing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    "er_visits",
                    "ot_usage",
                    "nurses_count",
                    "staff_to_patient_ratio",
                  ].map((key) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-xl border border-black/50">
                      <label className="block font-semibold text-gray-700 mb-2">
                        {labels[key]
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        value={(form as any)[key]}
                        placeholder="Enter number"
                        onChange={(e) =>
                          handleInputChange(key, e.target.value)
                        }
                        className="w-full border px-3 py-2 rounded border border-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Medical Observations of the Week
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-500">
                  <textarea
                    value={form.weekly_diagnosis_summary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        weekly_diagnosis_summary: e.target.value,
                      }))
                    }
                    placeholder="Provide a summary of common diagnoses, trends, or notable medical observations this week..."
                    className="w-full border-2 border-gray-300 rounded-xl p-4 h-32 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              {/* Common Symptoms */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Common Symptoms
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-500">
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder="e.g., fever, headache, cough"
                      className="flex-1 border-2 border-gray-300 rounded-xl p-3 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all duration-300"
                    />
                    <button
                      onClick={addSymptom}
                      className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {form.common_symptoms.map((symptom, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center space-x-2 border border-blue-200"
                      >
                        <span className="font-medium">{symptom}</span>
                        <button
                          onClick={() => removeSymptom(index)}
                          className="w-5 h-5 bg-blue-200 hover:bg-blue-300 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Doctors by Speciality */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Speciality Doctors
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-500">
                  <div className="flex space-x-3 mb-4">
                    <input
                      type="text"
                      value={specialityKey}
                      onChange={(e) => setSpecialityKey(e.target.value)}
                      placeholder="e.g., Cardiology, Neurology"
                      className="flex-1 border-2 border-gray-300 rounded-xl p-3 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all duration-300"
                    />
                    <input
                      type="number"
                      value={specialityValue}
                      onChange={(e) => setSpecialityValue(+e.target.value || 0)}
                      placeholder="Count"
                      className="w-24 border-2 border-gray-300 rounded-xl p-3 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all duration-300"
                    />
                    <button
                      onClick={addSpeciality}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(form.doctors_by_speciality).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center space-x-2 border border-green-200"
                        >
                          <span className="font-medium">
                            {key}: {val}
                          </span>
                          <button
                            onClick={() => removeSpeciality(key)}
                            className="w-5 h-5 bg-green-200 hover:bg-green-300 rounded-full flex items-center justify-center transition-colors duration-200"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Submit Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
