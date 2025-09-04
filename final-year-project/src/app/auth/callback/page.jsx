"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ensureFreeSubscription } from "@/utils/ensureFreeSubscription";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleRedirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/authentication/login");
        return;
      }

      // ✅ Ensure the user always has a Free subscription
      await ensureFreeSubscription(user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        router.push("/dashboard"); // fallback
        return;
      }

      switch (profile.role) {
        case "admin":
          router.push("/admin");
          break;
        case "contributor":
          router.push("/contributor");
          break;
        case "student": // ✅ explicitly handled
        default:
          router.push("/dashboard");
      }
    };

    handleRedirect();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
