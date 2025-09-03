"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getOpenAIInsight } from "@/lib/ai/getAIInsight"; // assumes this util exists

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const { data: recent } = await supabase
        .from("resources")
        .select("date, icu_beds_used, total_icu_beds, oxygen_units_used, total_oxygen_units, beds_used, total_beds, doctors_available, total_doctors_working")
        .eq("hospital_id", userId)
        .order("date", { ascending: false })
        .limit(7);

      if (!recent || recent.length < 3) {
        setInsight("Not enough data for insights yet.");
        setLoading(false);
        return;
      }

      const prompt = `You are a healthcare data analyst AI. Analyze the following daily hospital resource data over the last week and provide a short paragraph of insights and trends. Format your response in plain text.\n\n${JSON.stringify(
        recent,
        null,
        2
      )}`;

      const result = await getOpenAIInsight(prompt);

      if (result) setInsight(result);
      else setInsight("Unable to generate insights at the moment.");

      setLoading(false);
    };

    fetchInsights();
  }, []);

  return (
    <div className="mt-10 p-6 bg-gray-100 border rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">AI-Powered Insights</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Analyzing hospital data...</p>
      ) : (
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{insight}</p>
      )}
    </div>
  );
}
// ab8b7c37-5478-4fee-86f2-738128022e58