"use client";

import { useState, useRef } from "react";
import {
  X, Plus, Trash2, Save, Upload, RefreshCw, KeyRound, Check,
} from "lucide-react";
import type { CVData, Experience, Education, SkillGroup, Reference } from "@/types/cv";
import { useCVData } from "@/hooks/useCVData";

interface Props { onClose: () => void; }

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

// ── Tab definitions ───────────────────────────────────────────────────────────
type Tab = "profile" | "experience" | "skills" | "education" | "references" | "password";
const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "references", label: "References" },
  { id: "password", label: "Password" },
];

// ── Main modal ────────────────────────────────────────────────────────────────
export function AdminEditModal({ onClose }: Props) {
  const { cv, updateCV, setAdmin } = useCVData();

  // Deep clone for editing
  const [draft, setDraft] = useState<CVData>(JSON.parse(JSON.stringify(cv)));
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwHash, setPwHash] = useState("");

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
    onClose();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/cv/upload-photo", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        setDraft((d) => ({ ...d, profile: { ...d.profile, photoUrl: json.url! } }));
      } else {
        alert(json.error ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwHash("");
    if (newPw !== confirmPw) { setPwMsg("Passwords don't match"); return; }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const json = await res.json() as { ok?: boolean; newHash?: string; error?: string; message?: string };
      if (json.ok && json.newHash) {
        setPwHash(json.newHash);
        setPwMsg(json.message ?? "Copy the hash below into your ADMIN_PASSWORD_HASH env var");
        setCurPw(""); setNewPw(""); setConfirmPw("");
      } else {
        setPwMsg(json.error ?? "Failed");
      }
    } catch {
      setPwMsg("Network error");
    }
  }

  // ── Profile Tab ──
  const ProfileTab = () => (
    <div className="space-y-4">
      <SectionHeading>Identity</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
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

      <SectionHeading>Photo</SectionHeading>
      <div className="flex items-center gap-3">
        {draft.profile.photoUrl && (
          <img src={draft.profile.photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-rule" />
        )}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors disabled:opacity-50"
          >
            {uploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          {draft.profile.photoUrl && (
            <button
              onClick={() => setDraft(d => ({ ...d, profile: { ...d.profile, photoUrl: "" } }))}
              className="text-[11px] text-muted hover:text-red-500 transition-colors text-left"
            >
              Remove photo
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>

      <SectionHeading>Languages</SectionHeading>
      {draft.profile.languages.map((lang, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            <Field label="Language" value={lang.name}
              onChange={(v) => setDraft(d => { const l = [...d.profile.languages]; l[i] = { ...l[i], name: v }; return { ...d, profile: { ...d.profile, languages: l } }; })} />
          </div>
          <div className="flex-1">
            <Field label="Level" value={lang.level}
              onChange={(v) => setDraft(d => { const l = [...d.profile.languages]; l[i] = { ...l[i], level: v }; return { ...d, profile: { ...d.profile, languages: l } }; })} />
          </div>
          <button onClick={() => setDraft(d => { const l = d.profile.languages.filter((_, j) => j !== i); return { ...d, profile: { ...d.profile, languages: l } }; })}
            className="pb-1 text-muted hover:text-red-500 transition-colors">
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
  );

  // ── Experience Tab ──
  const ExperienceTab = () => (
    <div className="space-y-6">
      {draft.experiences.map((exp, i) => (
        <div key={exp.id} className="border border-rule rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Experience #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <div key={bi} className="flex gap-2 mb-1.5 items-start">
                <textarea value={b} rows={2}
                  onChange={(e) => setDraft(d => { const ex = [...d.experiences]; const bls = [...ex[i].bullets]; bls[bi] = e.target.value; ex[i] = { ...ex[i], bullets: bls }; return { ...d, experiences: ex }; })}
                  className="flex-1 px-2.5 py-1.5 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors resize-none" />
                <button onClick={() => setDraft(d => { const ex = [...d.experiences]; ex[i] = { ...ex[i], bullets: ex[i].bullets.filter((_, j) => j !== bi) }; return { ...d, experiences: ex }; })}
                  className="mt-1 text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
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
        </div>
      ))}
      <button
        onClick={() => setDraft(d => ({ ...d, experiences: [...d.experiences, { id: `exp-${Date.now()}`, title: "", company: "", location: "", period: "", bullets: [""], tags: [] }] }))}
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors"
      >
        <Plus size={13} /> Add experience
      </button>
    </div>
  );

  // ── Skills Tab ──
  const SkillsTab = () => (
    <div className="space-y-5">
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
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors"
      >
        <Plus size={13} /> Add skill group
      </button>
    </div>
  );

  // ── Education Tab ──
  const EducationTab = () => (
    <div className="space-y-5">
      {draft.educations.map((edu, i) => (
        <div key={edu.id} className="border border-rule rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Education #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, educations: d.educations.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors"
      >
        <Plus size={13} /> Add education
      </button>
    </div>
  );

  // ── References Tab ──
  const ReferencesTab = () => (
    <div className="space-y-4">
      {draft.references.map((ref, i) => (
        <div key={i} className="border border-rule rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">Reference #{i + 1}</p>
            <button onClick={() => setDraft(d => ({ ...d, references: d.references.filter((_, j) => j !== i) }))}
              className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
        className="inline-flex items-center gap-1.5 px-3 py-2 border border-rule rounded text-[12px] text-ink hover:bg-tag-bg transition-colors"
      >
        <Plus size={13} /> Add reference
      </button>
    </div>
  );

  // ── Password Tab ──
  const PasswordTab = () => (
    <div className="space-y-4 max-w-sm">
      <SectionHeading>Change Password</SectionHeading>
      <form onSubmit={handleChangePw} className="space-y-3">
        {[
          { label: "Current password", val: curPw, set: setCurPw },
          { label: "New password (min 8 chars)", val: newPw, set: setNewPw },
          { label: "Confirm new password", val: confirmPw, set: setConfirmPw },
        ].map(({ label, val, set }) => (
          <div key={label} className="space-y-1">
            <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted">{label}</label>
            <input type="password" value={val} onChange={(e) => set(e.target.value)}
              className="w-full px-2.5 py-2 border border-rule rounded text-[13px] text-ink bg-bg focus:outline-none focus:border-accent transition-colors" />
          </div>
        ))}
        <button type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-white text-[13px] font-medium rounded hover:bg-accent transition-colors">
          <KeyRound size={13} /> Change password
        </button>
      </form>
      {pwMsg && <p className="font-mono text-[11px] text-muted leading-[1.6]">{pwMsg}</p>}
      {pwHash && (
        <div className="mt-2 p-3 bg-tag-bg border border-rule rounded">
          <p className="font-mono text-[10px] text-accent mb-1 tracking-wide">New ADMIN_PASSWORD_HASH — copy to your env:</p>
          <code className="block text-[11px] text-ink break-all select-all">{pwHash}</code>
        </div>
      )}
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    experience: <ExperienceTab />,
    skills: <SkillsTab />,
    education: <EducationTab />,
    references: <ReferencesTab />,
    password: <PasswordTab />,
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface border border-rule rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule shrink-0">
          <div>
            <p className="text-[14px] font-semibold text-ink">Edit CV</p>
            <p className="font-mono text-[10px] text-muted tracking-wide">Admin mode</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout}
              className="text-[12px] text-muted hover:text-ink border border-rule rounded px-2.5 py-1 transition-colors">
              Logout
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-[12px] font-medium rounded hover:bg-accent transition-colors disabled:opacity-50">
              {saving ? <RefreshCw size={12} className="animate-spin" /> : saveMsg === "Saved!" ? <Check size={12} /> : <Save size={12} />}
              {saving ? "Saving…" : saveMsg || "Save"}
            </button>
            <button onClick={onClose} className="text-muted hover:text-ink transition-colors ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-rule px-5 overflow-x-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[11px] tracking-[1px] uppercase py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
