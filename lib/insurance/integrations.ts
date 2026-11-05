/**
 * Insurer integration registry: fail closed until each insurer provides
 * credentials, a contract, a product feed and an approved sales flow.
 * Public product information is not a quote API or proof of authorization.
 */
export type IntegrationStatus = "not_contacted" | "contacted" | "under_review" | "sandbox" | "approved" | "suspended";
export type IntegrationMode = "manual_approved_catalog" | "partner_portal" | "api";

export type InsurerIntegration = {
  insurerId: string;
  legalName: string;
  status: IntegrationStatus;
  mode: IntegrationMode;
  contractVerified: boolean;
  licenseScopeVerified: boolean;
  onlineSalesApproved: boolean;
  quoteApiApproved: boolean;
  paymentFlowApproved: boolean;
  issuanceApiApproved: boolean;
  commissionTermsVerified: boolean;
  sourceUpdatedAt: string | null;
};

export function canRequestLiveQuote(x: InsurerIntegration): boolean {
  return x.status === "approved" && x.contractVerified && x.licenseScopeVerified &&
    x.onlineSalesApproved && x.quoteApiApproved && x.mode === "api";
}
export function canLaunchCheckout(x: InsurerIntegration): boolean {
  return canRequestLiveQuote(x) && x.paymentFlowApproved && x.issuanceApiApproved;
}
export function canTrackCommission(x: InsurerIntegration): boolean {
  return x.contractVerified && x.commissionTermsVerified;
}
