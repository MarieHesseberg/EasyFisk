import type { PermitBuyer } from "@/domain/fishing-permits/permit-purchase";
export const emptyProfile: PermitBuyer = { fullName: "", birthDate: "", email: "", phone: "" };
export const profileKey = "easyfisk-profile-v1";
export function readProfile(): PermitBuyer {
  try {
    const value = JSON.parse(localStorage.getItem(profileKey) ?? "null");
    if (value && Object.keys(emptyProfile).every((key) => typeof value[key] === "string"))
      return {
        fullName: value.fullName,
        birthDate: value.birthDate,
        email: value.email,
        phone: value.phone,
      };
  } catch {
    /* An empty profile does not block registration. */
  }
  return { ...emptyProfile };
}
export function saveProfile(profile: PermitBuyer) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
  window.dispatchEvent(new Event("easyfisk-profile-changed"));
}
