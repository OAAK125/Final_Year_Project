// app/api/paystack/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Validate signature (HMAC SHA512)
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { metadata, status } = event.data;
      const userId = metadata?.user_id;
      const planId = metadata?.plan_id;
      const certId = metadata?.certification_id;

      if (status === "success" && userId && planId) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for server-side
        );

        // Upsert subscription: set status=active
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan_id: planId,
            certification_id: certId,
            status: "active",
            started_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
