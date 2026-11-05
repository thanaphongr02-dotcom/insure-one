import { NextResponse } from "next/server";

// Intentionally fail closed. Replace only after an approved provider,
// authenticated order ownership, server-side amount lookup, and verified
// provider webhook + database transition have been implemented and tested.
export async function POST() {
  return NextResponse.json(
    {
      error: "PAYMENTS_NOT_CONFIGURED",
      message: "ยังไม่เปิดรับชำระเงินออนไลน์ กรุณารอการเชื่อมต่อผู้ให้บริการที่ได้รับอนุญาต",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
