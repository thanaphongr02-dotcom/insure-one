/**
 * Server-side insurance carrier adapter contract.
 * No provider is integrated until an insurer-approved implementation exists.
 * Never expose insurer API credentials to NEXT_PUBLIC_ variables or the browser.
 */
export type CarrierQuoteInput = {
  insuranceType: string;
  productCode: string;
  riskData: Record<string, string | number | boolean | null>;
  consentReference: string;
};
export type CarrierQuote = {
  insurerId: string;
  quoteReference: string;
  currency: "THB";
  premiumAmount: number;
  validUntil: string;
  termsVersion: string;
  source: "insurer_api";
};
export interface CarrierAdapter {
  readonly insurerId: string;
  requestQuote(input: CarrierQuoteInput): Promise<CarrierQuote>;
}
export class CarrierIntegrationUnavailable extends Error {
  constructor(message = "ยังไม่มีสิทธิ์เชื่อมต่อระบบเสนอราคาของบริษัทประกันนี้") {
    super(message);
    this.name = "CarrierIntegrationUnavailable";
  }
}
export function validateCarrierQuote(quote: CarrierQuote, insurerId: string): CarrierQuote {
  if (quote.insurerId !== insurerId || quote.currency !== "THB" ||
      !Number.isFinite(quote.premiumAmount) || quote.premiumAmount <= 0 ||
      !quote.quoteReference.trim() || !quote.termsVersion.trim() ||
      Number.isNaN(Date.parse(quote.validUntil)) || Date.parse(quote.validUntil) <= Date.now() ||
      quote.source !== "insurer_api") {
    throw new Error("Invalid insurer quote response");
  }
  return quote;
}
/** Deliberately empty: register only vetted, contract-approved adapters. */
const approvedAdapters: ReadonlyMap<string, CarrierAdapter> = new Map();
export function getCarrierAdapter(insurerId: string): CarrierAdapter {
  const adapter = approvedAdapters.get(insurerId);
  if (!adapter) throw new CarrierIntegrationUnavailable();
  return adapter;
}
