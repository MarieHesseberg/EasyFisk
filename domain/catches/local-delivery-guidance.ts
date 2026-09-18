export type LocalDeliveryRule = {
  zone: string;
  instruction: string;
  sourceUrl: string;
  verifiedOn: string;
};
// Add only confirmed, source-backed local instructions; never infer a delivery location.
export const localDeliveryRules: readonly LocalDeliveryRule[] = [];
export function getLocalDeliveryGuidance(zone: string) {
  return localDeliveryRules.find((rule) => rule.zone === zone);
}
