export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const res = await fetch("https://api.paystack.co/bank", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.message || "Failed to fetch banks" }, { status: 400 });
    }
    return NextResponse.json(data.data); // returns list of banks with {name, code}
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
