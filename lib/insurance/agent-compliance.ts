/**
 * Compliance-safe display configuration for a Thai individual non-life insurance agent.
 * These are defaults, not proof of regulatory authorization.
 * Do not publish a company partnership, license number or insurer payment link
 * until verified against the actual license and insurer authorization.
 */
export const agentCompliance = {
  legalCapacity: "individual_non_life_insurance_agent",
  businessModel: "agent",
  displayLicenseNumber: null as string | null,
  verifiedInsurers: [] as readonly string[],
  premiumCollectionEnabled: false,
  insurerIssuanceEnabled: false,
  directPaymentEnabled: false,
} as const;

export function canOfferInsurer(insurerName: string): boolean {
  return agentCompliance.verifiedInsurers.includes(insurerName);
}

export function canAcceptPremiums(): boolean {
  return agentCompliance.premiumCollectionEnabled;
}
