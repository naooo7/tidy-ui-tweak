export type Institution = {
  id: string;
  shortName: string;
  name: string;
  logo: string;
  theme: {
    light: InstitutionPalette;
    dark: InstitutionPalette;
  };
};

export type InstitutionPalette = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  ring: string;
  answerHover: string;
  answerHoverForeground: string;
  answerSelected: string;
  answerSelectedForeground: string;
  answerSelectedBorder: string;
};

export const institutions: Institution[] = [
  {
    id: "pkn-stan",
    shortName: "PKN STAN",
    name: "Politeknik Keuangan Negara STAN",
    logo: "/institutions/pkn-stan.png",
    theme: {
      light: { primary: "oklch(0.42 0.16 259)", primaryForeground: "oklch(0.99 0.004 95)", secondary: "oklch(0.95 0.025 252)", secondaryForeground: "oklch(0.29 0.11 258)", accent: "oklch(0.91 0.065 91)", accentForeground: "oklch(0.35 0.08 78)", ring: "oklch(0.5 0.16 259)", answerHover: "oklch(0.96 0.025 252)", answerHoverForeground: "oklch(0.27 0.1 258)", answerSelected: "oklch(0.9 0.055 252)", answerSelectedForeground: "oklch(0.25 0.12 258)", answerSelectedBorder: "oklch(0.48 0.16 259)" },
      dark: { primary: "oklch(0.68 0.18 255)", primaryForeground: "oklch(0.13 0.035 260)", secondary: "oklch(0.23 0.055 258)", secondaryForeground: "oklch(0.93 0.025 252)", accent: "oklch(0.3 0.1 257)", accentForeground: "oklch(0.91 0.035 250)", ring: "oklch(0.68 0.18 255)", answerHover: "oklch(0.245 0.045 258)", answerHoverForeground: "oklch(0.96 0.015 250)", answerSelected: "oklch(0.3 0.105 257)", answerSelectedForeground: "oklch(0.97 0.014 250)", answerSelectedBorder: "oklch(0.69 0.18 255)" },
    },
  },
  {
    id: "unpad",
    shortName: "UNPAD",
    name: "Universitas Padjadjaran",
    logo: "/institutions/unpad.svg",
    theme: {
      light: { primary: "oklch(0.68 0.17 72)", primaryForeground: "oklch(0.2 0.035 61)", secondary: "oklch(0.96 0.035 82)", secondaryForeground: "oklch(0.31 0.075 61)", accent: "oklch(0.9 0.12 78)", accentForeground: "oklch(0.29 0.07 61)", ring: "oklch(0.62 0.17 68)", answerHover: "oklch(0.97 0.035 82)", answerHoverForeground: "oklch(0.29 0.065 61)", answerSelected: "oklch(0.91 0.095 78)", answerSelectedForeground: "oklch(0.25 0.065 58)", answerSelectedBorder: "oklch(0.61 0.17 68)" },
      dark: { primary: "oklch(0.82 0.17 82)", primaryForeground: "oklch(0.14 0.025 65)", secondary: "oklch(0.235 0.025 72)", secondaryForeground: "oklch(0.95 0.03 84)", accent: "oklch(0.34 0.09 65)", accentForeground: "oklch(0.96 0.05 85)", ring: "oklch(0.82 0.17 82)", answerHover: "oklch(0.245 0.03 70)", answerHoverForeground: "oklch(0.96 0.025 82)", answerSelected: "oklch(0.31 0.095 68)", answerSelectedForeground: "oklch(0.98 0.025 84)", answerSelectedBorder: "oklch(0.82 0.17 82)" },
    },
  },
  {
    id: "ui",
    shortName: "UI",
    name: "Universitas Indonesia",
    logo: "/institutions/ui.png",
    theme: {
      light: { primary: "oklch(0.68 0.16 82)", primaryForeground: "oklch(0.2 0.035 72)", secondary: "oklch(0.95 0.045 88)", secondaryForeground: "oklch(0.31 0.07 76)", accent: "oklch(0.88 0.095 83)", accentForeground: "oklch(0.3 0.07 72)", ring: "oklch(0.64 0.16 79)", answerHover: "oklch(0.96 0.04 88)", answerHoverForeground: "oklch(0.27 0.06 74)", answerSelected: "oklch(0.9 0.09 85)", answerSelectedForeground: "oklch(0.25 0.065 72)", answerSelectedBorder: "oklch(0.62 0.16 79)" },
      dark: { primary: "oklch(0.8 0.16 88)", primaryForeground: "oklch(0.14 0.025 75)", secondary: "oklch(0.235 0.025 82)", secondaryForeground: "oklch(0.95 0.035 90)", accent: "oklch(0.32 0.08 84)", accentForeground: "oklch(0.96 0.045 90)", ring: "oklch(0.8 0.16 88)", answerHover: "oklch(0.245 0.03 82)", answerHoverForeground: "oklch(0.96 0.018 88)", answerSelected: "oklch(0.3 0.085 84)", answerSelectedForeground: "oklch(0.98 0.02 90)", answerSelectedBorder: "oklch(0.8 0.16 88)" },
    },
  },
  {
    id: "itb",
    shortName: "ITB",
    name: "Institut Teknologi Bandung",
    logo: "/institutions/itb.png",
    theme: {
      light: { primary: "oklch(0.44 0.15 246)", primaryForeground: "oklch(0.99 0.003 95)", secondary: "oklch(0.95 0.03 239)", secondaryForeground: "oklch(0.28 0.1 247)", accent: "oklch(0.9 0.055 225)", accentForeground: "oklch(0.29 0.1 247)", ring: "oklch(0.49 0.15 246)", answerHover: "oklch(0.96 0.025 239)", answerHoverForeground: "oklch(0.26 0.1 247)", answerSelected: "oklch(0.9 0.06 239)", answerSelectedForeground: "oklch(0.23 0.11 247)", answerSelectedBorder: "oklch(0.49 0.15 246)" },
      dark: { primary: "oklch(0.72 0.145 238)", primaryForeground: "oklch(0.13 0.035 250)", secondary: "oklch(0.23 0.05 245)", secondaryForeground: "oklch(0.94 0.025 239)", accent: "oklch(0.3 0.09 238)", accentForeground: "oklch(0.96 0.025 230)", ring: "oklch(0.72 0.145 238)", answerHover: "oklch(0.245 0.045 247)", answerHoverForeground: "oklch(0.96 0.014 239)", answerSelected: "oklch(0.3 0.095 242)", answerSelectedForeground: "oklch(0.97 0.014 239)", answerSelectedBorder: "oklch(0.73 0.145 238)" },
    },
  },
];

export const institutionById = (id: string | null) =>
  institutions.find((institution) => institution.id === id);