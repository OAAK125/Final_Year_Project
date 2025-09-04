// app/api/paystack/initialize/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { plan_id, certification_id } = await req.json();

    // Get current logged-in user from Supabase Auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch plan details from Supabase
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    // If Standard plan, certification_id must be provided
    if (plan.name === "Standard" && !certification_id) {
      return NextResponse.json(
        { error: "Certification required for Standard plan" },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: plan.price * 100, // Paystack expects amount in kobo/cents
        metadata: {
          user_id: user.id,
          plan_id,
          certification_id: plan.name === "Standard" ? certification_id : null,
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("Paystack error:", json);
      return NextResponse.json(
        { error: "Paystack initialization failed", details: json },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (err) {
    console.error("Init error:", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
