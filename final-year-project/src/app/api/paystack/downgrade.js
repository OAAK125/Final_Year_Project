import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8";

export async function POST(req) {
  const supabase = createClient();
  const { user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  // update subscription in Supabase
  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: FREE_PLAN_ID,
      certification_id: null,
      status: "active", // keep active but Free
    })
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to downgrade" }, { status: 500 });
  }

  return NextResponse.json({
    redirect_url: process.env.PAYSTACK_WEBHOOK_RETURN_URL || "/dashboard",
  });
}
