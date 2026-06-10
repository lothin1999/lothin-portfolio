import type { CVData } from "@/types/cv";

export const defaultCV: CVData = {
  profile: {
    name: { first: "Thoeun", last: "Lothin" },
    title: "Full-Stack Developer",
    tagline: "3+ Years · Production Systems",
    summary:
      "Full-stack developer across Vue/Nuxt, React/Next.js, and Angular — with NestJS, Laravel, and Spring Boot on the back end. Delivered nationwide rental marketplaces, enterprise POS, banking, and loan platforms. Specialised in Cloudflare edge infrastructure, Firebase real-time systems, and Cambodia-native Bakong KHQR payment integration.",
    location: "Phnom Penh, Cambodia",
    website: "https://lothin-dev.vercel.app",
    telegram: "https://t.me/lothindev",
    telegramHandle: "@lothindev",
    linkedin: "https://linkedin.com/in/lothin-dev",
    phones: ["098 63 88 78", "066 69 55 37"],
    photoUrl: "",
    languages: [
      { name: "Khmer", level: "Native" },
      { name: "English", level: "Professional" },
    ],
  },
  experiences: [
    {
      id: "exp-1",
      title: "Full-Stack Developer",
      company: "IDG Technology Solutions",
      location: "Phnom Penh, Cambodia",
      period: "2025 – Present",
      bullets: [
        "Built nationwide motorbike rental marketplace with Nuxt 4 SSR and province-based filtering across 25+ Cambodian provinces",
        "Developed complete booking engine — availability calendar, pricing engine, and special deals module",
        "Integrated multi-language Khmer/English support with mobile-first responsive UI",
        "Implemented merchant review & rating system with verified badges and star ratings",
        "Used Google AI Studio (Gemini) to train and fine-tune AI models, analyse datasets, and integrate intelligent features including smart search, data classification, and automated content insights",
      ],
      tags: ["Nuxt 4", "SSR", "Gemini AI", "AI Model Training", "Bakong KHQR"],
    },
    {
      id: "exp-2",
      title: "Full-Stack Developer",
      company: "IDG Technology Solutions",
      location: "Phnom Penh, Cambodia",
      period: "2024 – Present",
      bullets: [
        "Built POS system in Nuxt 2 with 8-metric admin dashboard, revenue charts, and Khmer-language UI",
        "Led full Nuxt 2 → 3 → 4 migration, resolving breaking changes and adopting Composition API",
        "Replaced Laravel backend with modular NestJS + Prisma monorepo with JWT auth and DTO validation",
        "Developed enterprise Banking Platform with real-time transaction processing and multi-branch support",
      ],
      tags: ["NestJS", "Prisma", "Nuxt 2→4", "JWT", "Banking Platform"],
    },
    {
      id: "exp-3",
      title: "Full-Stack Developer",
      company: "IDG Technology Solutions",
      location: "Phnom Penh, Cambodia",
      period: "2023 – 2024",
      bullets: [
        "Delivered CRM, Hotel Management, KDMS, Loan, Pool/Billiard, and VIP systems end-to-end",
        "Built real-time pool hall management with Pusher — table booking, session billing, live status board",
        "Integrated Firebase and Pusher for live notifications across multiple projects",
        "Managed cPanel hosting, DB migrations, and Ubuntu Server production deployments",
      ],
      tags: ["Laravel", "Pusher", "Firebase", "WebSockets", "Ubuntu Server"],
    },
  ],
  skillGroups: [
    {
      label: "Front-End",
      skills: [
        "Vue 3", "Nuxt 2/3/4", "React.js", "Next.js", "Angular",
        "TypeScript", "Tailwind CSS", "Pinia / Redux", "RxJS",
      ],
    },
    {
      label: "Back-End",
      skills: ["NestJS", "Laravel", "Spring Boot", "Prisma ORM", "JWT", "REST API"],
    },
    {
      label: "Databases",
      skills: ["MySQL", "PostgreSQL", "Oracle", "MongoDB", "Firestore"],
    },
    {
      label: "DevOps & Cloud",
      skills: ["Docker", "Cloudflare", "Firebase", "Ubuntu Server", "Nginx", "GitHub", "GitLab"],
    },
    {
      label: "Integrations",
      skills: [
        "Bakong KHQR", "Pusher", "WebSockets", "FCM", "SSR / ISR",
        "Google AI Studio (Gemini)", "AI Model Training", "Data Analysis / ML",
      ],
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "Bachelor's Degree — Information Technology",
      school: "Setec Institute",
      location: "Phnom Penh, Cambodia",
      period: "'19 – '23",
      description: "4-year program with core focus on software development, networking, and database systems.",
      courses: [
        "C++ / C#", "Java I–III", "Web Dev I–III", "Python / Adv Python",
        "Data Structure", "Database & Oracle", "Mobile Application",
        "System Analysis", "Networking I–III", "Linux System Admin",
        "UX/UI Design", "E-Commerce", "Ethics & Law of IT",
      ],
    },
    {
      id: "edu-2",
      degree: "Full-Stack Development & Java",
      school: "Piset Java School",
      location: "Phnom Penh, Cambodia",
      period: "Intensive",
      description:
        "Intensive program covering Full-Stack Web Development, Java Programming, Core Spring Framework, and Spring Boot — focused on building enterprise-grade applications.",
      courses: ["Full-Stack Dev", "Java Programming", "Spring Framework", "Spring Boot", "Angular Beginner → Adv"],
    },
    {
      id: "edu-3",
      degree: "DevOps & Self Study",
      school: "Independent",
      location: "",
      period: "Ongoing",
      description:
        "Docker, Cloudflare, Ubuntu Server, CI/CD — learned through self-study and knowledge sharing with peers.",
      courses: ["Docker", "Cloudflare", "Ubuntu Server", "CI/CD"],
    },
  ],
  references: [
    {
      name: "Pheap Sopheaktra",
      role: "Full-Stack Developer",
      company: "IDG Technology Solutions",
      contact: "096 92 84 202",
    },
    {
      name: "Sopheak HUN",
      role: "Backend Developer",
      company: "TurboTech Co., LTD",
      contact: "+855 93 259 390",
    },
  ],
};
