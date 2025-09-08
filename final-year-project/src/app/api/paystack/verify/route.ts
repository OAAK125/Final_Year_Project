// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for writes
);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();
    console.log("🔵 Received verify request for reference:", reference);

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const json = await verifyRes.json();
    console.log("🔵 Full Verify Response:", JSON.stringify(json, null, 2));

    // ✅ Ensure transaction was successful
    if (!verifyRes.ok || json.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: json },
        { status: 400 }
      );
    }

    // ✅ Handle metadata correctly
    const meta = json.data.metadata || {};
    const user_id = meta.user_id;
    const plan_id = meta.plan_id;
    const certification_id = meta.certification_id || null;

    if (!user_id || !plan_id) {
      console.error("❌ Missing metadata:", meta);
      return NextResponse.json(
        { error: "Invalid metadata in Paystack response", meta },
        { status: 400 }
      );
    }

    // ✅ Update subscription table
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id,
        plan_id,
        certification_id,
        status: "active",
        started_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("❌ DB error while updating subscription:", error);
      return NextResponse.json(
        { error: "Failed to update subscription", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Subscription updated for user:", user_id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
