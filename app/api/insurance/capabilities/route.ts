import { NextResponse } from "next/server";
import { insuranceLines } from "@/lib/insurance/catalog-capabilities";

// Public catalog metadata only. Never expose an unverified insurer as sellable.
export async function GET() {
  return NextResponse.json(
    { categories: insuranceLines, onlineSalesEnabled: false, note: "การขายออนไลน์ขึ้นอยู่กับการตรวจสอบสิทธิ์รายบริษัทและรายผลิตภัณฑ์" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
