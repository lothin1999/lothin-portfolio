// src/lib/seo.ts
import type { Metadata } from "next";
import type { CVData } from "@/types/cv";

const cleanEnvVar = (val: string | undefined) => (val || "").trim().replace(/^['"]|['"]$/g, "");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? cleanEnvVar(process.env.NEXT_PUBLIC_SITE_URL)
  : "https://lothin-portfolio.pages.dev";

interface PageSEO {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

import { defaultCV } from "./data";

export function buildMetadata(cv: any, page?: PageSEO): Metadata {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
  const fullName = `${profile.name.first} ${profile.name.last}`;
  const defaultTitle = `${fullName} (Chushin Dev) — ${profile.title}`;
  const defaultDesc = `${profile.summary.slice(0, 155)}…`;

  const title = page?.title ? `${page.title} — ${fullName} (Chushin Dev)` : defaultTitle;
  const description = page?.description ?? defaultDesc;
  const url = `${SITE_URL}${page?.path ?? ""}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: [
      profile.title,
      "Full-Stack Web Developer",
      "Chushin Dev",
      "Chushin Technology",
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
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@lothindev",
      images: ["/og-image.png"],
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
    verification: {
      google: "ubtwP5KtvCl8qcDlgXh866qrykLOSi_QO0nWMX7C4Ps",
    },
  };
}

/** JSON-LD structured data for the portfolio person */
export function personJsonLd(cv: any): object {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
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
