"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ensurePatientProfile } from "@/lib/supabase/ensurePatientProfile";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processLogin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Login failed:", error?.message);
        router.replace("/login");
        return;
      }

      const userId = user.id;
      const email = user.email;
      const fullName = user.user_metadata.full_name || "Unnamed User";

      // Step 1: If already in profiles → redirect by role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        const role = profile.role;

        switch (role) {
          case "HEALTH_DEPT":
            router.replace("/dashboard/admin");
            return;
          case "HOSPITAL":
            router.replace("/dashboard/hospital");
            return;
          case "PATIENT":
            router.replace("/dashboard/patient");
            return;
          default:
            router.replace("/unauthorized");
            return;
        }
      }

      // Step 2: If not in profiles → check if Gmail is authorized hospital
      const { data: authorizedHospital } = await supabase
        .from("authorized_hospitals")
        .select("name")
        .eq("email", email)
        .maybeSingle();

      if (authorizedHospital) {
        // Add to profiles with role HOSPITAL
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email,
          full_name: fullName,
          role: "HOSPITAL",
        });

        if (insertError) {
          console.error("Failed to insert hospital profile:", insertError.message);
          router.replace("/unauthorized");
          return;
        }

        // Redirect to setup page
        router.replace("/setup/hospital-profile");
        return;
      }

      // Step 3: Else → create as PATIENT
      const fallbackError = await ensurePatientProfile(userId, fullName, email!);

      if (fallbackError) {
        console.error("Failed to create patient profile:", fallbackError.message);
        router.replace("/unauthorized");
        return;
      }

      router.replace("/dashboard/patient");
    };

    processLogin();
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-gray-500">
      Processing login...
    </div>
  );
}
