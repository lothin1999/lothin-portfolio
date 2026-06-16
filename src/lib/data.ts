import type { CVData } from "@/types/cv";

export const defaultCV: CVData = {
  profile: {
    name: { first: "", last: "" },
    title: "",
    tagline: "",
    summary: "",
    location: "",
    website: "",
    telegram: "",
    telegramHandle: "",
    linkedin: "",
    phones: [],
    photoUrl: "",
    cvPdfUrl: "",
    coverLetterPdfUrl: "",
    languages: [],
  },
  experiences: [],
  skillGroups: [],
  educations: [],
  references: [],
  articles: [],
  adminSettings: {},
};

