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
    languages: [],
  },
  experiences: [],
  skillGroups: [],
  educations: [],
  references: [],
  articles: [],
};

