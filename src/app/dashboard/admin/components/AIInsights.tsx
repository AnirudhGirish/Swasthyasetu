/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/CityAIInsightsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { getForecastFromAI } from "@/lib/ai/getForecastFromAi";
import { supabase } from "@/lib/supabase/client";

export default function CityAIInsightsPanel() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const tz = "Asia/Kolkata";
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const next3Dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // +1 = tomorrow
    return dateFmt.format(d);
  });
  useEffect(() => {
    const fetchAI = async () => {
      const locationStr = localStorage.getItem("user_location");
      if (!locationStr) return;

      const { city } = JSON.parse(locationStr);
      const { data: hospitals, error: hospitalError } = await supabase
        .from("hospitals")
        .select("department_id")
        .eq("location", city);

      const departmentIds = (hospitals ?? []).map((h) => h.department_id);

      const { data: resources, error: resourceError } = await supabase
        .from("resources")
        .select(
          "date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units"
        )
        .in("hospital_id", departmentIds)
        .order("date", { ascending: false })
        .limit(14);

      const result = await getForecastFromAI(JSON.stringify(resources));
      if (!result || !result.alerts || !result.forecast) {
        setAlerts([]);
        setForecast({ icu_beds: [0, 0, 0], oxygen_units: [0, 0, 0] });
        return;
      }
      setAlerts(result.alerts ?? []);
      setForecast(
        result.forecast ?? { icu_beds: [0, 0, 0], oxygen_units: [0, 0, 0] }
      );
    };
    fetchAI();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 mt-8">
      <h2 className="text-xl font-bold">🔍 AI Insights & Forecast</h2>

      {alerts.length > 0 && (
        <div className="bg-red-100 text-red-800 p-4 rounded-xl">
          <h3 className="font-semibold mb-2">🚨 Alerts:</h3>
          <ul className="list-disc list-inside">
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {forecast && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">📅 Forecast (Next 3 Days)</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold">Days</p>
              {next3Dates.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold">ICU Beds</p>
              {forecast.icu_beds?.map((val: string, idx: number) => (
                <p key={idx}>{val}</p>
              ))}
            </div>
            <div>
              <p className="font-semibold">Oxygen Units</p>
              {forecast.oxygen_units?.map((val: string, idx: number) => (
                <p key={idx}>{val}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
