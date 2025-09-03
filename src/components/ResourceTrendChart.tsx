/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase/client";

interface ResourceEntry {
  date: string;
  icu_beds_used: number;
  total_icu_beds: number;
  oxygen_units_used: number;
  total_oxygen_units: number;
  dialysis_machines_used: number;
  total_dialysis_machines: number;
  beds_used: number;
  total_beds: number;
  doctors_available: number;
  total_doctors_working: number;
}

export default function ResourceTrendChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data: resources, error } = await supabase
        .from("resources")
        .select("*")
        .eq("hospital_id", userId)
        .order("date", { ascending: true });

      if (error || !resources) {
        console.error("Error fetching resources:", error?.message);
        return;
      }

      const formatted = resources.map((r: ResourceEntry) => ({
        date: r.date,
        ICU: r.total_icu_beds ? (r.icu_beds_used / r.total_icu_beds) * 100 : 0,
        Oxygen: r.total_oxygen_units
          ? (r.oxygen_units_used / r.total_oxygen_units) * 100
          : 0,
        Dialysis: r.total_dialysis_machines
          ? (r.dialysis_machines_used / r.total_dialysis_machines) * 100
          : 0,
        Beds: r.total_beds ? (r.beds_used / r.total_beds) * 100 : 0,
        Doctors: r.total_doctors_working
          ? (r.doctors_available / r.total_doctors_working) * 100
          : 0,
      }));

      setData(formatted);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Hospital Resource Trend Chart</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip formatter={(value) => (typeof value === "number" ? `${value.toFixed(1)}%` : value)} />
          <Legend />
          <Line type="monotone" dataKey="ICU" stroke="#e11d48" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Oxygen" stroke="#0ea5e9" strokeDasharray="5 2" />
          <Line type="monotone" dataKey="Dialysis" stroke="#8b5cf6" strokeDasharray="3 4 5 2" />
          <Line type="monotone" dataKey="Beds" stroke="#10b981" strokeDasharray="2 2" />
          <Line type="monotone" dataKey="Doctors" stroke="#f59e0b" strokeDasharray="7 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
