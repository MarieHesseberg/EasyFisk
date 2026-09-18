"use client";
import { useEffect, useState } from "react";
import { emptyProfile, readProfile } from "./local-profile";
export function useLocalProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  useEffect(() => {
    const refresh = () => setProfile(readProfile());
    refresh();
    window.addEventListener("easyfisk-profile-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("easyfisk-profile-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return profile;
}
