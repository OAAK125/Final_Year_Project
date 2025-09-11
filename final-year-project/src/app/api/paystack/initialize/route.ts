// app/api/paystack/initialize/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { plan_id, certification_id } = await req.json();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    if (plan.name === "Standard" && !certification_id) {
      return NextResponse.json(
        { error: "Certification required for Standard plan" },
        { status: 400 }
      );
    }


    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: plan.price * 100,
          metadata: {
            user_id: user.id,
            plan_id,
            certification_id: plan.name === "Standard" ? certification_id : null,
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        }),
      }
    );

    const json = await paystackRes.json();
    console.log("🔵 Paystack Init Response:", json);

    if (!paystackRes.ok) {
      console.error("❌ Paystack error:", json);
      return NextResponse.json(
        { error: "Paystack initialization failed", details: json },
        { status: 500 }
      );
    }

    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id,
      certification_id: plan.name === "Standard" ? certification_id : null,
      status: "pending",
      started_at: new Date().toISOString(),
    });

    return NextResponse.json(json);
  } catch (err: any) {
    console.error("Init error:", err);
    return NextResponse.json(
      { error: "Failed to initialize payment", details: err.message },
      { status: 500 }
    );
  }
}
