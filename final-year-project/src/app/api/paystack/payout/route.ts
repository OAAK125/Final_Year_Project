export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function fail(message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { account_number, bank_code, amount, name } = body || {};

    if (!account_number || !bank_code || !amount || !name) {
      return fail("Missing required fields (account_number, bank_code, amount, name)", 400);
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return fail("Missing PAYSTACK_SECRET_KEY in env vars", 500);
    }

    // 1. Resolve account
    const resolveRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const resolveData = await resolveRes.json();
    if (!resolveData.status) {
      return fail("Account resolution failed", 400, { details: resolveData.message });
    }

    // 2. Create transfer recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: name,
        account_number: account_number,
        bank_code: bank_code,
        currency: "NGN",
      }),
    });

    const recipientData = await recipientRes.json();
    if (!recipientData.status) {
      return fail("Failed to create recipient", 400, { details: recipientData.message });
    }

    const recipient_code = recipientData.data.recipient_code;

    // 3. Initiate transfer
    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance", // Paystack balance
        amount: amount * 100, // convert NGN to Kobo
        recipient: recipient_code,
        reason: "Payout from Certification Platform",
      }),
    });

    const transferData = await transferRes.json();
    if (!transferData.status) {
      return fail("Failed to initiate transfer", 400, { details: transferData.message });
    }

    return NextResponse.json(
      {
        success: true,
        transfer: transferData.data,
      },
      { status: 200 }
    );
  } catch (err) {
    return fail("Internal server error", 500, { details: err?.message || String(err) });
  }
}
