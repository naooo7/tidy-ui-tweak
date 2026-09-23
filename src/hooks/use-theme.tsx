import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { institutionById, institutions, type Institution, type InstitutionPalette } from "@/data/institutions";
import { getStore } from "@/lib/storage";
import {
  getInstitutionThemeEnabled,
  getTargetInstitutionId,
  setInstitutionThemeEnabled as persistInstitutionThemeEnabled,
  setTargetInstitutionId as persistTargetInstitutionId,
} from "@/services/profile-preferences";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  resolvedTheme: "light" | "dark";
  targetInstitutionId: string | null;
  targetInstitution: Institution | undefined;
  setTargetInstitutionId: (institutionId: string) => void;
  institutionThemeEnabled: boolean;
  setInstitutionThemeEnabled: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "fastlearner-theme";

const paletteProperties: Record<keyof InstitutionPalette, string> = {
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  ring: "--ring",
  answerHover: "--answer-hover",
  answerHoverForeground: "--answer-hover-foreground",
  answerSelected: "--answer-selected",
  answerSelectedForeground: "--answer-selected-foreground",
  answerSelectedBorder: "--answer-selected-border",
};

function getSystemTheme(): "light" | "dark" {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readPreference(): ThemePreference {
  const stored = getStore().read<string>(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? (stored as ThemePreference) : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [targetInstitutionId, setTargetInstitutionIdState] = useState<string | null>(null);
  const [institutionThemeEnabled, setInstitutionThemeEnabledState] = useState(false);

  const refreshFromStorage = () => {
    setPreferenceState(readPreference());
    setTargetInstitutionIdState(getTargetInstitutionId());
    setInstitutionThemeEnabledState(getInstitutionThemeEnabled());
  };

  useEffect(() => {
    refreshFromStorage();
    setSystemTheme(getSystemTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? "dark" : "light");
    media.addEventListener("change", handleMediaChange);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key?.startsWith("fastlearner:profile-preferences")) {
        refreshFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      media.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const resolvedTheme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const targetInstitution = useMemo(() => 
    institutionById(targetInstitutionId), 
    [targetInstitutionId]
  );

  useEffect(() => {
    const root = document.documentElement;
    const institution = institutionThemeEnabled ? targetInstitution : undefined;
    
    if (!institution) {
      Object.values(paletteProperties).forEach((property) => root.style.removeProperty(property));
      root.removeAttribute("data-institution-theme");
      return;
    }

    const palette = institution.theme[resolvedTheme];
    (Object.keys(paletteProperties) as Array<keyof InstitutionPalette>).forEach((key) => {
      root.style.setProperty(paletteProperties[key], palette[key]);
    });
    root.dataset["institutionTheme"] = institution.id;
  }, [institutionThemeEnabled, resolvedTheme, targetInstitution]);

  const setPreference = (newPref: ThemePreference) => {
    getStore().write(STORAGE_KEY, newPref);
    setPreferenceState(newPref);
  };

  const setTargetInstitutionId = (institutionId: string) => {
    persistTargetInstitutionId(institutionId);
    setTargetInstitutionIdState(institutionId);
  };

  const setInstitutionThemeEnabled = (enabled: boolean) => {
    persistInstitutionThemeEnabled(enabled);
    setInstitutionThemeEnabledState(enabled);
  };

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      resolvedTheme,
      targetInstitutionId,
      targetInstitution,
      setTargetInstitutionId,
      institutionThemeEnabled,
      setInstitutionThemeEnabled,
    }),
    [preference, resolvedTheme, targetInstitutionId, targetInstitution, institutionThemeEnabled],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
