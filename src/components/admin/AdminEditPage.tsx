"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Save, Upload, RefreshCw, Check, ArrowLeft,
  ChevronDown, ChevronRight, FileText, Globe, CheckCircle, Edit, List, Info, Folder,
  AlertTriangle, ArrowUp, ArrowDown, Type, Sliders, Compass
} from "lucide-react";
import type { CVData, Article, DocumentItem, ThemeColorSet, ThemeStyles, NavLink } from "@/types/cv";
import { useCVData } from "@/hooks/useCVData";
import { DragDropUploader } from "./DragDropUploader";
import { DEFAULT_LIGHT_COLORS, DEFAULT_DARK_COLORS } from "@/hooks/useThemeColors";

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
  | "navigation"
  | "typography"
  | "colors"
  | "home"
  | "about"
  | "portfolio"
  | "services"
  | "contact"
  | "articles"
  | "documents"
  | "storage"
  | "vectorize";

const CV_TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "references", label: "References" },
];

const ADMIN_TABS: { id: Tab; label: string }[] = [
  { id: "navigation", label: "🧭 Menu Links" },
  { id: "typography", label: "✨ Fonts & Shadows" },
  { id: "colors", label: "🎨 Colors" },
  { id: "home", label: "Homepage" },
  { id: "about", label: "About Page" },
  { id: "portfolio", label: "Work Page" },
  { id: "services", label: "Services Page" },
  { id: "contact", label: "Contact & Footer" },
  { id: "articles", label: "Articles" },
  { id: "documents", label: "Documents" },
  { id: "storage", label: "Storage" },
  { id: "vectorize", label: "Vectorize" },
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

const defaultPortfolioStats = [
  { val: "3+", label: "Years Experience" },
  { val: "10+", label: "Projects Live" },
  { val: "3", label: "Nuxt Migrations" },
  { val: "Edge SSR", label: "Runtime Target" },
];

const defaultPortfolioEcosystems = [
  {
    title: "Vue & Nuxt Architecture",
    desc: "Migrating enterprise-scale applications through Nuxt versions 2, 3, and 4. Specialized in composable structure, server-side caching policies, and performance validation.",
  },
  {
    title: "Next.js & React Applications",
    desc: "Wired for Next.js App Router, React Server Components (RSC), and edge runtimes. Integrating state-management layers and strict API type validation.",
  },
  {
    title: "Backend Frameworks & databases",
    desc: "Setting up NestJS, Laravel, and Spring Boot REST APIs with PostgreSQL, MySQL, and database abstractions (Prisma). Handling authentication payloads securely.",
  },
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
    profile: { name: { first: "", last: "" }, title: "", tagline: "", summary: "", location: "", website: "", telegram: "", telegramHandle: "", linkedin: "", phones: [], cvPdfUrl: "", coverLetterPdfUrl: "", cubeImages: [], languages: [] },
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
      if (!cloned.profile.cubeImages) cloned.profile.cubeImages = [];
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

  const [activeGroup, setActiveGroup] = useState<Group>("cv");
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const [cfFiles, setCfFiles] = useState<{ key: string; size: number; uploaded: string }[] | null>(null);
  const [cfLoading, setCfLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    cv: true,
    images: true,
    root: true,
  });

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const fetchCfFiles = useCallback(async () => {
    setCfLoading(true);
    try {
      const res = await fetch("/api/cv/upload");
      if (res.ok) {
        const json = await res.json();
        setCfFiles(json.objects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCfLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCfFiles();
  }, [fetchCfFiles]);

  // Vectorize states
  const [vectorizeIndexes, setVectorizeIndexes] = useState<any[] | null>(null);
  const [vectorizeUsage, setVectorizeUsage] = useState<any>({
    requests: 0,
    p95_latency: "0 ms",
    total_vectors: 0,
    billable_usage: "$0.00",
  });
  const [vectorizeLoading, setVectorizeLoading] = useState(false);
  const [vectorizeLive, setVectorizeLive] = useState(false);
  const [vectorizeSearch, setVectorizeSearch] = useState("");

  // Index creation modal state
  const [isCreatingIndex, setIsCreatingIndex] = useState(false);
  const [newIndexName, setNewIndexName] = useState("");
  const [newIndexDesc, setNewIndexDesc] = useState("");
  const [newIndexDims, setNewIndexDims] = useState("1536"); // Preset 1536
  const [newIndexMetric, setNewIndexMetric] = useState("cosine");
  const [creatingIndexStatus, setCreatingIndexStatus] = useState("");

  // Documents uploader states
  const [docInputName, setDocInputName] = useState("");
  const [docUploading, setDocUploading] = useState(false);
  const [docDragActive, setDocDragActive] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: (() => void) | (() => Promise<void>) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Delete",
    onConfirm: null,
  });

  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: (() => void) | (() => Promise<void>),
    confirmLabel = "Delete"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  const fetchVectorizeData = useCallback(async () => {
    setVectorizeLoading(true);
    try {
      const res = await fetch("/api/cv/vectorize");
      if (res.ok) {
        const json = await res.json();
        setVectorizeIndexes(json.indexes || []);
        setVectorizeUsage(json.usage || { requests: 0, p95_latency: "0 ms", total_vectors: 0, billable_usage: "$0.00" });
        setVectorizeLive(!!json.live);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVectorizeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVectorizeData();
  }, [fetchVectorizeData]);

  // Auto-bind / fall back profile photo to an existing bucket image if the configured image doesn't exist
  useEffect(() => {
    if (!cfFiles || cfFiles.length === 0 || !draft.profile) return;

    const currentUrl = draft.profile.photoUrl || "";
    const isBucketAsset = currentUrl.startsWith("/api/images/") || currentUrl.startsWith("/images/");
    
    let currentKey = "";
    if (isBucketAsset) {
      if (currentUrl.startsWith("/api/images/")) {
        currentKey = `images/${currentUrl.substring("/api/images/".length)}`;
      } else {
        currentKey = `images/${currentUrl.substring("/images/".length)}`;
      }
    }

    const exists = currentKey ? cfFiles.some(f => f.key === currentKey) : false;

    if ((isBucketAsset && !exists) || !currentUrl) {
      const firstImage = cfFiles.find(f => 
        f.key.startsWith("images/profile-") && 
        /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(f.key)
      );
      if (firstImage) {
        const newPhotoUrl = `/api/images/${firstImage.key.substring("images/".length)}`;
        console.log(`Auto-changing profile photoUrl from "${currentUrl}" to existing image in bucket "${newPhotoUrl}"`);
        applyAndSave(d => ({
          ...d,
          profile: {
            ...d.profile,
            photoUrl: newPhotoUrl
          }
        }));
      }
    }
  }, [cfFiles, draft.profile?.photoUrl]);

  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const applyAndSave = async (updater: (d: CVData) => CVData) => {
    const newDraft = updater(draftRef.current);
    setDraft(newDraft);
    try {
      await updateCV(newDraft);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  const deleteProfileAsset = async (field: "photoUrl" | "cvPdfUrl" | "coverLetterPdfUrl", label: string) => {
    const url = draftRef.current.profile[field];
    if (!url) return;

    openConfirmModal(
      "Delete Asset",
      `Are you sure you want to delete this ${label} from Cloudflare R2 bucket and profile?`,
      async () => {
        try {
          const res = await fetch("/api/cv/upload", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
          });
          if (res.ok) {
            await applyAndSave(d => ({
              ...d,
              profile: {
                ...d.profile,
                [field]: ""
              }
            }));
            fetchCfFiles();
          } else {
            alert(`Failed to delete ${label} from Cloudflare R2.`);
          }
        } catch (err) {
          console.error(`Error deleting ${label}:`, err);
          alert(`An error occurred while deleting ${label}`);
        }
      }
    );
  };

  const handleCubeImageChange = (index: number, url: string) => {
    applyAndSave(d => {
      const cubeImages = [...(d.profile.cubeImages || [])];
      while (cubeImages.length <= index) {
        cubeImages.push("");
      }
      cubeImages[index] = url;
      return {
        ...d,
        profile: {
          ...d.profile,
          cubeImages
        }
      };
    });
  };

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

  const updatePortfolioSubtext = (v: string) => {
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), portfolioSubtext: v }
    }));
  };

  const updatePortfolioStat = (idx: number, field: "val" | "label", v: string) => {
    const stats = [...(draft.adminSettings?.portfolioStats || defaultPortfolioStats)];
    stats[idx] = { ...stats[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), portfolioStats: stats }
    }));
  };

  const updatePortfolioEcosystem = (idx: number, field: "title" | "desc", v: string) => {
    const eco = [...(draft.adminSettings?.portfolioEcosystems || defaultPortfolioEcosystems)];
    eco[idx] = { ...eco[idx], [field]: v };
    setDraft((d) => ({
      ...d,
      adminSettings: { ...(d.adminSettings || {}), portfolioEcosystems: eco }
    }));
  };

  const updatePortfolioCta = (field: "title" | "desc" | "buttonText" | "buttonHref", v: string) => {
    setDraft((d) => ({
      ...d,
      adminSettings: {
        ...(d.adminSettings || {}),
        portfolioCta: {
          ...(d.adminSettings?.portfolioCta || {
            title: "Interested in building together?",
            desc: "I take on select project scopes at a time. If you have code architecture complexity or framework migration needs, let's talk.",
            buttonText: "Schedule a conversation",
            buttonHref: "/contact"
          }),
          [field]: v
        }
      }
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
    openConfirmModal(
      "Delete Article",
      "Are you sure you want to delete this article?",
      () => {
        const articles = (draft.articles || []).filter((_, i) => i !== index);
        setDraft(d => ({ ...d, articles }));
      }
    );
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
            value={draft.profile.photoUrl && draft.profile.photoUrl !== "/og-image.png" ? draft.profile.photoUrl : ""}
            onChange={(url) => applyAndSave(d => ({ ...d, profile: { ...d.profile, photoUrl: url } }))}
          />
        </div>
        <div>
          <DragDropUploader
            label="CV PDF Document"
            accept="application/pdf"
            uploadType="cv"
            value={draft.profile.cvPdfUrl || ""}
            onChange={(url) => applyAndSave(d => ({ ...d, profile: { ...d.profile, cvPdfUrl: url } }))}
          />
        </div>
        <div>
          <DragDropUploader
            label="Cover Letter PDF Document"
            accept="application/pdf"
            uploadType="letter"
            value={draft.profile.coverLetterPdfUrl || ""}
            onChange={(url) => applyAndSave(d => ({ ...d, profile: { ...d.profile, coverLetterPdfUrl: url } }))}
          />
        </div>
      </div>

      <SectionHeading>3D Cube Faces (6 Images)</SectionHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
        {["Right (Face 1)", "Left (Face 2)", "Top (Face 3)", "Bottom (Face 4)", "Front (Face 5)", "Back (Face 6)"].map((faceLabel, i) => (
          <div key={i} className="border border-rule/60 p-3 rounded bg-bg/25 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-muted block mb-2">{faceLabel}</span>
            <DragDropUploader
              label=""
              accept="image/*"
              compressMaxWidth={512}
              uploadType="cube"
              value={(draft.profile.cubeImages && draft.profile.cubeImages[i]) || ""}
              onChange={(url) => handleCubeImageChange(i, url)}
            />
          </div>
        ))}
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
              onChange={(urls) => applyAndSave(d => {
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

  // ── Work / Portfolio Page Admin Tab ──
  const renderPortfolioTab = () => {
    const portfolioStats = draft.adminSettings?.portfolioStats || defaultPortfolioStats;
    const portfolioEcosystems = draft.adminSettings?.portfolioEcosystems || defaultPortfolioEcosystems;
    const portfolioCta = draft.adminSettings?.portfolioCta || {
      title: "Interested in building together?",
      desc: "I take on select project scopes at a time. If you have code architecture complexity or framework migration needs, let's talk.",
      buttonText: "Schedule a conversation",
      buttonHref: "/contact"
    };

    return (
      <div className="space-y-6">
        <SectionHeading>Portfolio Header</SectionHeading>
        <AdminField
          label="Portfolio Subtext"
          value={draft.adminSettings?.portfolioSubtext || ""}
          onChange={updatePortfolioSubtext}
          placeholder="// production.systems · performance.caching · edge.infrastructure"
          explanation="Changes the subtext label displayed on the Work / Portfolio page header."
        />

        <SectionHeading>Quick Stats</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolioStats.map((stat, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Stat {i + 1}</p>
              <Field label="Value" value={stat.val} onChange={(v) => updatePortfolioStat(i, "val", v)} />
              <AdminField
                label="Label"
                value={stat.label}
                onChange={(v) => updatePortfolioStat(i, "label", v)}
                explanation={`Changes Stat #${i + 1} on the stats banner of the Portfolio / Work page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>Ecosystems (Skills / Pillars)</SectionHeading>
        <div className="space-y-4">
          {portfolioEcosystems.map((eco, i) => (
            <div key={i} className="border border-rule rounded p-3 bg-bg space-y-2">
              <p className="font-mono text-[9px] text-accent uppercase font-bold">Ecosystem {i + 1}</p>
              <Field label="Title" value={eco.title} onChange={(v) => updatePortfolioEcosystem(i, "title", v)} />
              <AdminField
                label="Description"
                value={eco.desc}
                onChange={(v) => updatePortfolioEcosystem(i, "desc", v)}
                multiline
                explanation={`Changes Ecosystem #${i + 1} on the Portfolio / Work page.`}
              />
            </div>
          ))}
        </div>

        <SectionHeading>Call to Action (CTA)</SectionHeading>
        <div className="border border-rule rounded p-4 bg-bg/25 space-y-3">
          <Field label="CTA Title" value={portfolioCta.title} onChange={(v) => updatePortfolioCta("title", v)} />
          <AdminField
            label="CTA Description"
            value={portfolioCta.desc}
            onChange={(v) => updatePortfolioCta("desc", v)}
            multiline
          />
          <Field label="CTA Button Text" value={portfolioCta.buttonText} onChange={(v) => updatePortfolioCta("buttonText", v)} />
          <Field label="CTA Button Link" value={portfolioCta.buttonHref} onChange={(v) => updatePortfolioCta("buttonHref", v)} />
        </div>

        <SectionHeading>Projects / Experience Data</SectionHeading>
        <p className="text-[11px] text-muted -mt-2">
          Manage your work projects and case studies below. These are shared with the CV Experience list.
        </p>
        {renderExperienceTab()}
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

  // ── Documents Manager Tab ──
  const renderDocumentsTab = () => {
    const list = draft.documents || [];

    const handleDocDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDocDragActive(true);
      } else if (e.type === "dragleave") {
        setDocDragActive(false);
      }
    };

    const handleDocDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDocDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFilesUpload(e.dataTransfer.files);
      }
    };

    const handleFilesUpload = async (files: FileList) => {
      setDocUploading(true);
      let nameUsed = false;
      const uploadedDocs: DocumentItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop()?.toLowerCase();
        const allowedExts = ["md", "txt", "pdf", "html", "htm"];
        if (!allowedExts.includes(ext || "")) {
          alert(`File "${file.name}" is not supported. Supported extensions: .md, .txt, .pdf, .html, .htm`);
          continue;
        }

        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", "document");

        try {
          const res = await fetch("/api/cv/upload", {
            method: "POST",
            body: fd,
          });

          if (!res.ok) {
            const json = await res.json() as any;
            alert(`Failed to upload ${file.name}: ${json.error || res.statusText}`);
            continue;
          }

          const json = await res.json() as { url: string };
          
          const displayName = !nameUsed && docInputName
            ? docInputName
            : file.name.replace(/\.[^/.]+$/, "").split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          
          if (!nameUsed && docInputName) nameUsed = true;

          const newDoc = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: displayName,
            filename: file.name,
            key: `documents/${file.name}`,
            url: json.url,
            uploadedAt: new Date().toISOString(),
          };

          uploadedDocs.push(newDoc);
        } catch (err) {
          console.error(err);
          alert(`Upload failed for ${file.name}`);
        }
      }

      if (uploadedDocs.length > 0) {
        if (nameUsed) setDocInputName("");
        await applyAndSave((d) => {
          const current = d.documents || [];
          const filenamesToReplace = new Set(uploadedDocs.map(ud => ud.filename));
          const filtered = current.filter(item => !filenamesToReplace.has(item.filename));
          return {
            ...d,
            documents: [...filtered, ...uploadedDocs],
          };
        });
        fetchCfFiles();
      }
      setDocUploading(false);
    };

    const handleFileSelectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleFilesUpload(e.target.files);
      }
    };

    const handleDeleteDoc = async (doc: any) => {
      openConfirmModal(
        "Delete Document",
        `Are you sure you want to delete the document "${doc.name}"?`,
        async () => {
          try {
            const res = await fetch("/api/cv/upload", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: doc.url }),
            });
            if (res.ok) {
              await applyAndSave((d) => ({
                ...d,
                documents: (d.documents || []).filter((item) => item.id !== doc.id),
              }));
              fetchCfFiles();
            } else {
              alert("Failed to delete the document from Cloudflare R2.");
            }
          } catch (e) {
            console.error(e);
            alert("An error occurred while deleting the document.");
          }
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold">Documents Manager</h4>
            <p className="text-[10px] text-muted mt-0.5">Upload Markdown files like Hackers.md and set premium display names.</p>
          </div>
        </div>

        <div className="max-w-md">
          <Field
            label="Document Display Name (Optional)"
            value={docInputName}
            onChange={setDocInputName}
            placeholder="e.g. Hackers Guide, Project Proposal..."
          />
          <p className="text-[9.5px] text-muted font-mono mt-1">
            If left blank, the filename will be auto-formatted as the display name.
          </p>
        </div>

        <div
          onDragEnter={handleDocDrag}
          onDragOver={handleDocDrag}
          onDragLeave={handleDocDrag}
          onDrop={handleDocDrop}
          onClick={() => docFileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all duration-200 ${
            docDragActive
              ? "border-accent bg-accent/[0.02] scale-[0.99]"
              : "border-rule hover:border-ink hover:bg-tag-bg/20"
          }`}
        >
          <input
            ref={docFileInputRef}
            type="file"
            accept=".md,text/markdown,.txt,text/plain,.pdf,application/pdf,.html,text/html"
            multiple
            onChange={handleFileSelectChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {docUploading ? (
              <>
                <RefreshCw size={18} className="text-accent animate-spin" />
                <p className="font-mono text-[11px] text-ink animate-pulse uppercase tracking-wider">
                  uploading.documents...
                </p>
              </>
            ) : (
              <>
                <Upload size={18} className="text-muted" />
                <p className="font-mono text-[11px] text-ink uppercase tracking-wider font-semibold">
                  Drag & drop multiple files (.md, .txt, .pdf, .html)
                </p>
                <p className="font-mono text-[9px] text-muted">
                  [ or click to select ]
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <h5 className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted mb-3 font-semibold">
            Uploaded Documents ({list.length})
          </h5>

          {list.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-rule rounded">
              <p className="font-mono text-[11px] text-muted">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-rule border border-rule rounded overflow-hidden bg-bg">
              {list.map((doc: any, idx: number) => (
                <div
                  key={doc.id || idx}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-tag-bg/20 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-accent/5 border border-accent/10 flex items-center justify-center text-accent shrink-0">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-sans text-[13px] text-ink font-semibold truncate block">
                        {doc.name}
                      </span>
                      <span className="font-mono text-[9px] text-muted tracking-wide mt-0.5 block truncate">
                        filename: {doc.filename} · uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-accent hover:text-accent-orange border border-rule hover:border-accent rounded px-2 py-0.5 transition-all no-underline"
                    >
                      View
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDoc(doc);
                      }}
                      className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStorageTab = () => {
    const totalStorageBytes = cfFiles
      ? cfFiles.reduce((acc, f) => acc + (f.size || 0), 0)
      : 0;

    const formatBytes = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "kB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Group files by folder prefix
    const folders: Record<string, { key: string; size: number; uploaded: string }[]> = {};
    if (cfFiles) {
      cfFiles.forEach((file) => {
        const parts = file.key.split("/");
        const folderName = parts.length > 1 ? parts[0] : "root";
        if (!folders[folderName]) {
          folders[folderName] = [];
        }
        folders[folderName].push(file);
      });
    }

    const folderNames = Object.keys(folders).sort((a, b) => {
      if (a === "root") return 1;
      if (b === "root") return -1;
      return a.localeCompare(b);
    });

    return (
      <div className="space-y-8">
        {/* Storage Dashboard Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold">Cloudflare R2 Storage</h4>
            <p className="text-[10px] text-muted mt-0.5">Manage and inspect files hosted directly in your Cloudflare bucket.</p>
          </div>
          <button
            onClick={fetchCfFiles}
            className="inline-flex items-center gap-1.5 text-[11px] border border-rule rounded px-3 py-1.5 text-ink hover:bg-tag-bg transition-colors cursor-pointer bg-transparent"
          >
            <RefreshCw size={12} className={cfLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Class A */}
          <div className="border border-rule rounded bg-surface p-5 shadow-sm relative group">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] text-muted flex items-center gap-1.5">
                Class A Operations
                <span className="relative inline-block cursor-help group/tooltip">
                  <Info size={12} className="text-muted/70 hover:text-ink transition-colors" />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-ink text-white font-mono text-[9px] leading-relaxed rounded shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50">
                    Class A operations are mutation actions: PUT, POST, DELETE, and LIST requests.
                  </span>
                </span>
              </span>
            </div>
            <div className="font-sans text-[32px] font-semibold text-ink mt-2.5 leading-none">
              342
            </div>
          </div>

          {/* Card 2: Class B */}
          <div className="border border-rule rounded bg-surface p-5 shadow-sm relative group">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] text-muted flex items-center gap-1.5">
                Class B Operations
                <span className="relative inline-block cursor-help group/tooltip">
                  <Info size={12} className="text-muted/70 hover:text-ink transition-colors" />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-ink text-white font-mono text-[9px] leading-relaxed rounded shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50">
                    Class B operations are retrieval actions: GET (download) and HEAD requests.
                  </span>
                </span>
              </span>
            </div>
            <div className="font-sans text-[32px] font-semibold text-ink mt-2.5 leading-none">
              605
            </div>
          </div>

          {/* Card 3: Total Storage */}
          <div className="border border-rule rounded bg-surface p-5 shadow-sm relative group">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] text-muted flex items-center gap-1.5">
                Total storage
                <span className="relative inline-block cursor-help group/tooltip">
                  <Info size={12} className="text-muted/70 hover:text-ink transition-colors" />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-ink text-white font-mono text-[9px] leading-relaxed rounded shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50">
                    Total volume of all stored files in your Cloudflare R2 bucket.
                  </span>
                </span>
              </span>
            </div>
            <div className="font-sans text-[32px] font-semibold text-ink mt-2.5 leading-none">
              {cfLoading && cfFiles === null ? "..." : formatBytes(totalStorageBytes)}
            </div>
          </div>
        </div>

        {/* Managed Cloudflare Profile Assets */}
        <div className="border border-rule rounded bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-rule/50 pb-2">
            <h5 className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold">Cloudflare</h5>
            <span className="text-[10px] text-muted font-mono">[ Bound to Profile Settings ]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Profile Photo */}
            <div className="flex flex-col justify-between p-3.5 rounded border border-rule/60 bg-bg/40">
              <div className="flex items-start gap-3">
                {draft.profile.photoUrl && draft.profile.photoUrl !== "/og-image.png" ? (
                  <div className="w-12 h-12 rounded border border-rule overflow-hidden bg-bg shrink-0">
                    <img src={draft.profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded border border-rule flex items-center justify-center bg-bg shrink-0 text-muted">
                    <FileText size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[12px] font-semibold text-ink block">Profile Image</span>
                  <span className="text-[10px] text-muted font-mono truncate block mt-0.5">
                    {draft.profile.photoUrl && draft.profile.photoUrl !== "/og-image.png" ? draft.profile.photoUrl.split("/").pop() : "Not Uploaded"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                {draft.profile.photoUrl && draft.profile.photoUrl !== "/og-image.png" ? (
                  <button
                    onClick={() => deleteProfileAsset("photoUrl", "Profile Photo")}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded px-2.5 py-1.5 transition-all cursor-pointer font-mono uppercase tracking-wide border-none bg-transparent"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                ) : (
                  <span className="text-[9.5px] text-muted font-mono italic">Upload in Profile tab</span>
                )}
              </div>
            </div>

            {/* 2. CV PDF */}
            <div className="flex flex-col justify-between p-3.5 rounded border border-rule/60 bg-bg/40">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded border border-rule flex items-center justify-center bg-bg shrink-0 text-accent">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[12px] font-semibold text-ink block">CV PDF Document</span>
                  <span className="text-[10px] text-muted font-mono truncate block mt-0.5">
                    {draft.profile.cvPdfUrl ? draft.profile.cvPdfUrl.split("/").pop() : "Not Uploaded"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                {draft.profile.cvPdfUrl ? (
                  <button
                    onClick={() => deleteProfileAsset("cvPdfUrl", "CV PDF")}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded px-2.5 py-1.5 transition-all cursor-pointer font-mono uppercase tracking-wide border-none bg-transparent"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                ) : (
                  <span className="text-[9.5px] text-muted font-mono italic">Upload in Profile tab</span>
                )}
              </div>
            </div>

            {/* 3. Cover Letter PDF */}
            <div className="flex flex-col justify-between p-3.5 rounded border border-rule/60 bg-bg/40">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded border border-rule flex items-center justify-center bg-bg shrink-0 text-accent">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-sans text-[12px] font-semibold text-ink block">Cover Letter PDF</span>
                  <span className="text-[10px] text-muted font-mono truncate block mt-0.5">
                    {draft.profile.coverLetterPdfUrl ? draft.profile.coverLetterPdfUrl.split("/").pop() : "Not Uploaded"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end">
                {draft.profile.coverLetterPdfUrl ? (
                  <button
                    onClick={() => deleteProfileAsset("coverLetterPdfUrl", "Cover Letter")}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 rounded px-2.5 py-1.5 transition-all cursor-pointer font-mono uppercase tracking-wide border-none bg-transparent"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                ) : (
                  <span className="text-[9.5px] text-muted font-mono italic">Upload in Profile tab</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Directory Explorer Tree */}
        <div className="border border-rule rounded bg-surface p-1 shadow-sm overflow-hidden">
          {cfFiles === null ? (
            <div className="py-16 text-center">
              <RefreshCw size={24} className="text-accent animate-spin mx-auto mb-2" />
              <p className="font-mono text-[11px] text-muted">Retrieving Cloudflare bucket objects...</p>
            </div>
          ) : cfFiles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-rule rounded m-2">
              <p className="font-mono text-[11px] text-muted">Your Cloudflare R2 bucket is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-rule/60">
              {folderNames.map((folderName) => {
                const files = folders[folderName];
                const isExpanded = !!expandedFolders[folderName];
                return (
                  <div key={folderName} className="flex flex-col">
                    {/* Folder Row Header */}
                    <button
                      onClick={() => toggleFolder(folderName)}
                      className="w-full flex items-center justify-between p-3.5 text-left font-mono text-[12px] font-bold text-ink hover:bg-tag-bg/30 transition-colors cursor-pointer border-none bg-transparent select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
                        <Folder size={14} className="text-accent shrink-0" />
                        <span>{folderName === "root" ? "root /" : `${folderName} /`}</span>
                        <span className="text-[10px] font-normal text-muted bg-tag-bg px-1.5 py-0.5 rounded shrink-0">
                          {files.length} {files.length === 1 ? "file" : "files"}
                        </span>
                      </div>
                    </button>

                    {/* Files inside folder */}
                    {isExpanded && (
                      <div className="pl-6 pr-4 pb-2 bg-surface font-mono text-[11px]">
                        <div className="divide-y divide-rule/40 border border-rule/50 rounded overflow-hidden">
                          {files.map((file) => {
                            const filename = file.key.includes("/")
                              ? file.key.split("/").slice(1).join("/")
                              : file.key;
                            
                            // Visual helpers for files
                            const isImage = file.key.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i);
                            const displayUrl = file.key.startsWith("images/")
                              ? `/api/images/${file.key.substring(7)}`
                              : file.key.startsWith("cv/")
                              ? `/api/cv/pdf/${file.key.substring(3)}`
                              : file.key.startsWith("letter/")
                              ? `/api/cv/pdf/${file.key.substring(7)}`
                              : null;

                            return (
                              <div
                                key={file.key}
                                className="flex items-center justify-between p-3 gap-4 hover:bg-tag-bg/10 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {isImage && displayUrl ? (
                                    <div className="w-10 h-10 rounded border border-rule overflow-hidden bg-bg shrink-0 flex items-center justify-center">
                                      <img src={displayUrl} alt="R2 thumbnail" className="w-full h-full object-cover animate-fade-in" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded border border-rule bg-bg shrink-0 flex items-center justify-center text-accent">
                                      <FileText size={16} />
                                    </div>
                                  )}
                                  
                                  <div className="min-w-0">
                                    <span className="text-ink font-medium break-all block">{filename}</span>
                                    <span className="text-[9.5px] text-muted block mt-0.5">
                                      Size: {formatBytes(file.size)} &middot; Key: <code className="bg-tag-bg px-1 rounded text-accent text-[9px]">{file.key}</code>
                                    </span>
                                    {file.uploaded && (
                                      <span className="text-[9px] text-muted block mt-0.5">
                                        Uploaded: {new Date(file.uploaded).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {displayUrl && (
                                    <a
                                      href={displayUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-sans text-[11px] text-muted hover:text-ink border border-rule rounded px-2.5 py-1.5 transition-colors no-underline inline-block"
                                    >
                                      View
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      openConfirmModal(
                                        "Delete File",
                                        `Delete "${filename}" from Cloudflare R2 bucket?`,
                                        async () => {
                                          try {
                                            const res = await fetch("/api/cv/upload", {
                                              method: "DELETE",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ key: file.key })
                                            });
                                            if (res.ok) {
                                              fetchCfFiles(); // Refresh list after delete
                                            } else {
                                              alert("Failed to delete file.");
                                            }
                                          } catch (err) {
                                            console.error(err);
                                            alert("Error deleting file.");
                                          }
                                        }
                                      );
                                    }}
                                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 border border-rule hover:border-red-500/20 rounded transition-colors cursor-pointer bg-transparent"
                                    title="Delete file"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVectorizeTab = () => {
    const filteredIndexes = vectorizeIndexes
      ? vectorizeIndexes.filter(idx =>
          idx.name.toLowerCase().includes(vectorizeSearch.toLowerCase()) ||
          (idx.description || "").toLowerCase().includes(vectorizeSearch.toLowerCase())
        )
      : [];

    const handleCreateIndex = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newIndexName) return;
      setCreatingIndexStatus("Creating...");
      try {
        const res = await fetch("/api/cv/vectorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newIndexName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            description: newIndexDesc,
            config: {
              dimensions: Number(newIndexDims),
              metric: newIndexMetric,
            }
          })
        });
        const json = await res.json();
        if (res.ok && json.success) {
          if (!json.live) {
            // Mock mode client fallback: add to state
            setVectorizeIndexes((prev: any[] | null) => [
              ...(prev || []),
              json.result
            ]);
            // Update total vectors in usage mock
            setVectorizeUsage((prev: any) => ({
              ...prev,
              total_vectors: prev.total_vectors + (json.result.stats?.count || 0)
            }));
          } else {
            fetchVectorizeData();
          }
          setIsCreatingIndex(false);
          setNewIndexName("");
          setNewIndexDesc("");
          setNewIndexDims("1536");
          setNewIndexMetric("cosine");
        } else {
          alert(json.error || "Failed to create Vectorize index");
        }
      } catch (err) {
        console.error(err);
        alert("Error creating index");
      } finally {
        setCreatingIndexStatus("");
      }
    };

    const handleDeleteIndex = async (indexName: string) => {
      openConfirmModal(
        "Delete Vectorize Index",
        `Are you sure you want to delete Vectorize index "${indexName}"?`,
        async () => {
          try {
            const res = await fetch(`/api/cv/vectorize?name=${indexName}`, {
              method: "DELETE",
            });
            const json = await res.json();
            if (res.ok && json.success) {
              if (!json.live) {
                // Mock mode client fallback: remove from state
                setVectorizeIndexes((prev: any[] | null) => (prev || []).filter(idx => idx.name !== indexName));
                // Update total vectors
                const deletedIdx = (vectorizeIndexes || []).find(idx => idx.name === indexName);
                const deletedCount = deletedIdx?.stats?.count || 0;
                setVectorizeUsage((prev: any) => ({
                  ...prev,
                  total_vectors: Math.max(0, prev.total_vectors - deletedCount)
                }));
              } else {
                fetchVectorizeData();
              }
            } else {
              alert(json.error || "Failed to delete Vectorize index");
            }
          } catch (err) {
            console.error(err);
            alert("Error deleting index");
          }
        }
      );
    };

    return (
      <div className="space-y-6 text-ink">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-rule">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 rounded border border-accent/20 text-accent flex items-center justify-center shrink-0">
                <List size={18} />
              </div>
              <h2 className="font-sans text-[20px] font-semibold text-ink leading-tight">Vectorize</h2>
            </div>
            <p className="text-[12px] text-muted max-w-2xl mt-1 leading-relaxed">
              Build full-stack AI applications with Vectorize, Cloudflare's powerful vector database. Combine it with Workers AI to store and query embeddings, or bring-your-own embeddings to Vectorize.
            </p>
          </div>
          <a
            href="https://developers.cloudflare.com/vectorize/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium border border-rule hover:bg-tag-bg rounded px-3 py-1.5 text-ink no-underline transition-colors shrink-0"
          >
            Documentation
          </a>
        </div>

        {/* Dashboard Grid split into Left (indices) and Right (usage) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Indexes Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  value={vectorizeSearch}
                  onChange={(e) => setVectorizeSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-rule rounded text-[13px] text-ink bg-bg placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                  <List size={13} />
                </span>
              </div>
              <button
                onClick={fetchVectorizeData}
                className="p-2 border border-rule hover:bg-tag-bg rounded text-muted hover:text-ink transition-colors cursor-pointer bg-transparent"
                title="Refresh"
              >
                <RefreshCw size={14} className={vectorizeLoading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setIsCreatingIndex(true)}
                className="inline-flex items-center gap-1 text-[11px] bg-ink hover:bg-accent text-white font-medium rounded px-3.5 py-2 transition-colors cursor-pointer border-none"
              >
                <Plus size={13} /> Create index
              </button>
            </div>

            <div className="border border-rule rounded overflow-hidden bg-bg">
              {vectorizeIndexes === null ? (
                <div className="py-16 text-center">
                  <RefreshCw size={24} className="text-accent animate-spin mx-auto mb-2" />
                  <p className="font-mono text-[11px] text-muted">Loading Vectorize indexes...</p>
                </div>
              ) : filteredIndexes.length === 0 ? (
                <div className="py-20 text-center font-sans">
                  <p className="text-[14px] text-muted mb-4">No results</p>
                  <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-1 border border-rule rounded text-muted/40 cursor-not-allowed select-none">&lt;&lt;</span>
                    <span className="px-2 py-1 border border-rule rounded text-muted/40 cursor-not-allowed select-none">&lt;</span>
                    <span className="px-3 py-1 border border-accent bg-tag-bg text-accent rounded font-bold">1</span>
                    <span className="px-2 py-1 border border-rule rounded text-muted/40 cursor-not-allowed select-none">&gt;</span>
                    <span className="px-2 py-1 border border-rule rounded text-muted/40 cursor-not-allowed select-none">&gt;&gt;</span>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-rule bg-surface font-sans text-muted text-[10px] uppercase tracking-wider">
                        <th className="p-3 font-semibold">Index Name</th>
                        <th className="p-3 font-semibold">Description</th>
                        <th className="p-3 font-semibold text-right">Dimensions</th>
                        <th className="p-3 font-semibold text-center">Metric</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule/60">
                      {filteredIndexes.map((idx) => (
                        <tr key={idx.name} className="hover:bg-tag-bg/10 transition-colors">
                          <td className="p-3 font-bold text-ink whitespace-nowrap">{idx.name}</td>
                          <td className="p-3 text-muted max-w-[200px] truncate" title={idx.description}>{idx.description || "-"}</td>
                          <td className="p-3 text-right font-semibold">{idx.config?.dimensions}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold text-[10px]">
                              {idx.config?.metric}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteIndex(idx.name)}
                              className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 border border-rule hover:border-red-500/20 rounded transition-colors cursor-pointer bg-transparent"
                              title="Delete index"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!vectorizeLive && vectorizeIndexes !== null && (
              <p className="font-mono text-[9px] text-muted italic pl-1">
                * Running in Local Mock mode. Creating or deleting indexes will update client state in local session cache.
              </p>
            )}
          </div>

          {/* Right Panel: Usage & Latency stats */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h3 className="font-sans text-[18px] font-semibold text-ink leading-none mb-1 flex items-center justify-between">
                Usage
                <span className="font-mono text-[10px] text-muted font-normal uppercase">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </h3>
            </div>

            {/* Billing Dashboard Box */}
            <div className="border border-rule rounded bg-surface p-4 shadow-sm space-y-4">
              <a
                href="https://dash.cloudflare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between font-mono text-[12px] font-bold text-ink hover:text-accent no-underline transition-colors pb-2 border-b border-rule/60"
              >
                <span>Billing Dashboard</span>
                <span>&rarr;</span>
              </a>

              <div className="flex flex-col items-center py-2 text-center">
                <p className="font-mono text-[10px] uppercase text-muted tracking-wider mb-2">Billable usage (current period)</p>
                <div className="w-28 h-28 rounded-full border-8 border-rule flex items-center justify-center relative">
                  <span className="font-sans text-[18px] font-semibold text-ink">{vectorizeUsage.billable_usage}</span>
                </div>
                <p className="font-mono text-[10px] text-muted mt-4">No billable usage incurred yet</p>
              </div>
            </div>

            {/* General Metrics boxes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Requests */}
              <div className="border border-rule rounded bg-surface p-4 shadow-sm space-y-2">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">Requests</span>
                <span className="font-sans text-[24px] font-bold text-ink block leading-none">{vectorizeUsage.requests}</span>
              </div>

              {/* P95 Latency */}
              <div className="border border-rule rounded bg-surface p-4 shadow-sm space-y-2">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">P95 latency</span>
                <span className="font-sans text-[24px] font-bold text-ink block leading-none">{vectorizeUsage.p95_latency}</span>
              </div>
            </div>

            {/* Total Vectors Card */}
            <div className="border border-rule rounded bg-surface p-4 shadow-sm space-y-2">
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider block">Total vectors</span>
              <span className="font-sans text-[24px] font-bold text-ink block leading-none">
                {vectorizeLoading && vectorizeIndexes === null ? "..." : vectorizeUsage.total_vectors}
              </span>
            </div>
          </div>
        </div>

        {/* Create Index Modal */}
        {isCreatingIndex && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg/65 backdrop-blur-md animate-alert-fade-in">
            <form
              onSubmit={handleCreateIndex}
              className="bg-surface border border-rule max-w-md w-full rounded p-6 shadow-2xl relative overflow-hidden animate-alert-zoom-in space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-accent-orange" />
              <div className="pb-2 border-b border-rule">
                <h3 className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                  Create Vectorize Index
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">
                    Index Name (lowercase, alphanumeric, hyphens)
                  </label>
                  <input
                    type="text"
                    required
                    value={newIndexName}
                    onChange={(e) => setNewIndexName(e.target.value)}
                    placeholder="e.g. portfolio-articles"
                    className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newIndexDesc}
                    onChange={(e) => setNewIndexDesc(e.target.value)}
                    placeholder="e.g. Index of OpenAI text-embedding-3-small vectors"
                    className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">
                      Dimensions
                    </label>
                    <select
                      value={newIndexDims}
                      onChange={(e) => setNewIndexDims(e.target.value)}
                      className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors font-mono"
                    >
                      <option value="1536">1536 (OpenAI, standard)</option>
                      <option value="384">384 (MiniLM, light)</option>
                      <option value="768">768 (Cohere, medium)</option>
                      <option value="1024">1024 (Large embeddings)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">
                      Metric
                    </label>
                    <select
                      value={newIndexMetric}
                      onChange={(e) => setNewIndexMetric(e.target.value)}
                      className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors font-mono"
                    >
                      <option value="cosine">Cosine</option>
                      <option value="euclidean">Euclidean (L2)</option>
                      <option value="dot-product">Dot Product</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-rule justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingIndex(false);
                    setNewIndexName("");
                    setNewIndexDesc("");
                  }}
                  className="py-2 px-4 border border-rule rounded text-muted hover:text-ink text-xs font-mono tracking-wide transition-colors cursor-pointer bg-transparent"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!!creatingIndexStatus}
                  className="py-2 px-4 bg-ink hover:bg-accent text-white rounded text-xs font-mono tracking-wide transition-colors cursor-pointer disabled:opacity-50 border-none"
                >
                  {creatingIndexStatus || "CREATE"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  // ── Colors Tab ───────────────────────────────────────────────────────────────
  const renderColorsTab = () => {
    const saved = draft.adminSettings?.themeColors;
    const lightColors: ThemeColorSet = { ...DEFAULT_LIGHT_COLORS, ...(saved?.light ?? {}) };
    const darkColors: ThemeColorSet = { ...DEFAULT_DARK_COLORS, ...(saved?.dark ?? {}) };

    const colorFields: { key: keyof ThemeColorSet; label: string; desc: string }[] = [
      { key: "accent",       label: "Accent",        desc: "Primary brand color — buttons, links, highlights" },
      { key: "accentOrange", label: "Accent Orange",  desc: "Secondary accent — tags, hover effects" },
      { key: "bg",           label: "Background",     desc: "Page background color" },
      { key: "surface",      label: "Surface",        desc: "Cards, modals, elevated surfaces" },
      { key: "ink",          label: "Ink",            desc: "Primary text color" },
      { key: "ink2",         label: "Ink 2",          desc: "Secondary text color" },
      { key: "muted",        label: "Muted",          desc: "Placeholder and subdued text" },
    ];

    const updateColor = (theme: "light" | "dark", key: keyof ThemeColorSet, value: string) => {
      const current = draft.adminSettings?.themeColors ?? {
        light: { ...DEFAULT_LIGHT_COLORS },
        dark: { ...DEFAULT_DARK_COLORS },
      };
      setDraft((prev) => ({
        ...prev,
        adminSettings: {
          ...prev.adminSettings,
          themeColors: {
            ...current,
            [theme]: {
              ...current[theme],
              [key]: value,
            },
          },
        },
      }));
    };

    const resetTheme = (theme: "light" | "dark") => {
      const defaults = theme === "light" ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
      const current = draft.adminSettings?.themeColors ?? {
        light: { ...DEFAULT_LIGHT_COLORS },
        dark: { ...DEFAULT_DARK_COLORS },
      };
      setDraft((prev) => ({
        ...prev,
        adminSettings: {
          ...prev.adminSettings,
          themeColors: {
            ...current,
            [theme]: { ...defaults },
          },
        },
      }));
    };

    const ColorSection = ({ theme, colors }: { theme: "light" | "dark"; colors: ThemeColorSet }) => (
      <div className="p-5 rounded-lg border border-rule bg-surface/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-mono text-[11px] tracking-[2px] uppercase text-accent">
            {theme === "light" ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </h3>
          <button
            type="button"
            onClick={() => resetTheme(theme)}
            className="font-mono text-[9px] uppercase tracking-wide text-muted hover:text-accent transition-colors border border-rule rounded px-2.5 py-1 cursor-pointer bg-transparent"
          >
            Reset defaults
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {colorFields.map(({ key, label, desc }) => {
            const value = colors[key];
            return (
              <div key={key} className="flex items-center gap-3">
                {/* Swatch + native color picker */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded border border-rule cursor-pointer"
                    style={{ backgroundColor: value }}
                  />
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(theme, key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title={label}
                  />
                </div>

                {/* Text input for hex */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-[10px] tracking-[1px] uppercase text-muted w-24 shrink-0">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^#([0-9a-fA-F]{0,6})$/.test(v)) updateColor(theme, key, v);
                      }}
                      onBlur={(e) => {
                        // Pad to full hex on blur
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{3}$/.test(v)) {
                          const r = v[1]+v[1], g = v[2]+v[2], b = v[3]+v[3];
                          updateColor(theme, key, `#${r}${g}${b}`);
                        }
                      }}
                      maxLength={7}
                      className="w-24 px-2 py-1 border border-rule rounded text-[12px] font-mono bg-bg text-ink focus:outline-none focus:border-accent transition-colors"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="font-mono text-[9px] text-muted/70 pl-26">{desc}</p>
                </div>

                {/* Live preview dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-rule"
                  style={{ backgroundColor: value }}
                  title="Current value preview"
                />
              </div>
            );
          })}
        </div>

        {/* Preview card */}
        <div
          className="mt-6 rounded-lg p-5 border"
          style={{
            backgroundColor: colors.bg,
            borderColor: "rgba(128,128,128,0.15)",
          }}
        >
          <p className="font-mono text-[8px] uppercase tracking-[2px] mb-3" style={{ color: colors.muted }}>// Preview</p>
          <h4 className="text-[18px] font-light mb-1" style={{ color: colors.ink }}>
            Thoeun <span style={{ color: colors.accent }}>Lothin</span>
          </h4>
          <p className="text-[11px] mb-3" style={{ color: colors.ink2 }}>Senior Full-Stack Developer</p>
          <div className="flex gap-2 flex-wrap">
            <span
              className="text-[10px] px-2.5 py-1 rounded"
              style={{ backgroundColor: colors.accent, color: "#fff" }}
            >
              See my work
            </span>
            <span
              className="text-[10px] px-2.5 py-1 rounded border"
              style={{ borderColor: colors.muted, color: colors.ink2 }}
            >
              Contact me
            </span>
            <span
              className="text-[10px] px-2.5 py-1 rounded"
              style={{ backgroundColor: colors.surface, color: colors.ink2, border: "1px solid rgba(128,128,128,0.12)" }}
            >
              Tag
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[16px] font-medium text-ink mb-1">Theme Colors</h2>
          <p className="font-mono text-[10px] text-muted tracking-wide">
            Customize site colors for each theme. Changes are saved to Cloudflare R2 and applied globally on next page load.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ColorSection theme="light" colors={lightColors} />
          <ColorSection theme="dark" colors={darkColors} />
        </div>

        <div className="p-4 rounded-lg border border-rule bg-surface/30">
          <p className="font-mono text-[10px] text-muted tracking-wide flex items-start gap-2">
            <span className="text-accent shrink-0">ℹ</span>
            Colors are stored in <code className="text-accent text-[10px]">adminSettings.themeColors</code> inside <code className="text-accent text-[10px]">cv.json</code> on Cloudflare R2.
            Hit <strong className="text-ink">Save Changes</strong> at the top to persist. Visitors see updates on their next page load (server-rendered, zero flash).
          </p>
        </div>
      </div>
    );
  };

  // ── Navigation Menu Manager Tab ──────────────────────────────────────────
  const renderNavigationTab = () => {
    const DEFAULT_NAV: NavLink[] = [
      { href: "/", label: "Home", sectionId: "home", pathMatch: "/" },
      { href: "/about", label: "About", sectionId: "about", pathMatch: "/about" },
      { href: "/portfolio", label: "Work", sectionId: "work", pathMatch: "/portfolio" },
      { href: "/services", label: "Services", sectionId: "services", pathMatch: "/services" },
      { href: "/articles", label: "Writing", sectionId: "writing", pathMatch: "/articles" },
      { href: "/documents", label: "Documents", sectionId: "documents", pathMatch: "/documents" },
      { href: "/contact", label: "Reach Out", sectionId: "contact", pathMatch: "/contact" },
    ];

    const navLinks = (draft.adminSettings?.navLinks && draft.adminSettings.navLinks.length > 0)
      ? draft.adminSettings.navLinks
      : DEFAULT_NAV;

    const updateLink = (index: number, field: keyof NavLink, val: string) => {
      const next = [...navLinks];
      next[index] = { ...next[index], [field]: val };
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, navLinks: next },
      }));
    };

    const addLink = () => {
      const newLink: NavLink = {
        label: "New Page",
        href: "/new-page",
        sectionId: `nav-${Date.now()}`,
        pathMatch: "/new-page",
      };
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, navLinks: [...navLinks, newLink] },
      }));
    };

    const removeLink = (index: number) => {
      const next = navLinks.filter((_, i) => i !== index);
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, navLinks: next },
      }));
    };

    const moveLink = (index: number, dir: -1 | 1) => {
      const target = index + dir;
      if (target < 0 || target >= navLinks.length) return;
      const next = [...navLinks];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, navLinks: next },
      }));
    };

    const resetDefaults = () => {
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, navLinks: DEFAULT_NAV },
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-rule flex-wrap gap-2">
          <div>
            <h2 className="text-[16px] font-medium text-ink mb-1">Navigation Menu Links</h2>
            <p className="font-mono text-[10px] text-muted tracking-wide">
              Customize navbar and mobile menu links. Changes are saved to Firebase and update in real-time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetDefaults}
              className="text-[11px] font-mono border border-rule rounded px-3 py-1.5 text-muted hover:text-ink hover:bg-tag-bg/40 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              onClick={addLink}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono bg-accent text-white rounded px-3 py-1.5 hover:bg-accent/90 transition-colors cursor-pointer"
            >
              <Plus size={13} /> Add Menu Item
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {navLinks.map((link, idx) => (
            <div
              key={link.sectionId || idx}
              className="p-4 rounded-lg border border-rule bg-surface/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-muted">
                <span className="font-mono text-[11px] font-bold text-accent w-6 text-center">
                  #{idx + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveLink(idx, -1)}
                    className="p-1 hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    disabled={idx === navLinks.length - 1}
                    onClick={() => moveLink(idx, 1)}
                    className="p-1 hover:text-ink disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Label (Display Text)
                  </label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(idx, "label", e.target.value)}
                    placeholder="Menu label"
                    className="w-full px-2.5 py-1.5 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Destination URL / Href
                  </label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(idx, "href", e.target.value)}
                    placeholder="/portfolio or https://..."
                    className="w-full px-2.5 py-1.5 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                    Section Identifier
                  </label>
                  <input
                    type="text"
                    value={link.sectionId}
                    onChange={(e) => updateLink(idx, "sectionId", e.target.value)}
                    placeholder="e.g. work"
                    className="w-full px-2.5 py-1.5 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent font-mono text-[11px]"
                  />
                </div>
              </div>

              <button
                onClick={() => removeLink(idx)}
                className="p-2 text-muted hover:text-red-500 rounded border border-transparent hover:border-red-500/20 transition-colors cursor-pointer shrink-0 self-end md:self-center"
                title="Delete Link"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg border border-rule bg-surface/30">
          <p className="font-mono text-[10px] text-muted tracking-wide flex items-start gap-2">
            <span className="text-accent shrink-0">ℹ</span>
            Navigation links control both the desktop sticky navbar, mobile drawer menu, and footer directory index.
          </p>
        </div>
      </div>
    );
  };

  // ── Typography, Fonts & Box Shadow Manager Tab ────────────────────────────
  const renderTypographyTab = () => {
    const styles = draft.adminSettings?.themeStyles || {
      fontDisplay: '"Instrument Serif", Georgia, serif',
      fontBody: '"DM Sans", system-ui, sans-serif',
      fontMono: '"DM Mono", "JetBrains Mono", monospace',
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
      borderRadius: "8px",
    };

    const updateStyle = (key: keyof ThemeStyles, val: string) => {
      setDraft((d) => ({
        ...d,
        adminSettings: {
          ...d.adminSettings,
          themeStyles: {
            ...(d.adminSettings?.themeStyles || styles),
            [key]: val,
          },
        },
      }));
    };

    const DISPLAY_FONTS = [
      { label: "Instrument Serif (Default Elegant)", value: '"Instrument Serif", Georgia, serif' },
      { label: "Playfair Display (Editorial High-Contrast)", value: '"Playfair Display", Georgia, serif' },
      { label: "Cormorant Garamond (Classic Luxury)", value: '"Cormorant Garamond", Georgia, serif' },
      { label: "Cinzel (Cinematic Classical)", value: '"Cinzel", serif' },
      { label: "Space Grotesk (Modern Tech Display)", value: '"Space Grotesk", sans-serif' },
      { label: "Georgia (System Serif)", value: "Georgia, serif" },
    ];

    const BODY_FONTS = [
      { label: "DM Sans (Default Geometric)", value: '"DM Sans", system-ui, -apple-system, sans-serif' },
      { label: "Inter (Ultra-Clean UI Sans)", value: '"Inter", system-ui, sans-serif' },
      { label: "Plus Jakarta Sans (Modern Editorial)", value: '"Plus Jakarta Sans", system-ui, sans-serif' },
      { label: "Outfit (Balanced Contemporary)", value: '"Outfit", system-ui, sans-serif' },
      { label: "Roboto (Clean Neutral)", value: '"Roboto", system-ui, sans-serif' },
      { label: "System UI (Native OS)", value: "system-ui, -apple-system, sans-serif" },
    ];

    const MONO_FONTS = [
      { label: "DM Mono (Default Tech)", value: '"DM Mono", "JetBrains Mono", monospace' },
      { label: "JetBrains Mono (Developer Ligatures)", value: '"JetBrains Mono", monospace' },
      { label: "Fira Code (Developer Code Font)", value: '"Fira Code", monospace' },
      { label: "Space Mono (Retro Sci-Fi)", value: '"Space Mono", monospace' },
      { label: "Monospace (System Default)", value: "monospace" },
    ];

    const SHADOW_PRESETS = [
      { label: "Clean Elevation", value: "0 10px 25px -5px rgba(0, 0, 0, 0.08)" },
      { label: "Subtle Float", value: "0 2px 10px rgba(0, 0, 0, 0.04)" },
      { label: "Deep Focus", value: "0 20px 45px -10px rgba(0, 0, 0, 0.14)" },
      { label: "Blue Accent Glow", value: "0 0 25px rgba(27, 93, 239, 0.20)" },
      { label: "Warm Amber Glow", value: "0 0 25px rgba(226, 83, 39, 0.22)" },
      { label: "Brutalist Retro", value: "4px 4px 0px var(--ink)" },
      { label: "None / Flat", value: "none" },
    ];

    const RADIUS_PRESETS = [
      { label: "Sharp (0px)", value: "0px" },
      { label: "Subtle (4px)", value: "4px" },
      { label: "Default (8px)", value: "8px" },
      { label: "Modern (14px)", value: "14px" },
      { label: "Pill (9999px)", value: "9999px" },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[16px] font-medium text-ink mb-1">Typography & Box Shadows</h2>
          <p className="font-mono text-[10px] text-muted tracking-wide">
            Control global font families, box-shadow depth, and card border radiuses across all site pages. Stored in Firebase.
          </p>
        </div>

        {/* Font Families Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-lg border border-rule bg-surface/30">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent font-bold block">
              Display / Heading Font
            </label>
            <p className="text-[10px] text-muted mb-2">Used for headers, titles, and section numbers.</p>
            <select
              value={styles.fontDisplay || DISPLAY_FONTS[0].value}
              onChange={(e) => updateStyle("fontDisplay", e.target.value)}
              className="w-full px-2.5 py-2 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent"
            >
              {DISPLAY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 p-4 rounded-lg border border-rule bg-surface/30">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent font-bold block">
              Body / Content Font
            </label>
            <p className="text-[10px] text-muted mb-2">Used for paragraphs, descriptions, and UI text.</p>
            <select
              value={styles.fontBody || BODY_FONTS[0].value}
              onChange={(e) => updateStyle("fontBody", e.target.value)}
              className="w-full px-2.5 py-2 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent"
            >
              {BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 p-4 rounded-lg border border-rule bg-surface/30">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent font-bold block">
              Monospace / Code Font
            </label>
            <p className="text-[10px] text-muted mb-2">Used for telemetry chips, tags, and timestamps.</p>
            <select
              value={styles.fontMono || MONO_FONTS[0].value}
              onChange={(e) => updateStyle("fontMono", e.target.value)}
              className="w-full px-2.5 py-2 border border-rule rounded text-[12px] bg-bg text-ink focus:outline-none focus:border-accent"
            >
              {MONO_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Box Shadow & Card Radius */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 p-4 rounded-lg border border-rule bg-surface/30">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent font-bold block">
              Box Shadow Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SHADOW_PRESETS.map((p) => {
                const active = (styles.boxShadow || SHADOW_PRESETS[0].value) === p.value;
                return (
                  <button
                    key={p.label}
                    onClick={() => updateStyle("boxShadow", p.value)}
                    className={`px-3 py-2 text-[11px] rounded border text-left transition-all cursor-pointer ${
                      active
                        ? "border-accent bg-accent/10 text-accent font-medium"
                        : "border-rule text-muted hover:border-ink hover:text-ink bg-bg"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                Custom CSS Box Shadow
              </label>
              <input
                type="text"
                value={styles.boxShadow || ""}
                onChange={(e) => updateStyle("boxShadow", e.target.value)}
                placeholder="0 10px 25px -5px rgba(0,0,0,0.08)"
                className="w-full px-2.5 py-1.5 border border-rule rounded text-[11px] font-mono bg-bg text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-3 p-4 rounded-lg border border-rule bg-surface/30">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-accent font-bold block">
              Card Corner Radius
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RADIUS_PRESETS.map((r) => {
                const active = (styles.borderRadius || RADIUS_PRESETS[2].value) === r.value;
                return (
                  <button
                    key={r.label}
                    onClick={() => updateStyle("borderRadius", r.value)}
                    className={`px-3 py-2 text-[11px] rounded border text-left transition-all cursor-pointer ${
                      active
                        ? "border-accent bg-accent/10 text-accent font-medium"
                        : "border-rule text-muted hover:border-ink hover:text-ink bg-bg"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-2">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted block mb-1">
                Custom Border Radius Value
              </label>
              <input
                type="text"
                value={styles.borderRadius || ""}
                onChange={(e) => updateStyle("borderRadius", e.target.value)}
                placeholder="8px or 1rem"
                className="w-full px-2.5 py-1.5 border border-rule rounded text-[11px] font-mono bg-bg text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Live Interactive Preview */}
        <div className="p-6 rounded-lg border border-rule bg-bg space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-[1.5px] text-muted font-bold block">
            // Live Styling Preview
          </span>
          <div
            className="p-6 bg-surface border border-rule transition-all"
            style={{
              boxShadow: styles.boxShadow || "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
              borderRadius: styles.borderRadius || "8px",
            }}
          >
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-[2px] text-accent">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Preview Card · Interactive</span>
            </div>
            <h3
              className="text-2xl font-normal text-ink mb-2"
              style={{ fontFamily: styles.fontDisplay || "inherit" }}
            >
              Crafting Mission-Critical Architecture
            </h3>
            <p
              className="text-[13.5px] text-muted leading-relaxed mb-4"
              style={{ fontFamily: styles.fontBody || "inherit" }}
            >
              This live preview updates in real-time as you switch font families and shadow depth. When saved, it applies seamlessly across all visitor routes.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 bg-accent text-white text-[11px] font-medium"
                style={{ borderRadius: styles.borderRadius || "6px" }}
              >
                Button Sample
              </span>
              <span
                className="px-2.5 py-1 border border-rule font-mono text-[10px] text-ink"
                style={{ fontFamily: styles.fontMono || "monospace", borderRadius: styles.borderRadius || "6px" }}
              >
                status: 200 OK
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Contact & Footer Text Manager Tab ─────────────────────────────────────
  const renderContactTab = () => {
    const s = draft.adminSettings || {};
    const setS = (field: string, val: any) => {
      setDraft((d) => ({
        ...d,
        adminSettings: { ...d.adminSettings, [field]: val },
      }));
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[16px] font-medium text-ink mb-1">Contact & Footer Texts</h2>
          <p className="font-mono text-[10px] text-muted tracking-wide">
            Manage static copy across the Contact page and global site footer. Stored in Firebase.
          </p>
        </div>

        <SectionHeading>Contact Page Header & Intro</SectionHeading>
        <div className="space-y-4">
          <AdminField
            label="Contact Subtitle / Telemetry Line"
            value={s.contactSubtext || ""}
            onChange={(v) => setS("contactSubtext", v)}
            placeholder="// establish.connection · socket.handshake · channel.open"
            explanation="Shown in monospace below the big 'Contact' heading."
          />
          <AdminField
            label="Contact Intro Paragraph"
            value={s.contactIntro || ""}
            onChange={(v) => setS("contactIntro", v)}
            multiline
            placeholder="Let's build something stable together. You can reach out through any of these communication channels..."
            explanation="Introductory invitation text on the contact page."
          />
        </div>

        <SectionHeading>Global Footer Information</SectionHeading>
        <div className="space-y-4">
          <AdminField
            label="Footer Bio Tagline"
            value={s.footerTagline || ""}
            onChange={(v) => setS("footerTagline", v)}
            multiline
            placeholder="Senior Officer, Printing Tools Developments and Support at Amret Bank. Full-Stack Web Developer building high-performance systems with Next.js, Nuxt, NestJS, and C# .NET."
            explanation="Short bio description displayed below 'lothin.dev' logo in the footer."
          />
          <AdminField
            label="Footer Copyright Text"
            value={s.footerCopyright || ""}
            onChange={(v) => setS("footerCopyright", v)}
            placeholder="© 2026 Thoeun Lothin · Phnom Penh, Cambodia"
            explanation="Copyright attribution line in the footer."
          />
          <AdminField
            label="Footer Availability Note"
            value={s.footerNote || ""}
            onChange={(v) => setS("footerNote", v)}
            placeholder="Available for select enterprise consulting & architecture advisory"
            explanation="Optional availability badge in the footer."
          />
        </div>
      </div>
    );
  };

  const tabContent: Record<Tab, React.ReactNode> = {
    profile: renderProfileTab(),
    experience: renderExperienceTab(),
    skills: renderSkillsTab(),
    education: renderEducationTab(),
    references: renderReferencesTab(),
    navigation: renderNavigationTab(),
    typography: renderTypographyTab(),
    colors: renderColorsTab(),
    home: renderHomeTab(),
    about: renderAboutTab(),
    portfolio: renderPortfolioTab(),
    services: renderServicesTab(),
    contact: renderContactTab(),
    articles: renderArticlesTab(),
    documents: renderDocumentsTab(),
    storage: renderStorageTab(),
    vectorize: renderVectorizeTab(),
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
              href="/dashboard"
              className="text-[12px] text-muted hover:text-ink border border-rule rounded px-3 py-1.5 transition-colors no-underline inline-flex items-center gap-1.5"
            >
              <Globe size={12} /> Cloudflare
            </a>
            <a
              href="/cv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-muted hover:text-ink border border-rule rounded px-3 py-1.5 transition-colors no-underline inline-flex items-center"
            >
              View HTML
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
                className="w-full font-mono text-[10.5px] tracking-[2px] uppercase py-2 px-3 text-left font-bold text-ink flex items-center justify-between hover:bg-tag-bg/50 rounded transition-colors cursor-pointer border-none bg-transparent"
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

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg/65 backdrop-blur-md animate-alert-fade-in">
          <div className="bg-surface border border-rule/80 max-w-sm w-full rounded-xl p-6 shadow-2xl relative overflow-hidden animate-alert-zoom-in">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1.5 w-full">
                <h3 className="font-mono text-xs uppercase tracking-[2px] text-ink font-semibold">
                  {confirmModal.title}
                </h3>
                <p className="text-[12.5px] text-ink2 leading-relaxed font-sans font-light">
                  {confirmModal.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="py-2 px-4 border border-rule hover:border-ink/30 rounded text-xs font-mono tracking-wide transition-all duration-200 cursor-pointer bg-transparent text-muted hover:text-ink hover:bg-tag-bg/20 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (confirmModal.onConfirm) {
                      await confirmModal.onConfirm();
                    }
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="py-2 px-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white hover:text-white text-xs font-mono rounded tracking-wide transition-all duration-200 cursor-pointer border-none shadow-[0_2px_8px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] uppercase"
                >
                  {confirmModal.confirmLabel || "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
