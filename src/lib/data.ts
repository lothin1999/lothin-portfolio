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
  articles: [
    {
      slug: "css-architecture-bem-methodology",
      title: "Why I Choose BEM Over CSS Modules (Most of the Time)",
      excerpt: "CSS architecture is a decision with long-term consequences. Here is why I often reach for BEM methodology over CSS Modules in enterprise codebases.",
      date: "Dec 15, 2025",
      readingTime: "5 min read",
      featured: true,
      tags: ["CSS", "Architecture", "Design Systems"],
      content: `## The Long-term Impact of CSS Architecture

In large frontend codebases, CSS can easily become a bottleneck. Class name collisions, bloated selectors, and nested cascade paths often make updates risky. While modern frameworks offer encapsulated solutions like **CSS Modules** or **CSS-in-JS**, I frequently find myself choosing the classic **BEM (Block, Element, Modifier)** methodology.

Here is why BEM remains highly practical in large-scale projects, and where encapsulation utilities are best left behind.

---

### 1. Readability and Predictability

With BEM, the class name itself describes the purpose and structure of the styles. 

\`\`\`css
/* Block */
.card {}

/* Element */
.card__title {}
.card__image {}

/* Modifier */
.card--featured {}
\`\`\`

When inspecting elements in browser developer tools, BEM classes tell you exactly where the style originates and what relations exist. CSS Modules, on the other hand, generate hashed class names like \`_card_1u9z8_5\`, making debugging and visual audits much harder for design QA teams.

---

### 2. Zero Build-time Overhead

CSS Modules require specific bundler configurations (Webpack, Vite, Rollup) and JS runtimes to parse and map module tables. BEM is pure vanilla CSS. It works on every platform, every framework, and in static layouts without requiring a compilation step. This makes it perfect for edge environments, server-side rendering, and performance-critical landing pages.

---

### 3. Modifiers are First-Class Citizens

Styling elements dynamically in CSS Modules often results in complex JS template strings:

\`\`\`javascript
// CSS Modules approach
className={\`\${styles.card} \${isFeatured ? styles.featured : ''}\`}
\`\`\`

With BEM, modifiers are clean and explicit:

\`\`\`javascript
// BEM approach
className={\`card \${isFeatured ? 'card--featured' : ''}\`}
\`\`\`

---

### Summary Table

| Metric | BEM Methodology | CSS Modules |
| :--- | :--- | :--- |
| **Debuggability** | Excellent (clear naming structure) | Hard (hashed class names) |
| **Build dependency** | None (pure CSS) | High (requires bundler plug) |
| **Styles Leakage** | Possible (relic on naming discipline) | Impossible (encapsulated) |
| **Performance** | Maximum (zero parse overhead) | Medium (requires JS mapping) |

While BEM requires discipline from team members to avoid naming violations, its utility, simplicity, and debugging efficiency make it my go-to choice for enterprise CSS architecture.`
    },
    {
      slug: "khqr-bakong-payment-nestjs",
      title: "Bakong KHQR Payment Integration in NestJS",
      excerpt: "A technical guide for integrating Cambodia's national payment platform KHQR into NestJS backends, handling deep links, signatures, and webhook verification.",
      date: "Nov 12, 2025",
      readingTime: "8 min read",
      featured: true,
      tags: ["NestJS", "Bakong", "KHQR", "Cambodia"],
      content: `## Integrating Cambodia's National QR Standard

Cambodia's **Bakong KHQR** system, launched by the National Bank of Cambodia, has completely unified digital payments across the country. For local developers, integrating KHQR is a standard requirement for rental platforms, booking engines, and e-commerce platforms.

Here is a step-by-step walkthrough of integrating Bakong KHQR into a backend built with **NestJS**.

---

### 1. Generating the KHQR String

The KHQR code is built on the EMVCo merchant QR standard. To generate it, you combine the merchant ID, acquirer bank ID, transaction currency (USD/KHR), amount, and order ID into a payload, then append a CRC16 checksum.

The official Bakong SDK makes this simple:

\`\`\`typescript
import { Injectable } from '@nestjs/common';
import { BakongKHQR, IndividualInfo } from 'bakong-khqr';

@Injectable()
export class PaymentService {
  async generateQR(orderId: string, amount: number, isUsd: boolean) {
    const info = new IndividualInfo();
    info.accountId = 'merchant_account_id@acleda';
    info.merchantName = 'Thoeun Lothin Shop';
    info.merchantCity = 'Phnom Penh';
    info.amount = amount;
    info.currency = isUsd ? 'USD' : 'KHR';
    info.billNumber = orderId;
    info.storeLabel = 'Main Branch';
    
    const qrResult = BakongKHQR.generateIndividual(info);
    return {
      qrString: qrResult.data.qrString,
      md5: qrResult.data.md5,
    };
  }
}
\`\`\`

---

### 2. Creating Webhooks for Payment Status

Because KHQR payments happen peer-to-peer on the Bakong blockchain, the merchant server must verify that the transaction has successfully settled. The most reliable way is setting up a Webhook endpoint that Bakong or the acquiring bank pings once they confirm settlement:

\`\`\`typescript
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    // 1. Verify acquirer certificate signature
    const isValid = this.paymentService.verifySignature(payload, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid transaction signature');
    }

    // 2. Process transaction state
    await this.paymentService.settleOrder(payload.billNumber, payload.amount);
    return { status: 'SUCCESS' };
  }
}
\`\`\`

---

### 3. Polling Fallback

If webhooks fail due to network instability, you should implement a short polling controller in NestJS using RxJS intervals or standard cron timers to verify status against the bank's transaction lookup API.

Integrating Bakong KHQR simplifies user checkouts, enabling Cambodian customers to scan and pay in seconds.`
    },
    {
      slug: "real-time-websockets-vs-pusher",
      title: "Building Real-Time Web Apps: WebSockets vs Pusher",
      excerpt: "A deep dive comparing standard WebSockets, server-sent events, and hosted channels like Pusher for building real-time collaboration engines.",
      date: "Oct 25, 2025",
      readingTime: "6 min read",
      featured: false,
      tags: ["WebSockets", "Pusher", "Real-Time"],
      content: `## Choosing Your Real-Time Communication Stack

For features like live notifications, messaging, or pool hall table booking systems, real-time sync is essential. Developers generally choose between **raw WebSockets (ws/Socket.io)** or hosted subscription services like **Pusher**.

Here is a breakdown of the differences to help you select the right tool for your next project.

---

### 1. Complexity of Setup and Maintenance

Implementing raw WebSockets requires managing connection lifecycle, heartbeats (pings/pongs), reconnection strategies, and horizontal scaling. If you deploy your backend on multiple server instances, you must spin up a Redis adapter (Redis PubSub) to synchronise sockets across servers.

Pusher is completely serverless. You trigger a REST call to Pusher, and their infrastructure broadcasts it to all connected clients. It handles scaling, backpressure, and reconnections automatically.

---

### 2. Costs

| Feature | Raw WebSockets | Pusher (Hosted) |
| :--- | :--- | :--- |
| **Server Costs** | Low (runs on your existing servers) | High (charged by connections and messages) |
| **Maintenance** | High (requires DevOps monitoring) | Zero (completely managed) |
| **Scalability** | Manual clustering / Redis adapter | Automatic scaling to millions of clients |

---

### 3. Code Comparison: Client Connection

**Pusher Client:**
\`\`\`javascript
import Pusher from 'pusher-js';

const pusher = new Pusher('APP_KEY', { cluster: 'ap1' });
const channel = pusher.subscribe('order-channel');
channel.bind('status-updated', (data) => {
  console.log('Order status update:', data);
});
\`\`\`

**Standard WebSocket Client:**
\`\`\`javascript
const socket = new WebSocket('wss://api.lothin-dev.app/ws');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === 'order.status') {
    console.log('Order status update:', data.payload);
  }
};

socket.onclose = () => {
  // Manual reconnection loop logic needed here
};
\`\`\`

If time-to-market is your main priority, hosted channels like Pusher are unbeatable. However, for high-volume, cost-sensitive production architectures, deploying custom WebSocket nodes on Cloudflare or Node servers is the best long-term investment.`
    },
    {
      slug: "nuxt-4-migration-report",
      title: "Migrating Large Projects to Nuxt 4",
      excerpt: "Nuxt 4 introduces a restructured directory layout, strict typing, and rendering updates. Here is a migration report and debugging checklist.",
      date: "Aug 04, 2025",
      readingTime: "7 min read",
      featured: false,
      tags: ["Nuxt", "Vue", "Migration", "Web Dev"],
      content: `## Upgrading Vue Enterprise Projects to Nuxt 4

Migrating enterprise projects is always challenging, particularly when dealing with major version shifts like Nuxt 2 → Nuxt 3, and now the streamlined directory shifts in **Nuxt 4**. 

In my work at IDG, I led migration operations resolving breaking changes and adapting layouts to composition syntax. Here is a checklist of critical factors to watch for.

---

### 1. The Directory Restructure

Nuxt 4 consolidates code files inside a unified \`app/\` folder structure by default (pages, components, layouts, middleware, composables), leaving configs and public resources in the root.

\`\`\`bash
# Nuxt 4 structure
├── app/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── app.vue
├── public/
├── server/
├── nuxt.config.ts
└── package.json
\`\`\`

To preserve the old directory layout during migration, you can configure compatibility mode in \`nuxt.config.ts\`:

\`\`\`typescript
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  }
})
\`\`\`

---

### 2. Smart Component Resolution

Nuxt 4 has updated component autoloading properties. Nested folders now auto-resolve prefixing parent folder names to components. For instance:

- Components inside \`components/dashboard/Sidebar.vue\` must be called as \`<DashboardSidebar />\` in views instead of just \`<Sidebar />\`.

---

### Summary Checklist

- [x] Configure compatibility version variables in configuration files.
- [x] Rename imports referencing nested components to use prefix names.
- [x] Audit global composables: ensure standard imports are explicitly defined.
- [x] Test Server-Side Rendering (SSR) page-load performance and hydrate states.

Migrating early ensures you benefit from Vite's updated hot-reload speeds, reduced build bundle sizes, and optimal TypeScript compilation checks.`
    }
  ]
};
