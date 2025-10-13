/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getForecastFromAI } from "@/lib/ai/getForecastFromAi";
import { supabase } from "@/lib/supabase/client";

export default function CityAIInsightsPanel() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    return {
      date: dateFmt.format(d),
      dayName: d.toLocaleDateString("en-US", { weekday: "short", timeZone: tz })
    };
  });

  const fetchAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const locationStr = localStorage.getItem("user_location");
      if (!locationStr) {
        setError("Location not found. Please set your location.");
        return;
      }

      const { city } = JSON.parse(locationStr);
      
      const { data: hospitals, error: hospitalError } = await supabase
        .from("hospitals")
        .select("department_id")
        .eq("location", city);

      if (hospitalError) {
        throw new Error("Failed to fetch hospitals: " + hospitalError.message);
      }

      const departmentIds = (hospitals ?? []).map((h) => h.department_id);
      
      if (departmentIds.length === 0) {
        setError("No hospitals found in your city.");
        return;
      }

      const { data: resources, error: resourceError } = await supabase
        .from("resources")
        .select("date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units")
        .in("hospital_id", departmentIds)
        .order("date", { ascending: false })
        .limit(14);

      if (resourceError) {
        throw new Error("Failed to fetch resource data: " + resourceError.message);
      }

      if (!resources || resources.length === 0) {
        setError("No recent data available for analysis.");
        return;
      }

      const result = await getForecastFromAI(JSON.stringify(resources));
      
      if (!result) {
        setError("AI service is currently unavailable.");
        return;
      }

      setAlerts(result.alerts ?? []);
      setForecast(result.forecast ?? { icu_beds: [0, 0, 0], oxygen_units: [0, 0, 0] });
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, []);

  const getAlertSeverity = (alert: string) => {
    const lowerAlert = alert.toLowerCase();
    if (lowerAlert.includes('critical') || lowerAlert.includes('emergency') || lowerAlert.includes('urgent')) {
      return 'critical';
    }
    if (lowerAlert.includes('warning') || lowerAlert.includes('high') || lowerAlert.includes('concern')) {
      return 'warning';
    }
    return 'info';
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-200 border-orange-300 text-black';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': 
        return "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z";
      case 'warning':
        return "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
      default:
        return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4cc9f0] to-[#4cc9f0]/75 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-black">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">AI Insights & Forecast</h2>
              <p className="text-black text-sm">Predictive analysis and alerts</p>
            </div>
          </div>
          
          <button
            onClick={fetchAI}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center space-x-2 border border-black"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-black">Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generating AI Insights</h3>
                <p className="text-gray-600">Analyzing city-wide healthcare data...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAI}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center justify-between bg-[#4cc9f0]/30 border border-[#4cc9f0] rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-black">
                    Last updated: {lastUpdated}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-900 rounded-full animate-pulse"></div>
                  <span className="text-md text-green-900 font-medium">Live Analysis</span>
                </div>
              </div>
            )}

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Critical Alerts</span>
                </h3>
                
                <div className="space-y-3">
                  {alerts.map((alert, i) => {
                    const severity = getAlertSeverity(alert);
                    return (
                      <div key={i} className={`rounded-2xl p-4 border-2 ${getAlertColor(severity)}`}>
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getAlertIcon(severity)} />
                          </svg>
                          <p className="font-medium leading-relaxed">{alert}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Forecast Section */}
            {forecast && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>3-Day Forecast</span>
                </h3>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Days Column */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-300">Date</h4>
                      {next3Dates.map((dateInfo, idx) => (
                        <div key={idx} className="bg-neutral-400/50 border border-black rounded-xl p-4 text-center shadow-sm">
                          <p className="font-semibold text-gray-900">{dateInfo.dayName}</p>
                          <p className="text-sm text-gray-600">{dateInfo.date}</p>
                        </div>
                      ))}
                    </div>

                    {/* ICU Beds Column */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-300 flex items-center justify-center space-x-2">
                        {/* <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg> */}
                        <span>ICU Beds</span>
                      </h4>
                      {forecast.icu_beds?.map((val: string, idx: number) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-red-700">{val}</p>
                          <p className="text-xs text-red-600">Predicted usage</p>
                        </div>
                      ))}
                    </div>

                    {/* Oxygen Units Column */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 text-center pb-3 border-b border-gray-300 flex items-center justify-center space-x-2">
                        {/* <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg> */}
                        <span>Oxygen Units</span>
                      </h4>
                      {forecast.oxygen_units?.map((val: string, idx: number) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-blue-700">{val}</p>
                          <p className="text-xs text-blue-600">Predicted usage</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No Alerts Success */}
            {alerts.length === 0 && forecast && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 justify-center text-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">All Systems Normal</h3>
                    <p className="text-green-700">No critical alerts detected in current data analysis.</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Disclaimer */}
            <div className="bg-[#4cc9f0]/45 border border-[#4cc9f0] rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-black mb-1">AI Forecast Disclaimer</h4>
                  <p className="text-sm text-black leading-relaxed">
                    These forecasts are AI-generated predictions based on previous data patterns. 
                    Use as supplementary guidance only and always consult with healthcare professionals for critical decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}