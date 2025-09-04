"use client";

import AdminOverviewPanel from "./components/AdminOverview";
import SubmissionOverview from "./components/SubmissionOverview";
import CityAIInsightsPanel from "./components/AIInsights";
import { RegisteredHospitalsList, ResourceExportButton, TrendChart } from "./components/DataAll";
import AddHospitalForm from "./components/AddHospital";
import LogoutButton from "@/src/components/auth/LogoutButton";

export default function AdminDashboardPage() {
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      <div className='flex justify-between'>
        <h1 className="text-3xl font-bold mb-4">Health Department Dashboard</h1>
        <LogoutButton />
      </div>
      <AdminOverviewPanel />
      <SubmissionOverview />
      <CityAIInsightsPanel/>
      <TrendChart />
      <ResourceExportButton />
      <RegisteredHospitalsList />
      <AddHospitalForm />
    </main>
  );
}
// ab8b7c37-5478-4fee-86f2-738128022e58