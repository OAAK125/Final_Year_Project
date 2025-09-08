import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error(" PAYSTACK_SECRET_KEY is missing");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    console.log(" PAYSTACK_SECRET_KEY loaded, first 4 chars:", secret.slice(0, 4));


    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error(" Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(" Paystack Webhook Event:", event);

    // If payment was successful, update subscription
    if (event.event === "charge.success") {
      const metadata = event.data.metadata;
      const user_id = metadata.user_id;
      const plan_id = metadata.plan_id;
      const certification_id = metadata.certification_id;

      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set() {},
            remove() {},
          },
        }
      );

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("plan_id", plan_id);

      if (error) console.error(" Failed to update subscription:", error);
      else console.log("Subscription activated for user:", user_id);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
