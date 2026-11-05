import { NextResponse } from "next/server";
/**
 * No customer data is sent to any insurer while contracts, regulatory scope,
 * partner API access, server-side authentication and consent flow are unverified.
 * POST is intentionally disabled until a vetted server-side carrier adapter,
 * insurer-specific authorization and rate-limiting are implemented.
 */
export async function POST() {
  return NextResponse.json({
    error: "INSURER_INTEGRATION_NOT_APPROVED",
    message: "ยังไม่เปิดให้ขอราคาเบี้ยจริงจากบริษัทประกัน กรุณาใช้แบบฟอร์มขอใบเสนอราคาเพื่อให้เจ้าหน้าที่ติดต่อกลับ",
    quoteRequestPath: "/quote",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
