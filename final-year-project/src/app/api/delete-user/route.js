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

    // 1) Delete user-owned rows in the right order to satisfy FK constraints.
    //    Add/remove tables here to match your schema.
    //    Do children first, then parents, then profiles, then auth user.

    const tablesInDeleteOrder = [
      ["answers", "user_id"],
      ["flagged_questions", "user_id"],
      ["custom_answers", "user_id"],
      ["custom_quizzes", "user_id"],
      ["bookmarks", "user_id"],
      ["notification_reads", "user_id"],
      // If you have any tables that reference quiz_sessions by session_id AND also by user_id,
      // ensure those are deleted before quiz_sessions.
      ["quiz_sessions", "user_id"],
      // profiles typically has id = auth.users.id
      ["profiles", "id"],
    ];

    for (const [table, col] of tablesInDeleteOrder) {
      const { error } = await admin.from(table).delete().eq(col, userId);
      // Ignore "no rows found" style errors, but surface real ones
      if (error && error.code !== "PGRST116") {
        return fail(`Failed to delete from ${table}`, 500, { details: error.message });
      }
    }

    // Optional: if your storage.objects.owner FK points to auth.users.id without ON DELETE SET NULL,
    // you may need to clear or delete owned files. Example (commented out):
    // try {
    //   const { data: files } = await admin.storage.from("avatars").list("", { limit: 1000, search: "" });
    //   // If you have a way to match the user's file(s), delete them:
    //   // await admin.storage.from("avatars").remove([`avatars/${something}`]);
    // } catch (_) {}

    // 2) Finally delete the auth user
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      return fail("Failed to delete auth user", 500, { details: authError.message });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return fail("Internal server error", 500, { details: err?.message || String(err) });
  }
}
