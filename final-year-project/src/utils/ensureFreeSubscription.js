import { createClient } from "@/utils/supabase/client";

export async function ensureFreeSubscription(userId) {
  const supabase = createClient();

  // Check if the user already has an active subscription
  const { data: existing, error } = await supabase
    .from("subscriptions")
    .select("id, plan_id, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // If the user already has Standard or Full-Access, do nothing
  if (existing && !error) {
    return;
  }

  // If no subscription, insert Free plan
  await supabase.from("subscriptions").insert({
    user_id: userId,
    plan_id: "c000440f-2269-4e17-b445-e1c4510504d8", 
    status: "active",
    started_at: new Date().toISOString(),
    expires_at: null,
  });
}
