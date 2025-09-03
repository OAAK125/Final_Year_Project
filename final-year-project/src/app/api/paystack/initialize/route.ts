// app/api/paystack/initialize/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needed to update subscriptions
);

export async function POST(req: Request) {
  try {
    const { user_id, plan_id, email } = await req.json();

    // Fetch plan details from Supabase
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: plan.price * 100, // Paystack expects kobo/cents
        metadata: {
          user_id,
          plan_id,
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // redirect after payment
      }),
    });

    const json = await response.json();

    return NextResponse.json(json);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
