import type { PermitBuyer } from "@/domain/fishing-permits/permit-purchase";
import { getDefaultAppServices } from "@/data/runtime/services";
import { emptyProfile } from "@/data/local-storage/local-profile";
export { emptyProfile, profileKey } from "@/data/local-storage/local-profile";
// Synchronous draft prefill uses the local profile; it is not an authenticated account.
export function readProfile(): PermitBuyer {
  try {
    return getDefaultAppServices().profile.read();
  } catch {
    return { ...emptyProfile };
  }
}
export function saveProfile(profile: PermitBuyer) {
  getDefaultAppServices().profile.save(profile);
  window.dispatchEvent(new Event("easyfisk-profile-changed"));
}
