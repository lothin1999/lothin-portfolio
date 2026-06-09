// src/lib/seo.ts
import type { Metadata } from "next";
import type { CVData } from "@/types/cv";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lothin-dev.pages.dev";

interface PageSEO {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function buildMetadata(cv: CVData, page?: PageSEO): Metadata {
  const { profile } = cv;
  const fullName = `${profile.name.first} ${profile.name.last}`;
  const defaultTitle = `${fullName} — ${profile.title}`;
  const defaultDesc = `${profile.summary.slice(0, 155)}…`;

  const title = page?.title ? `${page.title} — ${fullName}` : defaultTitle;
  const description = page?.description ?? defaultDesc;
  const url = `${SITE_URL}${page?.path ?? ""}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      profile.title,
      "Full-Stack Developer",
      "Cambodia",
      "Phnom Penh",
      "Vue",
      "Nuxt",
      "React",
      "NestJS",
      "Bakong KHQR",
      fullName,
    ],
    authors: [{ name: fullName, url: profile.website }],
    creator: fullName,

    // Open Graph
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: defaultTitle,
      locale: "en_US",
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@lothindev",
    },

    // Canonical
    alternates: { canonical: url },

    // Robots
    robots: page?.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/** JSON-LD structured data for the portfolio person */
export function personJsonLd(cv: CVData): object {
  const { profile } = cv;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${profile.name.first} ${profile.name.last}`,
    jobTitle: profile.title,
    url: profile.website,
    sameAs: [profile.telegram, profile.linkedin].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Phnom Penh",
      addressCountry: "KH",
    },
  };
}
