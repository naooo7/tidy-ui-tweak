import { getStore } from "@/lib/storage";

const STORAGE_KEY = "fastlearner:profile-preferences:v1";

export type ProfilePreferences = {
  version: 1;
  targetInstitutionId: string | null;
  institutionThemeEnabled?: boolean;
  displayName: string;
  avatarUrl: string | null;
  tagline: string;
};

export const DEFAULT_TAGLINE = "Pick up where you left off, or start a focused session.";

const emptyPreferences: ProfilePreferences = {
  version: 1,
  targetInstitutionId: null,
  institutionThemeEnabled: false,
  displayName: "Your Profile",
  avatarUrl: null,
  tagline: "",
};


const listeners = new Set<() => void>();
let browserEnabled = false;
let cachedPreferences: ProfilePreferences = emptyPreferences;

function readPreferences(): ProfilePreferences {
  const stored = getStore().read<ProfilePreferences>(STORAGE_KEY);
  return stored?.version === 1 ? { ...emptyPreferences, ...stored } : emptyPreferences;
}

function notify() {
  cachedPreferences = readPreferences();
  listeners.forEach((listener) => listener());
}

function writePreferences(patch: Partial<ProfilePreferences>) {
  getStore().write<ProfilePreferences>(STORAGE_KEY, { ...readPreferences(), ...patch });
  notify();
}

export function enableBrowserProfilePreferences() {
  if (browserEnabled || typeof window === "undefined") return;
  browserEnabled = true;
  notify();
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) notify();
  });
}

export function subscribeToProfilePreferences(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfilePreferences() {
  return cachedPreferences;
}

export function getTargetInstitutionId() {
  return readPreferences().targetInstitutionId;
}

export function setTargetInstitutionId(targetInstitutionId: string) {
  writePreferences({ targetInstitutionId });
}

export function getInstitutionThemeEnabled() {
  return readPreferences().institutionThemeEnabled === true;
}

export function setInstitutionThemeEnabled(institutionThemeEnabled: boolean) {
  writePreferences({ institutionThemeEnabled });
}

export function setProfileIdentity(displayName: string, avatarUrl: string | null, tagline = "") {
  writePreferences({ displayName: displayName.trim() || emptyPreferences.displayName, avatarUrl, tagline: tagline.trim().slice(0, 120) });
}
