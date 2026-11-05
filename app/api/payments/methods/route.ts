import { NextResponse } from "next/server";
import { paymentMethods } from "@/lib/payments/methods";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { methods: paymentMethods, paymentsEnabled: false, mode: "not_configured" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
