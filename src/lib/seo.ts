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
  ogType?: "website" | "article";
  articleDetails?: {
    publishedTime: string;
    tags: string[];
    authors?: string[];
  };
}

import { defaultCV } from "./data";

export function buildMetadata(cv: any, page?: PageSEO): Metadata {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
  const fullName = `${profile.name.first} ${profile.name.last}`;
  const reverseName = `${profile.name.last} ${profile.name.first}`; // Common name order in Cambodia
  const defaultTitle = `${reverseName} | Senior Full-Stack Developer (Laravel, NestJS, Spring Boot, Nuxt)`;
  const defaultDesc = `${profile.summary.slice(0, 155)}…`;

  const title = page?.title ? `${page.title} — ${reverseName}` : defaultTitle;
  const description = page?.description ?? defaultDesc;
  const url = `${SITE_URL}${page?.path ?? ""}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: "Lothin Portfolio",
    referrer: "origin-when-cross-origin",
    manifest: "/manifest.json",
    keywords: [
      profile.title,
      "Full-Stack Web Developer",
      "Full-Stack Developer",
      "Chushin Dev",
      "Chushin Technology",
      "Cambodia",
      "Phnom Penh",
      "Vue",
      "Nuxt",
      "React",
      "Next.js",
      "NestJS",
      "Bakong KHQR",
      "NestJS Developer Cambodia",
      "Laravel Developer Phnom Penh",
      "Spring Boot Developer",
      "Docker",
      fullName,
      reverseName,
    ],
    authors: [{ name: fullName, url: profile.website }],
    creator: fullName,
    publisher: fullName,
    category: "technology",

    // Icons configuration
    icons: {
      icon: [
        { url: "/icon.png", type: "image/png" },
      ],
      apple: [
        { url: "/icon.png", sizes: "180x180", type: "image/png" },
      ],
    },

    // Apple web app capability
    appleWebApp: {
      capable: true,
      title: title,
      statusBarStyle: "default",
    },

    // Open Graph
    openGraph: {
      type: page?.ogType ?? "website",
      url,
      title,
      description,
      siteName: defaultTitle,
      locale: "en_US",
      alternateLocale: ["km_KH"],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
      ...(page?.ogType === "article" && page.articleDetails ? {
        publishedTime: page.articleDetails.publishedTime,
        authors: page.articleDetails.authors ?? [fullName],
        tags: page.articleDetails.tags,
      } : {}),
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@lothindev",
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
  const fullName = `${profile.name.first} ${profile.name.last}`;
  const reverseName = `${profile.name.last} ${profile.name.first}`;

  // Extract skills dynamically for semantic SEO
  const skills = cvData.skillGroups
    ? cvData.skillGroups.flatMap((group: any) => group.skills)
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: reverseName,
    alternateName: fullName,
    jobTitle: profile.title,
    url: profile.website,
    image: `${SITE_URL}/og-image.png`,
    description: profile.summary,
    knowsAbout: skills,
    gender: "http://schema.org/Male",
    alumniOf: {
      "@type": "EducationalOrganization",
      "name": "Setec Institute",
      "url": "https://setec.edu.kh"
    },
    worksFor: {
      "@type": "Organization",
      "name": "IDG Technology Solutions"
    },
    sameAs: [profile.telegram, profile.linkedin, profile.facebook].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Phnom Penh",
      addressRegion: "Phnom Penh",
      addressCountry: "KH",
    },
  };
}

/** JSON-LD structured data for the WebSite */
export function websiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Lothin Thoeun | Senior Full-Stack Developer",
    description: "Professional portfolio of Lothin Thoeun, Senior Full-Stack Developer specialized in Vue/Nuxt, React/Next.js, NestJS, Laravel, and Spring Boot.",
    publisher: {
      "@id": `${SITE_URL}/#person`
    },
    inLanguage: "en-US"
  };
}

/** JSON-LD structured data for a blog post/article */
export function articleJsonLd(cv: any, article: any): object {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
  const reverseName = `${profile.name.last} ${profile.name.first}`;

  let datePublished = "";
  try {
    datePublished = new Date(article.date).toISOString();
  } catch (e) {
    datePublished = new Date().toISOString();
  }

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/articles/${article.slug}/#article`,
    headline: article.title,
    description: article.excerpt,
    datePublished: datePublished,
    author: {
      "@type": "Person",
      "name": reverseName,
      "url": profile.website
    },
    publisher: {
      "@type": "Organization",
      "name": "Lothin Thoeun",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`
    },
    "image": `${SITE_URL}/og-image.png`,
    "keywords": article.tags
  };
}

/** JSON-LD structured data for Breadcrumbs */
export function breadcrumbsJsonLd(pathSegments: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": pathSegments.map((seg, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": seg.name,
      "item": `${SITE_URL}${seg.path}`
    }))
  };
}

/** JSON-LD structured data for the portfolio page (CollectionPage + CreativeWorks) */
export function portfolioJsonLd(cv: any): object {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { experiences } = cvData;

  const creativeWorks = (experiences || []).map((exp: any) => ({
    "@type": "CreativeWork",
    "name": exp.title,
    "creator": {
      "@id": `${SITE_URL}/#person`
    },
    "publisher": {
      "@id": `${SITE_URL}/#person`
    },
    "description": exp.bullets.join(" "),
    "dateCreated": exp.period,
    "keywords": exp.tags
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/portfolio/#webpage`,
    "url": `${SITE_URL}/portfolio`,
    "name": "Thoeun Lothin's Portfolio of Work",
    "description": "Featured production platforms, payment gateways, and enterprise software systems developed by Thoeun Lothin.",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": creativeWorks.length,
      "itemListElement": creativeWorks.map((work: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": work
      }))
    }
  };
}

/** JSON-LD structured data for Services */
export function servicesJsonLd(cv: any): object {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
  const reverseName = `${profile.name.last} ${profile.name.first}`;

  const servicesOfferings = [
    {
      "title": "High-End Full-Stack Consulting",
      "desc": "I audit your application rendering logic, state stores, and database schemas. I locate query bottlenecks, bloated payloads, and provide a clear, step-by-step optimization plan."
    },
    {
      "title": "Custom Web Development",
      "desc": "I build responsive frontend clients in Vue/Nuxt, React/Next, and Angular, wired into NestJS, Laravel, or Spring Boot REST APIs with strict TypeScript contracts."
    },
    {
      "title": "Long-Term Technical Advisory",
      "desc": "Get ongoing access to someone who thinks about software architecture, package upgrades, security hardening, and database structures for a living, without hiring full-time."
    },
    {
      "title": "Core System & Payment Integrations",
      "desc": "Implement Cambodia-native Bakong KHQR checkouts (signature checks, deep links, webhooks), real-time booking status Pusher logs, and Firebase user management workflows."
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services/#service`,
    "provider": {
      "@id": `${SITE_URL}/#person`
    },
    "name": "Full-Stack Development and Advisory Services",
    "description": "High-end software consulting, custom web application development, technical advisory, and secure system integrations by Lothin Thoeun.",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Development & Consulting Catalog",
      "itemListElement": servicesOfferings.map((offering, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": offering.title,
          "description": offering.desc
        }
      }))
    }
  };
}

/** JSON-LD structured data for the Contact Page */
export function contactJsonLd(cv: any): object {
  const cvData = (cv && cv.profile) ? cv : defaultCV;
  const { profile } = cvData;
  const reverseName = `${profile.name.last} ${profile.name.first}`;

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contact/#webpage`,
    "url": `${SITE_URL}/contact`,
    "name": `Contact ${reverseName}`,
    "description": `Get in touch with Lothin Thoeun, Senior Full-Stack Developer in Phnom Penh, Cambodia, for custom development and consulting.`,
    "mainEntity": {
      "@id": `${SITE_URL}/#person`
    }
  };
}
