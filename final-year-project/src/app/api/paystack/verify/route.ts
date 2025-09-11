// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // ✅ ensure this is correct
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ must be service role
);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();
    console.info("🔵 Received verify request for reference:", reference);

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const json = await verifyRes.json();
    console.info("🔵 Full Paystack Verify Response:", JSON.stringify(json, null, 2));


    if (!json.status || json.data?.status !== "success") {
      console.error("❌ Payment verification failed:", {
        httpOk: verifyRes.ok,
        paystackStatus: json.status,
        dataStatus: json.data?.status,
        gatewayResponse: json.data?.gateway_response,
      });

      return NextResponse.json(
        { error: "Payment not successful", details: json },
        { status: 400 }
      );
    }

    const { user_id, plan_id, certification_id } = json.data?.metadata || {};
    if (!user_id || !plan_id) {
      console.error("❌ Missing metadata:", json.data?.metadata);
      return NextResponse.json(
        { error: "Invalid transaction metadata", details: json.data?.metadata },
        { status: 400 }
      );
    }


    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, name")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      console.error("❌ Plan lookup failed:", planError);
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

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
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    console.info("✅ Subscription updated successfully:", sub);

    return NextResponse.json({ status: "success", subscription: sub });
  } catch (err: any) {
    console.error("❌ Verify route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
