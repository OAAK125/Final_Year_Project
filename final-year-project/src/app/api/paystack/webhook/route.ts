// app/api/paystack/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // ✅ Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { user_id, plan_id, certification_id } = event.data.metadata || {};

      if (!user_id || !plan_id) {
        console.error("⚠️ Missing user_id or plan_id in metadata:", event.data.metadata);
        return NextResponse.json({ error: "Missing subscription metadata" }, { status: 400 });
      }

      // Double-check plan exists
      const { data: plan, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", plan_id)
        .single();

      if (planError || !plan) {
        console.error("⚠️ Plan not found:", plan_id, planError);
        return NextResponse.json({ error: "Plan not found" }, { status: 400 });
      }

      // ✅ Build subscription row
      const subscriptionRow: any = {
        user_id,
        plan_id,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
      };

      if (plan.name === "Standard") {
        subscriptionRow.certification_id = certification_id || null;
      } else {
        subscriptionRow.certification_id = null;
      }

      // ✅ Upsert subscription
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert(subscriptionRow, { onConflict: "user_id" }); 
        // ensures one active subscription per user

      if (subError) {
        console.error("⚠️ Supabase upsert failed:", subError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
