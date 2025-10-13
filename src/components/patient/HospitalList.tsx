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
      console.log("city: ",city)
      const hospitalList = await getHospitalsInCity(city);
      console.log("hl: ",hospitalList)
      const resourceData = await getTodayResourceData();
      console.log("resources: ",resourceData)

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

  const getAvailabilityColor = (used: number, total: number) => {
    if (total === 0) return 'text-gray-500';
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAvailabilityBg = (used: number, total: number) => {
    if (total === 0) return 'bg-gray-100';
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'bg-red-50 border-red-200';
    if (percentage >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const ResourceCard = ({ 
    icon, 
    title, 
    available, 
    total, 
    unit 
  }: { 
    icon: string, 
    title: string, 
    available: number, 
    total: number, 
    unit: string 
  }) => (
    <div className={`p-4 rounded-xl border-2 ${getAvailabilityBg(total - available, total)} transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-bold ${getAvailabilityColor(total - available, total)}`}>
          {total === 0 ? 'N/A' : `${Math.round(((total - (total - available)) / total) * 100)}%`}
        </span>
      </div>
      <h4 className="font-semibold text-gray-800 text-sm mb-1">{title}</h4>
      <p className={`text-lg font-bold ${getAvailabilityColor(total - available, total)}`}>
        {available} {unit}
      </p>
      <p className="text-xs text-gray-600">of {total} total</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Nearby Hospitals</h2>
            <p className="text-green-100 text-sm">Real-time availability in your area</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading hospital information...</p>
            </div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Hospitals Found</h3>
            <p className="text-gray-600">No healthcare facilities found in your current location. Please check your location settings or contact local health authorities.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-green-50 border border-green-400 rounded-2xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800 font-medium">
                  Real-time data updated today. Availability may change rapidly during peak hours.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
                >
                  {/* Hospital Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
                        <p className="text-sm text-gray-600">{hospital.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Live Data</span>
                    </div>
                  </div>

                  {/* Resource Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ResourceCard
                      icon="🛏️"
                      title="General Beds"
                      available={Math.max(hospital.beds_total - hospital.beds, 0)}
                      total={hospital.beds_total}
                      unit="available"
                    />
                    <ResourceCard
                      icon="🏥"
                      title="ICU Beds"
                      available={Math.max(hospital.icu_beds_total - hospital.icu_beds, 0)}
                      total={hospital.icu_beds_total}
                      unit="available"
                    />
                    <ResourceCard
                      icon="💨"
                      title="Oxygen Units"
                      available={Math.max(hospital.oxygen_total - hospital.oxygen_units, 0)}
                      total={hospital.oxygen_total}
                      unit="available"
                    />
                  </div>

                  {/* Contact Action */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full bg-gradient-to-r from-green-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Contact Hospital</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Availability Legend</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Good:</strong> 70%+ available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Limited:</strong> 30-70% available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>Critical:</strong> Less than 30% available</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}