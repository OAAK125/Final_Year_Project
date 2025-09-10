export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function fail(message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(req) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) return fail("Missing NEXT_PUBLIC_SUPABASE_URL env var", 500);
    if (!serviceKey) return fail("Missing SUPABASE_SERVICE_ROLE_KEY env var", 500);

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body", 400);
    }

    const { userId } = body || {};
    if (!userId) return fail("Missing userId", 400);

    const FREE_PLAN_ID = "c000440f-2269-4e17-b445-e1c4510504d8"; // Free plan UUID

    // 1) Reset subscription first (audit trail)
    const { error: subError } = await admin
      .from("subscriptions")
      .update({
        plan_id: FREE_PLAN_ID,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (subError) {
      return fail("Failed to reset subscription", 500, { details: subError.message });
    }

    // 2) Delete subscription row completely
    const { error: delSubError } = await admin.from("subscriptions").delete().eq("user_id", userId);
    if (delSubError && delSubError.code !== "PGRST116") {
      return fail("Failed to delete subscription", 500, { details: delSubError.message });
    }

    // 3) Delete other user-owned rows
    const tablesToDelete = [
      ["flagged_questions", "user_id"],
      ["custom_answers", "user_id"],
      ["custom_quizzes", "user_id"],
      ["bookmarks", "user_id"],
      ["notification_reads", "user_id"],
      ["quiz_sessions", "user_id"],
      ["profiles", "id"], // profiles last
    ];

    for (const [table, col] of tablesToDelete) {
      const { error } = await admin.from(table).delete().eq(col, userId);
      if (error && error.code !== "PGRST116") {
        return fail(`Failed to delete from ${table}`, 500, { details: error.message });
      }
    }

    // 4) Finally delete the auth user
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      return fail("Failed to delete auth user", 500, { details: authError.message });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return fail("Internal server error", 500, { details: err?.message || String(err) });
  }
}
