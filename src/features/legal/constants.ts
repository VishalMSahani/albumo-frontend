// Acceptance version must match backend/src/features/legal/legal.constants.ts.
export const LEGAL_POLICY_VERSION = "2026-09-02";
export const LEGAL_LAST_UPDATED = "October 14, 2026";
export const LEGAL_ENTITY =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "Albumo Studio Pvt Ltd";
export const LEGAL_POLICY_LINKS = {
  termsAndConditions: "/terms-and-conditions",
  privacyPolicy: "/privacy-policy",
  refundPolicy: "/refund-policy",
  shippingPolicy: "/shipping-policy",
  cancellationPolicy: "/cancellation-policy",
  disclaimer: "/disclaimer",
  cookiePolicy: "/cookie-policy",
} as const;
export function createLegalAcceptance() {
  return { accepted: true as const, policyVersion: LEGAL_POLICY_VERSION };
}
