"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Hospital {
  id: string;
  name: string;
  location: string | null;
  department_id: string;
}

interface Resource {
  hospital_id: string;
  date: string;
  beds_used: number;
  total_beds: number;
  icu_beds_used: number;
  total_icu_beds: number;
  oxygen_units_used: number;
  total_oxygen_units: number;
}
async function getHospitalsInCity(city: string): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from("hospitals")
    .select("id, name, location, department_id")
    .eq("location", city);

  if (error) {
    console.error("❌ Failed to fetch hospitals:", error.message);
    return [];
  }
  return data ?? []
}
async function getTodayResourceData(): Promise<Resource[]> {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  const { data, error } = await supabase
    .from("resources")
    .select(
      "hospital_id, date, beds_used, total_beds, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units"
    )
    .eq("date", today);

  if (error) {
    console.error("❌ getTodayResourceData failed:", error.message);
    return [];
  }

  return data;
}
export default function HospitalList() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<
    (Hospital & {
      beds: number;
      beds_total: number;
      icu_beds: number;
      icu_beds_total: number;
      oxygen_units: number;
      oxygen_total: number;
    })[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem("user_location");
      if (!stored) return;
      const { city } = JSON.parse(stored);
      const hospitalList = await getHospitalsInCity(city);
      const resourceData = await getTodayResourceData();

      const combined = hospitalList.map((h) => {
        const match = resourceData.find(
          (r) => r.hospital_id === h.department_id
        );
        return {
          ...h,
          beds: match?.beds_used ?? 0,
          beds_total: match?.total_beds ?? 0,
          icu_beds: match?.icu_beds_used ?? 0,
          icu_beds_total: match?.total_icu_beds ?? 0,
          oxygen_units: match?.oxygen_units_used ?? 0,
          oxygen_total: match?.total_oxygen_units ?? 0,
        };
      });

      setHospitals(combined);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border shadow">
      <h2 className="text-lg font-semibold mb-6">Hospitals in Your City</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading hospitals...</p>
      ) : hospitals.length === 0 ? (
        <p className="text-sm text-red-500">No hospitals found in your city.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{h.name}</h3>
              <p className="text-sm text-gray-700">
                Beds Available:{" "}
                <span className="font-medium">
                  {Math.max(h.beds_total - h.beds, 0)}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                ICU Beds Available:{" "}
                <span className="font-medium">
                  {Math.max(h.icu_beds_total - h.icu_beds, 0)}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Oxygen Units Available:{" "}
                <span className="font-medium">
                  {Math.max(h.oxygen_total - h.oxygen_units, 0)}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
