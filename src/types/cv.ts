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
  email?: string;
  facebook?: string;
  facebookHandle?: string;
  linkedin: string;
  phones: string[];
  photoUrl?: string;
  cvPdfUrl?: string;
  coverLetterPdfUrl?: string;
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
  images?: string[];
  showInCv?: boolean;
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
  link?: string;
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

export interface NavLink {
  href: string;
  label: string;
  sectionId: string;
  pathMatch: string;
}

export interface AdminSettings {
  homeIntro?: string;
  homeProblems?: { num: string; title: string; desc: string }[];
  homeStats?: { val: string; label: string }[];
  homeServices?: { title: string; desc: string }[];
  aboutIntro?: string;
  aboutStats?: { val: string; label: string }[];
  aboutStory?: string[];
  aboutPrinciples?: { title: string; desc: string }[];
  aboutDontDo?: string[];
  servicesIntro?: string;
  servicesOfferings?: { label: string; title: string; desc: string }[];
  servicesWhy?: { title: string; desc: string }[];
  servicesEngagement?: { phase: string; title: string; desc: string; duration: string }[];
  navLinks?: NavLink[];
  homeProblemIntro?: string;
  homeAboutStory?: string[];
  homeCta?: { title: string; desc: string; buttonText: string; buttonHref: string };
  aboutCta?: { title: string; desc: string; buttonText: string; buttonHref: string };
  portfolioSubtext?: string;
  portfolioStats?: { val: string; label: string }[];
  portfolioEcosystems?: { title: string; desc: string }[];
  portfolioCta?: { title: string; desc: string; buttonText: string; buttonHref: string };
  servicesSubtext?: string;
  servicesCta?: { title: string; desc: string; buttonText: string; buttonHref: string };
  contactSubtext?: string;
  contactIntro?: string;
  contactSteps?: { step: string; title: string; desc: string }[];
}

export interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  key: string;
  url: string;
  uploadedAt: string;
}

export interface CVData {
  profile: Profile;
  experiences: Experience[];
  skillGroups: SkillGroup[];
  educations: Education[];
  references: Reference[];
  articles?: Article[];
  documents?: DocumentItem[];
  adminSettings?: AdminSettings;
  updatedAt?: string;
}

