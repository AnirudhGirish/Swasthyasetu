"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Hospital {
  name: string;
  location: string | null;
}

async function getHospitalsInCity(city: string): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from("public_hospitals") // ✅ use the safe view
    .select("name, location")
    .eq("location", city);

  if (error) {
    console.error("❌ Failed to fetch hospitals:", error.message);
    return [];
  }
  return data ?? [];
}

export default function HospitalList() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem("user_location");
      if (!stored) return;

      const { city } = JSON.parse(stored);
      console.log("city:", city);

      const hospitalList = await getHospitalsInCity(city);
      setHospitals(hospitalList);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
            <svg
              className="w-7 h-7 text-white"
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
          <div>
            <h2 className="text-2xl font-bold text-white">Nearby Hospitals</h2>
            <p className="text-green-100 text-sm">Hospitals in your area</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">
                Loading hospital information...
              </p>
            </div>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Hospitals Found
            </h3>
            <p className="text-gray-600">
              No healthcare facilities found in your current location. Please
              check your location settings or contact local health authorities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hospitals.map((hospital, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {hospital.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {hospital.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
