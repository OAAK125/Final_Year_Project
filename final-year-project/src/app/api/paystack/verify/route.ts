// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for DB updates
);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const json = await verifyRes.json();
    console.log("🔵 Paystack Verify Response:", json);

    if (!verifyRes.ok || json.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", details: json },
        { status: 400 }
      );
    }

    // ✅ Parse metadata (could be object or string)
    let user_id, plan_id, certification_id;
    try {
      const rawMeta = json.data.metadata;
      const parsed =
        typeof rawMeta === "string" ? JSON.parse(rawMeta) : rawMeta || {};
      user_id = parsed.user_id;
      plan_id = parsed.plan_id;
      certification_id = parsed.certification_id;
    } catch (err) {
      console.error("❌ Failed to parse metadata:", json.data.metadata, err);
    }

    if (!user_id || !plan_id) {
      return NextResponse.json(
        { error: "Invalid metadata in verification response" },
        { status: 400 }
      );
    }

    await supabase.from("subscriptions").upsert(
      {
        user_id,
        plan_id,
        certification_id,
        status: "active",
        started_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
