// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role required for server updates
);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();
    console.info("🔵 Received verify request for reference:", reference);

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const json = await verifyRes.json();
    console.info("🔵 Full Verify Response:", JSON.stringify(json, null, 2));

    if (!verifyRes.ok || json.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: json },
        { status: 400 }
      );
    }

    const { user_id, plan_id, certification_id } = json.data.metadata || {};

    // ✅ Lookup plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      console.error("❌ Plan lookup failed:", planError);
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    // ✅ Upsert subscription with user + plan
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id,
          plan_id,
          certification_id,
          status: "active",
          started_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("plan_id, certification_id, status, plans(name)")
      .single();

    if (subError) {
      console.error("❌ DB error while updating subscription:", subError);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    console.info("✅ Subscription updated:", sub);

    return NextResponse.json({ status: "success", subscription: sub });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
