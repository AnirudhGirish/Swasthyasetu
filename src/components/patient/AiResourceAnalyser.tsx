/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    const { data: recent } = await supabase
      .from("resources")
      .select("*")
      .eq("hospital_id", userId)
      .order("date", { ascending: false })
      .limit(10);

    if (!recent || recent.length === 0) {
      setInsight("No data available for analysis. Please submit daily reports to receive AI-powered insights about your hospital's operations and trends.");
      setLoading(false);
      return;
    }

    const prompt = `
You are a hospital analytics AI assistant specializing in healthcare resource management and operational efficiency.

Analyze the following resource and patient data from a hospital over the last ${recent.length} submission(s):
${JSON.stringify(recent, null, 2)}

Provide a comprehensive analysis covering:
1. **Resource Utilization Overview**: Current capacity utilization and efficiency trends
2. **Operational Insights**: Staff workload, equipment usage patterns, and bottlenecks
3. **Patient Demographics**: Age distribution trends and gender balance insights
4. **Critical Alerts**: Any concerning patterns in resource strain (ICU, oxygen, beds)
5. **Recommendations**: Actionable suggestions for optimization and improvements
6. **Anomaly Detection**: Unusual patterns or inconsistencies with specific dates

Format as clear bullet points with specific data references where possible. Keep insights professional and actionable for hospital administration.
    `.trim();

    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      
      if (json.success) {
        const cleaned = json.insight.replace(/\*\*/g, "");
        setInsight(cleaned);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setInsight("Unable to generate insights at this time. Please try again later or contact system administrator if the issue persists.");
      }
    } catch (error) {
      setInsight("Failed to connect to AI service. Please check your internet connection and try again.");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6b7fd7] to-[#6b7fd7]/85  p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">AI-Powered Insights</h2>
              <p className="text-black text-sm">Intelligent analysis of your hospital operations</p>
            </div>
          </div>
          
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center space-x-2"
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
                <p className="text-gray-600">Analyzing hospital data patterns and trends...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="flex items-center justify-between bg-[#6b7fd7]/45 border border-[#6b7fd7] rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[#6b7fd7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-black">
                    Last updated: {lastUpdated}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Live Analysis</span>
                </div>
              </div>
            )}

            {/* Insights Content */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {insight}
                </div>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="bg-[#6b7fd7]/45 border border-[#6b7fd7] rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-black mb-1">AI Analysis Disclaimer</h4>
                  <p className="text-sm text-black leading-relaxed">
                    These insights are generated by artificial intelligence and should be used as supplementary guidance only. 
                    Always consult with healthcare professionals and hospital administrators for critical operational decisions. 
                    The AI analysis is based on submitted data patterns and may not reflect real-time conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-800 mb-1">Pattern Analysis</h4>
                <p className="text-xs text-blue-700">Identifies trends in resource usage</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-red-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-red-800 mb-1">Alert Detection</h4>
                <p className="text-xs text-red-700">Flags critical resource issues</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="w-8 h-8 mx-auto bg-green-500 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-green-800 mb-1">Recommendations</h4>
                <p className="text-xs text-green-700">Suggests operational improvements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}