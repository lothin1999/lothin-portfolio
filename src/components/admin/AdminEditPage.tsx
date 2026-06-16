"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Save, Upload, RefreshCw, Check, ArrowLeft,
  ChevronDown, ChevronRight, FileText, Globe, CheckCircle, Edit, List
} from "lucide-react";
import type { CVData, Article } from "@/types/cv";
import { useCVData } from "@/hooks/useCVData";
import { DragDropUploader } from "./DragDropUploader";

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, multiline, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls =
    "w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors";
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-y"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] tracking-[2px] uppercase text-accent mb-4 pt-2 border-t border-rule">
      {children}
    </h3>
  );
}

function AdminField({
  label, value, onChange, multiline, placeholder, explanation,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  explanation?: string;
}) {
  return (
    <div className="space-y-1">
      <Field label={label} value={value} onChange={onChange} multiline={multiline} placeholder={placeholder} />
      {explanation && (
        <p className="font-mono text-[9.5px] text-accent/80 italic mt-0.5 pl-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block shrink-0" />
          {explanation}
        </p>
      )}
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────
type Group = "cv" | "admin";
type Tab =
  | "profile"
  | "experience"
  | "skills"
  | "education"
  | "references"
  | "home"
  | "about"
  | "services"
  | "articles";

const CV_TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "references", label: "References" },
];

const ADMIN_TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Homepage" },
  { id: "about", label: "About Page" },
  { id: "services", label: "Services Page" },
  { id: "articles", label: "Articles" },
];

// ── Default Fallbacks ────────────────────────────────────────────────────────
const defaultHomeProblems = [
  { num: "[01]", title: "Features take longer than they should", desc: "Change one thing, five other places break. What should be a half-day task turns into a multi-day testing ordeal because codebases lack encapsulation and type boundaries." },
  { num: "[02]", title: "Slow page loads and performance debt", desc: "Slow database queries and unoptimized rendering block core visitor routes. Pages that should load instantly lag, leading to increased bounce rates." },
  { num: "[03]", title: "Backend-Frontend disconnect", desc: "Knowledge lives in developers' heads. REST APIs lack shared typescript contracts, leading to silent serialization errors and constant coordination overhead." },
  { num: "[04]", title: "Complex integrations and payment bugs", desc: "Payment gateways like Bakong KHQR are wired without strict signature checks or reliable transaction webhooks, causing order status inconsistencies." }
];

const defaultHomeStats = [
  { val: "3+ Years", label: "Experience" },
  { val: "10+", label: "Projects Live" },
  { val: "3", label: "Nuxt Migrations" },
  { val: "Edge SSR", label: "Specialty" }
];

const defaultHomeServices = [
  { title: "High-End Full-Stack Consulting", desc: "I analyze your application database, caching layer, and client components to locate bottleneck drag and build a clear plan to clean things up." },
  { title: "Custom Web Development", desc: "I build responsive, lightning-fast SSR web platforms in Vue/Nuxt, React/Next, and Angular, with modular NestJS/Laravel backends that are simple to maintain." },
  { title: "Core System Integrations", desc: "Integrate Cambodia-native Bakong KHQR checkout flows, real-time Pusher status sockets, and Firebase auth securely into existing systems." }
];

const defaultAboutStats = [
  { val: "3+ Years", label: "Experience" },
  { val: "10+", label: "Live Projects" },
  { val: "3", label: "Nuxt Migrations" },
  { val: "25+", label: "Provinces filtered" }
];

const defaultAboutStory = [
  "I'm a Full-Stack Web Developer and Technical Lead. I help teams untangle system complexity so their applications can load fast, support rich features, and remain clean enough to evolve.",
  "I studied Management Information System in Phnom Penh, learning algorithms, data structures, OOP, and software engineering. I learned to think in systems: every directory, schema, and API boundary is a gear in a larger machine. That mindset followed me directly into my professional career.",
  "My first major project involved CRM, hotel, and session-billing billiard table tracking systems. Building under real-world timing and synchronization constraints taught me to design fail-safe WebSockets channels and optimize transactional SQL queries. When I saw clients actually using the table booking systems to manage their operations, I knew I wanted to focus on building critical production tools.",
  "Later, I worked on Cambodia's nationwide AALL rental marketplace, introducing Nuxt 4 SSR, and leading the full upgrade path of an enterprise POS system through three major Nuxt versions. I focus on BEM CSS architecture, edge database performance, and Cambodia-native Bakong KHQR checkout flows to deliver smooth digital experiences."
];

const defaultAboutPrinciples = [
  { title: "Systems over features", desc: "Good architecture ensures your developers add features without fighting the codebase. I write strict types, clean contracts, and keep directory modules simple. That way, code stays testable and time-to-ship drops." },
  { title: "Clarity over cleverness", desc: "Clever code causes maintenance issues. Nested ternary operations, pre-rendered components with complex hydrates, and multi-layered configurations break easily. I choose boring, predictable code that team members can understand in minutes." },
  { title: "Business context matters", desc: "Technical decisions are business decisions. Choosing a stack or setting up edge infrastructure must solve real visitor drag or operational latency. I always ask what a technical decision means for the company first." }
];

const defaultAboutDontDo = [
  "Tutorial-level hand-holding: I point team members to clean code paths, but expect developers to build problem-solving skills.",
  "Quick feature patches: Writing code without understanding the system it lives in builds technical debt that we'll have to pay back later.",
  "Projects without clear objectives: I need a defined metric of success — loading speed, user conversions, or operational metrics — to optimize correctly.",
  "Teams not ready for change: If 'we've always done it this way' is the final answer, we won't be a good fit."
];

const defaultServicesOfferings = [
  { title: "High-End Full-Stack Consulting", label: "Finding what your system is hiding", desc: "I audit your application rendering logic, state stores, and database schemas. I locate query bottlenecks, bloated payloads, and provide a clear, step-by-step optimization plan." },
  { title: "Custom Web Development", label: "Platforms your team can maintain", desc: "I build responsive frontend clients in Vue/Nuxt, React/Next, and Angular, wired into NestJS, Laravel, or Spring Boot REST APIs with strict TypeScript contracts." },
  { title: "Long-Term Technical Advisory", label: "A full-stack lead on call", desc: "Get ongoing access to someone who thinks about software architecture, package upgrades, security hardening, and database structures for a living, without hiring full-time." },
  { title: "Core System & Payment Integrations", label: "Wiring secure transaction pipelines", desc: "Implement Cambodia-native Bakong KHQR checkouts (signature checks, deep links, webhooks), real-time booking status Pusher logs, and Firebase user management workflows." }
];

const defaultServicesWhy = [
  { title: "Migration & Upgrade Experience", desc: "I have led large upgrade operations resolving breaking changes, from Nuxt 2 Options API to Nuxt 4 Composition patterns, and Laravel to NestJS backends. I don't just code; I guide teams through transitions." },
  { title: "Systems Thinking", desc: "I analyze query paths, API contracts, and edge infrastructure, not just frontend styling. When database queries and components are unified, teams ship faster and build with confidence." },
  { title: "Business Alignment", desc: "Technical decisions are business decisions. I evaluate choices based on whether they reduce server costs, improve checkout conversion rates, or cut maintenance debt." },
  { title: "Real-World Results", desc: "From province-based rental filters covering 25+ Cambodian provinces to secure KHQR payment APIs processed successfully daily, I deliver production systems that scale." }
];

const defaultServicesEngagement = [
  { phase: "01", title: "Discovery & Diagnosis", desc: "I spend time reviewing your codebase, API layers, and database queries. I audit layout shifts, loading delays, and structure a clear plan outlining what requires remediation.", duration: "Typical duration: 2-3 weeks" },
  { phase: "02", title: "Implementation Partnership", desc: "I embed with your developers to write core code, rewrite state stores, establish strict typescript contracts, and deploy updated modules to production.", duration: "Typical duration: 1-3 months" },
  { phase: "03", title: "Ongoing Advisory", desc: "Regular check-ins, architectural advice, and someone to review release schedules. You get a technical lead on call whenever updates feel risky.", duration: "Typical duration: 3+ months" }
];

function compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function AdminEditPage() {
  const { cv, updateCV, setAdmin } = useCVData();
  const router = useRouter();

  // Deep clone for editing
  const [draft, setDraft] = useState<CVData>({
    profile: { name: { first: "", last: "" }, title: "", tagline: "", summary: "", location: "", website: "", telegram: "", telegramHandle: "", linkedin: "", phones: [], cvPdfUrl: "", coverLetterPdfUrl: "", languages: [] },
    experiences: [],
    skillGroups: [],
    educations: [],
    references: [],
    articles: [],
    adminSettings: {},
  });

  // Load cv data once hook finishes loading
  useEffect(() => {
    if (cv && cv.profile) {
      const cloned = JSON.parse(JSON.stringify(cv));
      if (!cloned.adminSettings) cloned.adminSettings = {};
      if (!cloned.articles) cloned.articles = [];
      if (!cloned.profile.cvPdfUrl) cloned.profile.cvPdfUrl = "";
      if (!cloned.profile.coverLetterPdfUrl) cloned.profile.coverLetterPdfUrl = "";
      if (cloned.experiences) {
        cloned.experiences = cloned.experiences.map((exp: any) => ({
          ...exp,
          images: exp.images || []
        }));
      }
      setDraft(cloned);
    }
  }, [cv]);

  // Sidebar accordion expansion states
  const [cvExpanded, setCvExpanded] = useState(true);
  const [adminExpanded, setAdminExpanded] = useState(true);

  // Active navigation settings
  const [activeGroup, setActiveGroup] = useState<Group>("cv");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Articles state
  const [selectedArticleIdx, setSelectedArticleIdx] = useState<number | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [articleDraft, setArticleDraft] = useState<Article | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      await updateCV(draft);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch {
      setSaveMsg("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAdmin(false);
    router.push("/");
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file, 400, 400, 0.85);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
        type: "image/jpeg",
      });

      const fd = new FormData();
      fd.append("image", compressedFile);
      const res = await fetch("/api/cv/upload-photo", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        setDraft((d) => ({ ...d, profile: { ...d.profile, photoUrl: json.url! } }));
      } else {
        alert(json.error ?? "Upload failed");
      }
    } catch (err) {
      console.error("Image compression or upload failed:", err);
      alert("Failed to compress or upload image");
    } finally {
      setUploading(false);
    }
  }

  // Helper functions to safely update nested adminSettings state
  const updateHomeIntro = (v: string) => {
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), homeIntro: v }
    }));
  };

  const updateHomeProblem = (idx: number, field: "num" | "title" | "desc", v: string) => {
    const problems = [...(draft.adminSettings?.homeProblems || defaultHomeProblems)];
    problems[idx] = { ...problems[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), homeProblems: problems }
    }));
  };

  const updateHomeStat = (idx: number, field: "val" | "label", v: string) => {
    const stats = [...(draft.adminSettings?.homeStats || defaultHomeStats)];
    stats[idx] = { ...stats[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), homeStats: stats }
    }));
  };

  const updateHomeService = (idx: number, field: "title" | "desc", v: string) => {
    const services = [...(draft.adminSettings?.homeServices || defaultHomeServices)];
    services[idx] = { ...services[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), homeServices: services }
    }));
  };

  const updateAboutIntro = (v: string) => {
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), aboutIntro: v }
    }));
  };

  const updateAboutStat = (idx: number, field: "val" | "label", v: string) => {
    const stats = [...(draft.adminSettings?.aboutStats || defaultAboutStats)];
    stats[idx] = { ...stats[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), aboutStats: stats }
    }));
  };

  const updateAboutStory = (idx: number, v: string) => {
    const story = [...(draft.adminSettings?.aboutStory || defaultAboutStory)];
    story[idx] = v;
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), aboutStory: story }
    }));
  };

  const updateAboutPrinciple = (idx: number, field: "title" | "desc", v: string) => {
    const principles = [...(draft.adminSettings?.aboutPrinciples || defaultAboutPrinciples)];
    principles[idx] = { ...principles[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), aboutPrinciples: principles }
    }));
  };

  const updateAboutDontDo = (idx: number, v: string) => {
    const dontDo = [...(draft.adminSettings?.aboutDontDo || defaultAboutDontDo)];
    dontDo[idx] = v;
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), aboutDontDo: dontDo }
    }));
  };

  const updateServicesIntro = (v: string) => {
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), servicesIntro: v }
    }));
  };

  const updateServicesOffering = (idx: number, field: "label" | "title" | "desc", v: string) => {
    const offerings = [...(draft.adminSettings?.servicesOfferings || defaultServicesOfferings)];
    offerings[idx] = { ...offerings[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), servicesOfferings: offerings }
    }));
  };

  const updateServicesWhy = (idx: number, field: "title" | "desc", v: string) => {
    const why = [...(draft.adminSettings?.servicesWhy || defaultServicesWhy)];
    why[idx] = { ...why[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), servicesWhy: why }
    }));
  };

  const updateServicesEngagement = (idx: number, field: "phase" | "title" | "desc" | "duration", v: string) => {
    const engagement = [...(draft.adminSettings?.servicesEngagement || defaultServicesEngagement)];
    engagement[idx] = { ...engagement[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), servicesEngagement: engagement }
    }));
  };

  function handleEditArticle(index: number) {
    setSelectedArticleIdx(index);
    setIsCreatingArticle(false);
    setArticleDraft({
      slug: "",
      title: "",
      excerpt: "",
      date: "",
      content: "",
      tags: [],
      featured: false,
      readingTime: "",
      ...(draft.articles?.[index] || {})
    });
  }

  function handleAddArticle() {
    setSelectedArticleIdx(null);
    setIsCreatingArticle(true);
    setArticleDraft({
      slug: "",
      title: "",
      excerpt: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      content: "",
      tags: [],
      featured: false,
      readingTime: "5 min read"
    });
  }

  function handleSaveArticle() {
    if (!articleDraft) return;
    if (!articleDraft.slug || !articleDraft.title) {
      alert("Slug and Title are required");
      return;
    }
    const articles = [...(draft.articles || [])];
    if (isCreatingArticle) {
      articles.push(articleDraft);
    } else if (selectedArticleIdx !== null) {
      articles[selectedArticleIdx] = articleDraft;
    }
    setDraft(d => ({ ...d, articles }));
    setArticleDraft(null);
    setIsCreatingArticle(false);
    setSelectedArticleIdx(null);
  }

  function handleDeleteArticle(index: number) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const articles = (draft.articles || []).filter((_, i) => i !== index);
    setDraft(d => ({ ...d, articles }));
  }

  // ── Profile Tab ──
  const renderProfileTab = () => (
    <div className="space-y-6">
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" value={draft.profile.name.first}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, name: { ...d.profile.name, first: v } } }))} />
        <Field label="Last name" value={draft.profile.name.last}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, name: { ...d.profile.name, last: v } } }))} />
      </div>
      <Field label="Job title" value={draft.profile.title}
        onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, title: v } }))} />
      <Field label="Tagline" value={draft.profile.tagline}
        onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, tagline: v } }))} />
      <Field label="Summary" value={draft.profile.summary} multiline
        onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, summary: v } }))} />

      <SectionHeading>Contact</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location" value={draft.profile.location}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, location: v } }))} />
        <Field label="Website" value={draft.profile.website}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, website: v } }))} />
        <Field label="Telegram URL" value={draft.profile.telegram}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, telegram: v } }))} />
        <Field label="Telegram handle" value={draft.profile.telegramHandle}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, telegramHandle: v } }))} />
        <Field label="LinkedIn URL" value={draft.profile.linkedin}
          onChange={(v) => setDraft(d => ({ ...d, profile: { ...d.profile, linkedin: v } }))} />
        <Field label="Phone 1" value={draft.profile.phones[0] ?? ""}
          onChange={(v) => setDraft(d => { const p = [...d.profile.phones]; p[0] = v; return { ...d, profile: { ...d.profile, phones: p } }; })} />
        <Field label="Phone 2" value={draft.profile.phones[1] ?? ""}
          onChange={(v) => setDraft(d => { const p = [...d.profile.phones]; p[1] = v; return { ...d, profile: { ...d.profile, phones: p } }; })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-rule">
        <div>
          <DragDropUploader
            label="Profile Photo"
            accept="image/*"
            compressMaxWidth={400}
            value={draft.profile.photoUrl || ""}
            onChange={(url) => setDraft(d => ({ ...d, profile: { ...d.profile, photoUrl: url } }))}
          />
        </div>
        <div>
          <DragDropUploader
            label="CV PDF Document"
            accept="application/pdf"
            value={draft.profile.cvPdfUrl || ""}
            onChange={(url) => setDraft(d => ({ ...d, profile: { ...d.profile, cvPdfUrl: url } }))}
          />
        </div>
        <div>
          <DragDropUploader
            label="Cover Letter PDF Document"
            accept="application/pdf"
            value={draft.profile.coverLetterPdfUrl || ""}
            onChange={(url) => setDraft(d => ({ ...d, profile: { ...d.profile, coverLetterPdfUrl: url } }))}
          />
        </div>
      </div>

      <SectionHeading>Languages</SectionHeading>
      <div className="space-y-4">
        {draft.profile.languages.map((lang, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1">
              <Field label="Language" value={lang.name}
                onChange={(v) => setDraft(d => { const l = [...d.profile.languages]; l[i] = { ...l[i], name: v }; return { ...d, profile: { ...d.profile, languages: l } }; })} />
            </div>
            <div className="flex-1">
              <Field label="Level" value={lang.level}
                onChange={(v) => setDraft(d => { const l = [...d.profile.languages]; l[i] = { ...l[i], level: v }; return { ...d, profile: { ...d.profile, languages: l } }; })} />
            </div>
            <button onClick={() => setDraft(d => { const l = d.profile.languages.filter((_, j) => j !== i); return { ...d, profile: { ...d.profile, languages: l } }; })}
              className="mb-1.5 p-2 text-muted hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setDraft(d => ({ ...d, profile: { ...d.profile, languages: [...d.profile.languages, { name: "", level: "" }] } }))}
          className="inline-flex items-center gap-1 text-[12px] text-accent hover:text-ink transition-colors"
        >
          <Plus size={13} /> Add language
        </button>
      </div>
    </div>
  );

  // ── Experience Tab ──
  const renderExperienceTab = () => (
    <div className="space-y-6">
      {draft.experiences.map((exp, i) => (
        <div key={exp.id} className="border border-rule rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Experience #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" value={exp.title}
              onChange={(v) => setDraft(d => { const e = [...d.experiences]; e[i] = { ...e[i], title: v }; return { ...d, experiences: e }; })} />
            <Field label="Period" value={exp.period}
              onChange={(v) => setDraft(d => { const e = [...d.experiences]; e[i] = { ...e[i], period: v }; return { ...d, experiences: e }; })} />
            <Field label="Company" value={exp.company}
              onChange={(v) => setDraft(d => { const e = [...d.experiences]; e[i] = { ...e[i], company: v }; return { ...d, experiences: e }; })} />
            <Field label="Location" value={exp.location}
              onChange={(v) => setDraft(d => { const e = [...d.experiences]; e[i] = { ...e[i], location: v }; return { ...d, experiences: e }; })} />
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-2">Bullets</p>
            {exp.bullets.map((b, bi) => (
              <div key={bi} className="flex gap-2 mb-2 items-start">
                <textarea value={b} rows={2}
                  onChange={(e) => setDraft(d => { const ex = [...d.experiences]; const bls = [...ex[i].bullets]; bls[bi] = e.target.value; ex[i] = { ...ex[i], bullets: bls }; return { ...d, experiences: ex }; })}
                  className="flex-1 px-2.5 py-1.5 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors resize-none" />
                <button onClick={() => setDraft(d => { const ex = [...d.experiences]; ex[i] = { ...ex[i], bullets: ex[i].bullets.filter((_, j) => j !== bi) }; return { ...d, experiences: ex }; })}
                  className="mt-2 text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={() => setDraft(d => { const ex = [...d.experiences]; ex[i] = { ...ex[i], bullets: [...ex[i].bullets, ""] }; return { ...d, experiences: ex }; })}
              className="inline-flex items-center gap-1 text-[12px] text-accent hover:text-ink transition-colors mt-1">
              <Plus size={12} /> Add bullet
            </button>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-2">Tags (comma separated)</p>
            <input type="text" value={exp.tags.join(", ")}
              onChange={(e) => setDraft(d => { const ex = [...d.experiences]; ex[i] = { ...ex[i], tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; return { ...d, experiences: ex }; })}
              className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div className="mt-3">
            <DragDropUploader
              label="Project Screenshots / Work Images"
              accept="image/*"
              multiple
              compressMaxWidth={1600}
              value={exp.images || []}
              onChange={(urls) => setDraft(d => {
                const ex = [...d.experiences];
                ex[i] = { ...ex[i], images: urls };
                return { ...d, experiences: ex };
              })}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => setDraft(d => ({ ...d, experiences: [...d.experiences, { id: `exp-${Date.now()}`, title: "", company: "", location: "", period: "", bullets: [""], tags: [] }] }))}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors cursor-pointer"
      >
        <Plus size={13} /> Add experience
      </button>
    </div>
  );

  // ── Skills Tab ──
  const renderSkillsTab = () => (
    <div className="space-y-6">
      {draft.skillGroups.map((group, gi) => (
        <div key={gi} className="border border-rule rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Field label="Group label" value={group.label}
              onChange={(v) => setDraft(d => { const sg = [...d.skillGroups]; sg[gi] = { ...sg[gi], label: v }; return { ...d, skillGroups: sg }; })} />
            <button onClick={() => setDraft(d => ({ ...d, skillGroups: d.skillGroups.filter((_, j) => j !== gi) }))}
              className="ml-3 mt-5 text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-2">Skills (comma separated)</p>
            <textarea rows={2}
              value={group.skills.join(", ")}
              onChange={(e) => setDraft(d => { const sg = [...d.skillGroups]; sg[gi] = { ...sg[gi], skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; return { ...d, skillGroups: sg }; })}
              className="w-full px-2.5 py-1.5 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
        </div>
      ))}
      <button
        onClick={() => setDraft(d => ({ ...d, skillGroups: [...d.skillGroups, { label: "New Group", skills: [] }] }))}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors cursor-pointer"
      >
        <Plus size={13} /> Add skill group
      </button>
    </div>
  );

  // ── Education Tab ──
  const renderEducationTab = () => (
    <div className="space-y-6">
      {draft.educations.map((edu, i) => (
        <div key={edu.id} className="border border-rule rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Education #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, educations: d.educations.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Degree" value={edu.degree}
              onChange={(v) => setDraft(d => { const e = [...d.educations]; e[i] = { ...e[i], degree: v }; return { ...d, educations: e }; })} />
            <Field label="Period" value={edu.period}
              onChange={(v) => setDraft(d => { const e = [...d.educations]; e[i] = { ...e[i], period: v }; return { ...d, educations: e }; })} />
            <Field label="School" value={edu.school}
              onChange={(v) => setDraft(d => { const e = [...d.educations]; e[i] = { ...e[i], school: v }; return { ...d, educations: e }; })} />
            <Field label="Location" value={edu.location}
              onChange={(v) => setDraft(d => { const e = [...d.educations]; e[i] = { ...e[i], location: v }; return { ...d, educations: e }; })} />
          </div>
          <Field label="Description" value={edu.description} multiline
            onChange={(v) => setDraft(d => { const e = [...d.educations]; e[i] = { ...e[i], description: v }; return { ...d, educations: e }; })} />
          <div>
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-2">Courses (comma separated)</p>
            <textarea rows={2}
              value={edu.courses.join(", ")}
              onChange={(e) => setDraft(d => { const ed = [...d.educations]; ed[i] = { ...ed[i], courses: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; return { ...d, educations: ed }; })}
              className="w-full px-2.5 py-1.5 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
        </div>
      ))}
      <button
        onClick={() => setDraft(d => ({ ...d, educations: [...d.educations, { id: `edu-${Date.now()}`, degree: "", school: "", location: "", period: "", description: "", courses: [] }] }))}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors cursor-pointer"
      >
        <Plus size={13} /> Add education
      </button>
    </div>
  );

  // ── References Tab ──
  const renderReferencesTab = () => (
    <div className="space-y-6">
      {draft.references.map((ref, i) => (
        <div key={i} className="border border-rule rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Reference #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, references: d.references.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={ref.name}
              onChange={(v) => setDraft(d => { const r = [...d.references]; r[i] = { ...r[i], name: v }; return { ...d, references: r }; })} />
            <Field label="Contact" value={ref.contact}
              onChange={(v) => setDraft(d => { const r = [...d.references]; r[i] = { ...r[i], contact: v }; return { ...d, references: r }; })} />
            <Field label="Role" value={ref.role}
              onChange={(v) => setDraft(d => { const r = [...d.references]; r[i] = { ...r[i], role: v }; return { ...d, references: r }; })} />
            <Field label="Company" value={ref.company}
              onChange={(v) => setDraft(d => { const r = [...d.references]; r[i] = { ...r[i], company: v }; return { ...d, references: r }; })} />
          </div>
        </div>
      ))}
      <button
        onClick={() => setDraft(d => ({ ...d, references: [...d.references, { name: "", role: "", company: "", contact: "" }] }))}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors cursor-pointer"
      >
        <Plus size={13} /> Add reference
      </button>
    </div>
  );

  // ── Homepage Admin Tab ──
  const renderHomeTab = () => {
    const homeProblems = draft.adminSettings?.homeProblems || defaultHomeProblems;
    const homeStats = draft.adminSettings?.homeStats || defaultHomeStats;
    const homeServices = draft.adminSettings?.homeServices || defaultHomeServices;

    return (
      <div className="space-y-6">
        <SectionHeading>Hero / Intro</SectionHeading>
        <AdminField
          label="Hero Intro Paragraph"
          value={draft.adminSettings?.homeIntro || ""}
          onChange={updateHomeIntro}
          multiline
          placeholder="Your web platform feels sluggish..."
          explanation="Changes the main intro text below your name on the Homepage."
        />

        <SectionHeading>The Problem Cards</SectionHeading>
        <p className="text-[11px] text-muted -mt-2 mb-4">
          Modify the 4 problem cards on the Homepage.
        </p>
        <div className="space-y-4">
          {homeProblems.map((prob, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Card {i + 1}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Field label="Number Code" value={prob.num} onChange={(v) => updateHomeProblem(i, "num", v)} />
                </div>
                <div className="col-span-2">
                  <Field label="Title" value={prob.title} onChange={(v) => updateHomeProblem(i, "title", v)} />
                </div>
              </div>
              <AdminField
                label="Description"
                value={prob.desc}
                onChange={(v) => updateHomeProblem(i, "desc", v)}
                multiline
                explanation={`Changes Problem Card #${i + 1} description in the grid on the Homepage.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>Stats List</SectionHeading>
        <p className="text-[11px] text-muted -mt-2 mb-4">
          Modify the 4 stat counters under the Biography section.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {homeStats.map((stat, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Stat {i + 1}</p>
              <Field label="Value" value={stat.val} onChange={(v) => updateHomeStat(i, "val", v)} />
              <AdminField
                label="Label"
                value={stat.label}
                onChange={(v) => updateHomeStat(i, "label", v)}
                explanation={`Changes Homepage Stat #${i + 1} value & description label.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>How I Help (Services)</SectionHeading>
        <p className="text-[11px] text-muted -mt-2 mb-4">
          Modify the 3 service highlights on the Homepage.
        </p>
        <div className="space-y-4">
          {homeServices.map((service, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Service {i + 1}</p>
              <Field label="Title" value={service.title} onChange={(v) => updateHomeService(i, "title", v)} />
              <AdminField
                label="Description"
                value={service.desc}
                onChange={(v) => updateHomeService(i, "desc", v)}
                multiline
                explanation={`Changes Service highlight Card #${i + 1} on the Homepage.`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── About Page Admin Tab ──
  const renderAboutTab = () => {
    const aboutStats = draft.adminSettings?.aboutStats || defaultAboutStats;
    const aboutStory = draft.adminSettings?.aboutStory || defaultAboutStory;
    const aboutPrinciples = draft.adminSettings?.aboutPrinciples || defaultAboutPrinciples;
    const aboutDontDo = draft.adminSettings?.aboutDontDo || defaultAboutDontDo;

    return (
      <div className="space-y-6">
        <SectionHeading>Intro Header</SectionHeading>
        <AdminField
          label="Intro Strip Text"
          value={draft.adminSettings?.aboutIntro || ""}
          onChange={updateAboutIntro}
          multiline
          placeholder="From building billiard table session tracking tools..."
          explanation="Changes the header paragraph inside the quick stats strip on the About page."
        />

        <SectionHeading>Quick Stats</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aboutStats.map((stat, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Stat {i + 1}</p>
              <Field label="Value" value={stat.val} onChange={(v) => updateAboutStat(i, "val", v)} />
              <AdminField
                label="Label"
                value={stat.label}
                onChange={(v) => updateAboutStat(i, "label", v)}
                explanation={`Changes Stat #${i + 1} on the quick intro strip of the About page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>My Story (Biography)</SectionHeading>
        <p className="text-[11px] text-muted -mt-2 mb-4">
          Write up to 4 paragraphs describing your professional background story.
        </p>
        <div className="space-y-4">
          {aboutStory.map((para, i) => (
            <div key={i} className="space-y-1">
              <AdminField
                label={`Story Paragraph #${i + 1}`}
                value={para}
                onChange={(v) => updateAboutStory(i, v)}
                multiline
                explanation={`Changes paragraph #${i + 1} under 'My Story' on the About page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>How I Think (Principles)</SectionHeading>
        <div className="space-y-4">
          {aboutPrinciples.map((principle, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Principle {i + 1}</p>
              <Field label="Title" value={principle.title} onChange={(v) => updateAboutPrinciple(i, "title", v)} />
              <AdminField
                label="Description"
                value={principle.desc}
                onChange={(v) => updateAboutPrinciple(i, "desc", v)}
                multiline
                explanation={`Changes Principle #${i + 1} under 'How I Think About Work' on the About page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>What I Don't Do</SectionHeading>
        <div className="space-y-4">
          {aboutDontDo.map((item, i) => (
            <div key={i} className="space-y-1">
              <AdminField
                label={`Bound Item #${i + 1}`}
                value={item}
                onChange={(v) => updateAboutDontDo(i, v)}
                explanation={`Changes list item #${i + 1} under 'What I Don't Do' on the About page.`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Services Page Admin Tab ──
  const renderServicesTab = () => {
    const offerings = draft.adminSettings?.servicesOfferings || defaultServicesOfferings;
    const why = draft.adminSettings?.servicesWhy || defaultServicesWhy;
    const engagement = draft.adminSettings?.servicesEngagement || defaultServicesEngagement;

    return (
      <div className="space-y-6">
        <SectionHeading>Intro Header</SectionHeading>
        <AdminField
          label="Intro Paragraph"
          value={draft.adminSettings?.servicesIntro || ""}
          onChange={updateServicesIntro}
          multiline
          placeholder="Most teams I talk to know their full-stack platform..."
          explanation="Changes the introductory paragraph below the header of the Services page."
        />

        <SectionHeading>How I Work (Offerings)</SectionHeading>
        <div className="space-y-4">
          {offerings.map((off, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Offering {i + 1}</p>
              <Field label="Label" value={off.label} onChange={(v) => updateServicesOffering(i, "label", v)} />
              <Field label="Title" value={off.title} onChange={(v) => updateServicesOffering(i, "title", v)} />
              <AdminField
                label="Description"
                value={off.desc}
                onChange={(v) => updateServicesOffering(i, "desc", v)}
                multiline
                explanation={`Changes Offering card #${i + 1} under 'How I Work' on the Services page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>Why Work With Me</SectionHeading>
        <div className="space-y-4">
          {why.map((item, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Point {i + 1}</p>
              <Field label="Title" value={item.title} onChange={(v) => updateServicesWhy(i, "title", v)} />
              <AdminField
                label="Description"
                value={item.desc}
                onChange={(v) => updateServicesWhy(i, "desc", v)}
                multiline
                explanation={`Changes point #${i + 1} in the 'Why Work With Me' grid on the Services page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>Engagement Structure</SectionHeading>
        <div className="space-y-4">
          {engagement.map((phase, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Phase {i + 1}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Field label="Phase Code" value={phase.phase} onChange={(v) => updateServicesEngagement(i, "phase", v)} />
                </div>
                <div className="col-span-2">
                  <Field label="Title" value={phase.title} onChange={(v) => updateServicesEngagement(i, "title", v)} />
                </div>
              </div>
              <Field label="Duration" value={phase.duration} onChange={(v) => updateServicesEngagement(i, "duration", v)} />
              <AdminField
                label="Description"
                value={phase.desc}
                onChange={(v) => updateServicesEngagement(i, "desc", v)}
                multiline
                explanation={`Changes engagement phase #${i + 1} description under 'Engagement Structure' on the Services page.`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Articles Manager Tab ──
  const renderArticlesTab = () => {
    const list = draft.articles || [];

    if (articleDraft) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold">
              {isCreatingArticle ? "Create New Article" : "Edit Article"}
            </h4>
            <button
              onClick={() => setArticleDraft(null)}
              className="text-[11px] text-muted hover:text-ink border border-rule rounded px-2.5 py-1 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" value={articleDraft.title} onChange={(v) => setArticleDraft(a => a ? ({ ...a, title: v }) : null)} />
            <Field label="Slug (URL path)" value={articleDraft.slug} onChange={(v) => setArticleDraft(a => a ? ({ ...a, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") }) : null)} />
            <Field label="Date" value={articleDraft.date} onChange={(v) => setArticleDraft(a => a ? ({ ...a, date: v }) : null)} />
            <Field label="Reading Time" value={articleDraft.readingTime || ""} onChange={(v) => setArticleDraft(a => a ? ({ ...a, readingTime: v }) : null)} />
          </div>

          <Field
            label="Tags (comma separated)"
            value={articleDraft.tags.join(", ")}
            onChange={(v) => setArticleDraft(a => a ? ({ ...a, tags: v.split(",").map(t => t.trim()).filter(Boolean) }) : null)}
          />

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="featured-checkbox"
              checked={!!articleDraft.featured}
              onChange={(e) => setArticleDraft(a => a ? ({ ...a, featured: e.target.checked }) : null)}
              className="w-3.5 h-3.5 rounded accent-accent border border-rule bg-bg"
            />
            <label htmlFor="featured-checkbox" className="font-mono text-[10px] uppercase text-ink cursor-pointer">
              Featured Article (shows on Homepage)
            </label>
          </div>

          <Field
            label="Excerpt / Summary"
            value={articleDraft.excerpt}
            onChange={(v) => setArticleDraft(a => a ? ({ ...a, excerpt: v }) : null)}
            multiline
          />

          <Field
            label="Markdown Content"
            value={articleDraft.content}
            onChange={(v) => setArticleDraft(a => a ? ({ ...a, content: v }) : null)}
            multiline
            placeholder="## Section Title..."
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-rule mt-6">
            <button
              onClick={handleSaveArticle}
              className="px-4 py-2 bg-ink hover:bg-accent text-white text-[12px] font-medium rounded transition-colors cursor-pointer border-none"
            >
              Save Article (Draft)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold">Articles List</h4>
            <p className="text-[10px] text-muted mt-0.5">Manage case studies and writing on your portfolio site.</p>
          </div>
          <button
            onClick={handleAddArticle}
            className="inline-flex items-center gap-1 text-[11px] border border-rule rounded px-3 py-1.5 text-ink hover:bg-tag-bg transition-colors cursor-pointer"
          >
            <Plus size={12} /> Add Article
          </button>
        </div>

        {list.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-rule rounded">
            <p className="font-mono text-[11px] text-muted">No articles found. Create your first post!</p>
          </div>
        ) : (
          <div className="divide-y divide-rule border border-rule rounded overflow-hidden bg-bg">
            {list.map((art, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-tag-bg/20 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-[14px] text-ink font-medium truncate block">{art.title}</span>
                    {art.featured && (
                      <span className="text-[9px] uppercase font-mono tracking-wider px-1 bg-accent/10 text-accent rounded shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[9.5px] text-muted uppercase tracking-wider mt-1 block">
                    {art.date} · {art.readingTime || "5 min read"} · slug: /{art.slug}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEditArticle(idx)}
                    className="p-1.5 text-muted hover:text-accent hover:bg-tag-bg rounded transition-colors cursor-pointer"
                    title="Edit article"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(idx)}
                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    title="Delete article"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tabContent: Record<Tab, React.ReactNode> = {
    profile: renderProfileTab(),
    experience: renderExperienceTab(),
    skills: renderSkillsTab(),
    education: renderEducationTab(),
    references: renderReferencesTab(),
    home: renderHomeTab(),
    about: renderAboutTab(),
    services: renderServicesTab(),
    articles: renderArticlesTab(),
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="w-full px-6 md:px-12 py-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-rule mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-1.5 border border-rule rounded hover:bg-tag-bg transition-colors text-muted hover:text-ink cursor-pointer inline-flex items-center justify-center"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-[20px] font-semibold text-ink">Edit CV & Site Text</h1>
              <p className="font-mono text-[10px] text-muted tracking-wide mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/api/cv/download"
              download
              className="text-[12px] text-muted hover:text-ink border border-rule rounded px-3 py-1.5 transition-colors no-underline inline-flex items-center"
            >
              Download HTML
            </a>
            <button onClick={handleLogout}
              className="text-[12px] text-muted hover:text-ink border border-rule rounded px-3 py-1.5 transition-colors cursor-pointer bg-transparent">
              Logout
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-ink text-white text-[12px] font-medium rounded hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer border-none">
              {saving ? <RefreshCw size={12} className="animate-spin" /> : saveMsg === "Saved!" ? <Check size={12} /> : <Save size={12} />}
              {saving ? "Saving…" : saveMsg || "Save"}
            </button>
          </div>
        </div>

        {/* Dynamic Multi-Section Sidebar Panel */}
        <div className="flex flex-col md:flex-row gap-8 w-full items-start">
          <div className="w-full md:w-60 shrink-0 flex flex-col gap-4">

            {/* Box 1: CV Data Group */}
            <div className="border border-rule rounded bg-surface p-1 shadow-sm">
              <button
                onClick={() => setCvExpanded(!cvExpanded)}
                className="w-full font-mono text-[10.5px] tracking-[2px] uppercase py-2 px-3 text-left font-bold text-ink flex items-center justify-between hover:bg-tag-bg/50 rounded transition-colors"
              >
                <span>CV Data</span>
                {cvExpanded ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
              </button>

              {cvExpanded && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-rule/60 ml-3.5 mb-1.5">
                  {CV_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveGroup("cv");
                        setActiveTab(tab.id);
                      }}
                      className={`font-mono text-[10.5px] tracking-[1.5px] uppercase py-2 px-3 text-left transition-all rounded w-full cursor-pointer border-none bg-transparent ${activeGroup === "cv" && activeTab === tab.id
                          ? "bg-tag-bg text-accent font-semibold border-l-2 border-accent"
                          : "text-muted hover:text-ink hover:bg-tag-bg/30"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Box 2: Site Admin Group */}
            <div className="border border-rule rounded bg-surface p-1 shadow-sm">
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className="w-full font-mono text-[10.5px] tracking-[2px] uppercase py-2 px-3 text-left font-bold text-ink flex items-center justify-between hover:bg-tag-bg/50 rounded transition-colors"
              >
                <span>Site Admin</span>
                {adminExpanded ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
              </button>

              {adminExpanded && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2 border-l border-rule/60 ml-3.5 mb-1.5">
                  {ADMIN_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveGroup("admin");
                        setActiveTab(tab.id);
                      }}
                      className={`font-mono text-[10.5px] tracking-[1.5px] uppercase py-2 px-3 text-left transition-all rounded w-full cursor-pointer border-none bg-transparent ${activeGroup === "admin" && activeTab === tab.id
                          ? "bg-tag-bg text-accent font-semibold border-l-2 border-accent"
                          : "text-muted hover:text-ink hover:bg-tag-bg/30"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Active Tab Form Content */}
          <div className="flex-1 min-w-0 bg-surface border border-rule rounded p-6 shadow-sm w-full">
            {tabContent[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
