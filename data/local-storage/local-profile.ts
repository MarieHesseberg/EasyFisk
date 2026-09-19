import type { PermitBuyer } from "../../domain/fishing-permits/permit-purchase";
import type { KeyValueStorage } from "../contracts/key-value-storage";
export const emptyProfile: PermitBuyer = { fullName: "", birthDate: "", email: "", phone: "" };
export const profileKey = "easyfisk-profile-v1";
export function createLocalProfile(storage: KeyValueStorage) {
  return {
    read(): PermitBuyer {
      const value = JSON.parse(storage.getItem(profileKey) ?? "null");
      if (value === null) return { ...emptyProfile };
      if (!Object.keys(emptyProfile).every((key) => typeof value[key] === "string"))
        throw new Error("Invalid saved profile");
      return {
        fullName: value.fullName,
        birthDate: value.birthDate,
        email: value.email,
        phone: value.phone,
      };
    },
    save(profile: PermitBuyer) {
      storage.setItem(profileKey, JSON.stringify(profile));
    },
  };
}
