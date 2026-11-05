import { NextResponse } from "next/server";

/**
 * Public API must not advertise uncontracted prospect insurers as partners.
 * Prospect tracking is available only through the admin-only database RLS.
 */
export async function GET() {
  return NextResponse.json({
    integrationMode: "not_connected",
    liveQuotesAvailable: false,
    insurers: [],
    message: "ยังไม่มีบริษัทประกันที่ได้รับอนุมัติให้เชื่อมต่อ API หรือจำหน่ายผ่าน INSURE ONE",
  }, { headers: { "Cache-Control": "no-store" } });
}
