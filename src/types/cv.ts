// src/types/cv.ts

export interface Profile {
  name: { first: string; last: string };
  title: string;
  tagline: string;
  summary: string;
  location: string;
  website: string;
  telegram: string;
  telegramHandle: string;
  linkedin: string;
  phones: string[];
  photoUrl?: string;
  languages: { name: string; level: string }[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
  tags: string[];
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  period: string;
  description: string;
  courses: string[];
}

export interface Reference {
  name: string;
  role: string;
  company: string;
  contact: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string; // Markdown text content
  tags: string[];
  featured?: boolean;
  readingTime?: string;
}

export interface CVData {
  profile: Profile;
  experiences: Experience[];
  skillGroups: SkillGroup[];
  educations: Education[];
  references: Reference[];
  articles?: Article[];
  updatedAt?: string;
}
