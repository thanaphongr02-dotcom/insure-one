import { NextResponse } from "next/server";
import { prospectiveInsurers } from "@/lib/insurance/prospective-insurers";
import { canRequestLiveQuote } from "@/lib/insurance/integrations";

/**
 * Public discovery endpoint contains no private contract notes or credentials.
 * An unverified prospect is NOT a sales partner.
 */
export async function GET() {
  return NextResponse.json({
    integrationMode: "prospect_only",
    liveQuotesAvailable: false,
    insurers: prospectiveInsurers.map(x => ({
      id: x.insurerId,
      suppliedName: x.legalName,
      relationship: "prospective_unverified",
      liveQuoteEnabled: canRequestLiveQuote(x),
      onlineCheckoutEnabled: false,
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
