/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/lib/supabase/client";

export default function ResourceTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'resources' | 'demographics'>('resources');

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { data: submissions } = await supabase
        .from("resources")
        .select(`
          date, icu_beds_used, total_icu_beds, beds_used, total_beds, 
          oxygen_units_used, total_oxygen_units, dialysis_machines_used, total_dialysis_machines, 
          doctors_available, total_doctors_working, patients_below_16, patients_16_to_30, 
          patients_30_to_50, patients_50_to_70, patients_above_70, male_patients, female_patients
        `)
        .eq("hospital_id", userId)
        .order("date", { ascending: true });

      if (submissions) {
        const formatted = submissions.map((entry) => ({
          ...entry,
          date: new Date(entry.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          // Calculate utilization percentages
          bed_utilization: entry.total_beds > 0 ? Math.round((entry.beds_used / entry.total_beds) * 100) : 0,
          icu_utilization: entry.total_icu_beds > 0 ? Math.round((entry.icu_beds_used / entry.total_icu_beds) * 100) : 0,
          oxygen_utilization: entry.total_oxygen_units > 0 ? Math.round((entry.oxygen_units_used / entry.total_oxygen_units) * 100) : 0,
          total_patients: entry.patients_below_16 + entry.patients_16_to_30 + entry.patients_30_to_50 + entry.patients_50_to_70 + entry.patients_above_70,
        }));
        setData(formatted);
      }
      setLoading(false);
    };

    fetchTrends();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.dataKey.includes('utilization') ? '%' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-sky-200 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading resource trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Resource Analytics</h2>
              <p className="text-sky-100 text-sm">Historical trends and utilization patterns</p>
            </div>
          </div>
          
          {/* Chart Selector */}
          <div className="flex bg-white/20 rounded-xl p-1">
            <button
              onClick={() => setActiveChart('resources')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeChart === 'resources' 
                  ? 'bg-white text-sky-700 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveChart('demographics')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeChart === 'demographics' 
                  ? 'bg-white text-sky-700 shadow-lg' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Demographics
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600">Submit daily reports to see resource trends and analytics.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeChart === 'resources' ? (
              <>
                {/* Resource Utilization Chart */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                    <span>Resource Utilization Trends</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 100]}
                          label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="bed_utilization" 
                          name="Bed Utilization" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="icu_utilization" 
                          name="ICU Utilization" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="oxygen_utilization" 
                          name="Oxygen Utilization" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Staff and Equipment Chart */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Staff & Equipment Availability</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="doctors_available" name="Doctors Available" fill="#00afb9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="dialysis_machines_used" name="Dialysis Machines" fill="#fcbf49" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Age Demographics Chart */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Patient Age Distribution</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="patients_below_16" name="Below 16" stroke="#6b7280" strokeWidth={2} />
                        <Line type="monotone" dataKey="patients_16_to_30" name="16-30" stroke="#4ade80" strokeWidth={2} />
                        <Line type="monotone" dataKey="patients_30_to_50" name="30-50" stroke="#34d399" strokeWidth={2} />
                        <Line type="monotone" dataKey="patients_50_to_70" name="50-70" stroke="#60a5fa" strokeWidth={2} />
                        <Line type="monotone" dataKey="patients_above_70" name="Above 70" stroke="#f87171" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gender Distribution Chart */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Gender Distribution & Total Patients</span>
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="male_patients" name="Male Patients" fill="#091540" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="female_patients" name="Female Patients" fill="#ff97b7" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="total_patients" name="Total Patients" stroke="#059669" strokeWidth={3} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Summary Stats */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.length > 0 && (
                  <>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sky-600">
                        {Math.round(data.reduce((acc, item) => acc + item.bed_utilization, 0) / data.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Avg Bed Utilization</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {Math.round(data.reduce((acc, item) => acc + item.icu_utilization, 0) / data.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Avg ICU Utilization</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(data.reduce((acc, item) => acc + item.total_patients, 0) / data.length)}
                      </p>
                      <p className="text-sm text-gray-600">Avg Daily Patients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {data.length}
                      </p>
                      <p className="text-sm text-gray-600">Days Tracked</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}