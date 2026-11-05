/**
 * Multi-insurer catalog capabilities.
 * Listing an insurance category does NOT grant authority to sell it.
 * The server must verify approved insurer, product, agent appointment and
 * payment/issuance permissions before any binding purchase action.
 */
export type InsuranceLine =
  | "motor" | "health_non_life" | "personal_accident" | "travel"
  | "home_property" | "business" | "agriculture" | "marine"
  | "liability" | "life" | "other";

export type InsurerCapability = {
  insurerId: string;
  productId: string;
  line: InsuranceLine;
  appointmentVerified: boolean;
  productApprovedForOnlineSales: boolean;
  paymentCollectionAuthorized: boolean;
  policyIssuanceIntegrated: boolean;
  licenseScopeVerified: boolean;
};

export type SaleMode = "information_only" | "request_quote" | "assisted_sale" | "online_checkout";

export function determineSaleMode(c: InsurerCapability | null): SaleMode {
  if (!c || !c.appointmentVerified || !c.licenseScopeVerified) return "information_only";
  if (!c.productApprovedForOnlineSales) return "request_quote";
  if (!c.paymentCollectionAuthorized || !c.policyIssuanceIntegrated) return "assisted_sale";
  return "online_checkout";
}

export const insuranceLines: ReadonlyArray<{ id: InsuranceLine; label: string }> = [
  { id: "motor", label: "ประกันรถยนต์" },
  { id: "health_non_life", label: "ประกันสุขภาพ (วินาศภัย)" },
  { id: "personal_accident", label: "ประกันอุบัติเหตุ" },
  { id: "travel", label: "ประกันเดินทาง" },
  { id: "home_property", label: "ประกันบ้านและทรัพย์สิน" },
  { id: "business", label: "ประกันธุรกิจ" },
  { id: "agriculture", label: "ประกันการเกษตร" },
  { id: "marine", label: "ประกันภัยทางทะเลและขนส่ง" },
  { id: "liability", label: "ประกันความรับผิด" },
  { id: "life", label: "ประกันชีวิต (ต้องมีสิทธิ์/ใบอนุญาตที่เกี่ยวข้องเพิ่มเติม)" },
  { id: "other", label: "ประกันประเภทอื่น" },
];
