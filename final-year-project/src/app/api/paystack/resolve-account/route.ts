export const runtime = "nodejs";
import { NextResponse } from "next/server";

function fail(message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(req) {
  try {
    const { account_number, bank_code } = await req.json();

    if (!account_number || !bank_code) {
      return fail("Missing required fields (account_number, bank_code)", 400);
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return fail("Missing PAYSTACK_SECRET_KEY in env vars", 500);
    }

    // Call Paystack's Resolve Account Number API
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.status) {
      return fail("Account resolution failed", 400, {
        details: data?.message || "Unable to resolve account",
      });
    }

    return NextResponse.json({
      success: true,
      data: data.data, // contains { account_number, account_name, bank_id }
    });
  } catch (err) {
    console.error("Resolve account error:", err);
    return fail("Internal server error", 500, {
      details: err?.message || String(err),
    });
  }
}
