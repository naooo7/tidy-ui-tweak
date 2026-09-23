import { useEffect, useSyncExternalStore } from "react";
import {
  enableBrowserProfilePreferences,
  getProfilePreferences,
  subscribeToProfilePreferences,
  type ProfilePreferences,
} from "@/services/profile-preferences";

const serverSnapshot: ProfilePreferences = {
  version: 1,
  targetInstitutionId: null,
  institutionThemeEnabled: false,
  displayName: "Your Profile",
  avatarUrl: null,
  tagline: "",
};


export function useProfilePreferences() {
  const preferences = useSyncExternalStore(
    subscribeToProfilePreferences,
    getProfilePreferences,
    () => serverSnapshot,
  );
  useEffect(() => enableBrowserProfilePreferences(), []);
  return preferences;
}