/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AdminOverviewPanel from "./components/AdminOverview";
import SubmissionOverview from "./components/SubmissionOverview";
import CityAIInsightsPanel from "./components/AIInsights";
import {
  RegisteredHospitalsList,
  ResourceExportButton,
  TrendChart,
} from "./components/DataAll";
import AddHospitalForm from "./components/AddHospital";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { AdvancedTrendChart } from "./components/AdvancedChart";
import AIOverviewPanel from "./components/AICitywide";
import AnomalyPanel from "./components/AnnamolyPannel";
import SymptomTrendsPanel from "./components/SymptomTrends";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      setLocation(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-sky-100 sticky top-0 z-50">
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
              <p className="text-sm text-gray-600 -mt-1">
                Health Department Dashboard
              </p>
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

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-sky-100 to-sky-100 rounded-3xl p-8 border border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Health Department Control Center
              </h2>
              <p className="text-lg text-gray-700">
                Monitor city-wide healthcare resources, analyze trends, and
                manage hospital operations
              </p>
            </div>
            <div className="hidden lg:block ">
              <div className="w-24 h-24 bg-gradient-to-br from-sky-300 to-sky-200 rounded-2xl flex items-center justify-center shadow-lg border border-black">
                <svg
                  className="w-12 h-12 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Overview and Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AdminOverviewPanel />
          <SubmissionOverview />
        </div>

        {/* AI Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CityAIInsightsPanel />
          <AIOverviewPanel />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          <TrendChart />
          <AdvancedTrendChart />
        </div>

        {/* Analysis Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnomalyPanel />
          <SymptomTrendsPanel />
        </div>

        {/* Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AddHospitalForm />
          </div>
          <RegisteredHospitalsList />
        </div>
        <div className="flex justify-center">
          <ResourceExportButton />
        </div>
      </main>
    </div>
  );
}
