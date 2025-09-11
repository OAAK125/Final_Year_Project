// /api/admin/approve-submission/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { submissionId } = await req.json();

    // 1. Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from("contributor_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 2. Insert into questions table (new row for both created + edited)
    const { error: insertError } = await supabase.from("questions").insert({
      certification_id: submission.certification_id,
      question_text: submission.question_text,
      options: submission.options,
      correct_answer: submission.correct_answer,
      explanation: submission.explanation,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to insert into questions", details: insertError.message }, { status: 500 });
    }

    // 3. Mark submission as approved
    await supabase
      .from("contributor_submissions")
      .update({ approved: true })
      .eq("id", submissionId);

    // 4. Credit contributor wallet
    const reward = submission.type === "created" ? 0.3 : 0.1;
    await supabase.rpc("increment_wallet_balance", {
      contributor_id: submission.user_id,
      amount: reward,
    });

    return NextResponse.json({ success: true, reward });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
