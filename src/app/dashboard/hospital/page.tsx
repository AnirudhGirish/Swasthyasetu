"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ResourceTrendChart from "@/src/components/ResourceTrendChart";
import AIInsightsPanel from "@/src/components/patient/AiResourceAnalyser";
import PastSubmissionsTable from "@/src/components/PastSubmissionsTable";

export default function HospitalDashboard() {
  const [hospitalName, setHospitalName] = useState("");
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [bedsUsed, setBedsUsed] = useState(0);
  const [totalBeds, setTotalBeds] = useState(0);
  const [icuUsed, setIcuUsed] = useState(0);
  const [totalIcu, setTotalIcu] = useState(0);
  const [oxygenUsed, setOxygenUsed] = useState(0);
  const [totalOxygen, setTotalOxygen] = useState(0);
  const [dialysisUsed, setDialysisUsed] = useState(0);
  const [totalDialysis, setTotalDialysis] = useState(0);
  const [doctorsAvailable, setDoctorsAvailable] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (hospitalName) return;

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;
      console.log("Querying hospital for userId:", userId);

      const { data: hospital } = await supabase
        .from("hospitals")
        .select("name")
        .eq("department_id", userId)
        .maybeSingle();

      setHospitalName(hospital?.name ?? "");

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
    if (
      bedsUsed > totalBeds ||
      icuUsed > totalIcu ||
      oxygenUsed > totalOxygen ||
      dialysisUsed > totalDialysis ||
      doctorsAvailable > totalDoctors
    ) {
      alert("⚠️ Used values cannot exceed total values for any field.");
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
      beds_used: bedsUsed,
      total_beds: totalBeds,
      icu_beds_used: icuUsed,
      total_icu_beds: totalIcu,
      oxygen_units_used: oxygenUsed,
      total_oxygen_units: totalOxygen,
      dialysis_machines_used: dialysisUsed,
      total_dialysis_machines: totalDialysis,
      doctors_available: doctorsAvailable,
      total_doctors_working: totalDoctors,
    });

    setLoading(false);

    if (error) {
      alert("Failed to submit: " + error.message);
    } else {
      alert("Submitted successfully");
      setLastSubmission(today);
    }
        setBedsUsed(0);
    setTotalBeds(0);
    setIcuUsed(0);
    setTotalIcu(0);
    setOxygenUsed(0);
    setTotalOxygen(0);
    setDialysisUsed(0);
    setTotalDialysis(0);
    setDoctorsAvailable(0);
    setTotalDoctors(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
      <p className="text-lg text-gray-700">Welcome, {hospitalName}</p>

      <div className="bg-gray-100 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold">Last Submission:</h2>
        <p>{lastSubmission ?? "No submissions yet."}</p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow space-y-4">
        <h2 className="text-xl font-semibold">Submit Today’s Data</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Beds */}
          <div className="bg-gray-300 p-4 rounded-2xl">
            <div>
              <label className="block font-medium">Beds Used</label>
              <input
                type="number"
                value={bedsUsed === 0 ? "" : bedsUsed}
                onChange={(e) => setBedsUsed(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium">Total Beds</label>
              <input
                type="number"
                value={totalBeds === 0 ? "" : totalBeds}
                onChange={(e) => setTotalBeds(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="bg-gray-300 p-4 rounded-2xl">
            {/* ICU Beds */}
            <div>
              <label className="block font-medium">ICU Beds Used</label>
              <input
                type="number"
                value={icuUsed === 0 ? "" : icuUsed}
                onChange={(e) => setIcuUsed(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium">Total ICU Beds</label>
              <input
                type="number"
                value={totalIcu === 0 ? "" : totalIcu}
                onChange={(e) => setTotalIcu(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="bg-gray-300 p-4 rounded-2xl">
            {/* Oxygen Units */}
            <div>
              <label className="block font-medium">Oxygen Units Used</label>
              <input
                type="number"
                value={oxygenUsed === 0 ? "" : oxygenUsed}
                onChange={(e) => setOxygenUsed(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium">Total Oxygen Units</label>
              <input
                type="number"
                value={totalOxygen === 0 ? "" : totalOxygen}
                onChange={(e) => setTotalOxygen(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
          <div className="bg-gray-300 p-4 rounded-2xl">
            {/* Dialysis Machines */}
            <div>
              <label className="block font-medium">
                Dialysis Machines Used
              </label>
              <input
                type="number"
                value={dialysisUsed === 0 ? "" : dialysisUsed}
                onChange={(e) => setDialysisUsed(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium">
                Total Dialysis Machines
              </label>
              <input
                type="number"
                value={totalDialysis === 0 ? "" : totalDialysis}
                onChange={(e) => setTotalDialysis(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div className="bg-gray-300 p-4 rounded-2xl">
            {/* Doctors */}
            <div>
              <label className="block font-medium">Doctors Available</label>
              <input
                type="number"
                value={doctorsAvailable === 0 ? "" : doctorsAvailable}
                onChange={(e) => setDoctorsAvailable(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium">Total Doctors Working</label>
              <input
                type="number"
                value={totalDoctors === 0 ? "" : totalDoctors}
                onChange={(e) => setTotalDoctors(+e.target.value || 0)}
                placeholder="0"
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
        >
          {loading ? "Submitting..." : "Submit Data"}
        </button>
      </div>
      <ResourceTrendChart />
      <AIInsightsPanel />
      <PastSubmissionsTable />
    </div>
  );
}
