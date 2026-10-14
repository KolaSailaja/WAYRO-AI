"use client";

import { useState } from "react";
import { useAppState } from "@/components/app/AppStateProvider";
import { PageHeading, SectionCard, FormField, SkillBadge } from "@/components/ui";
import type { OpportunityType, SkillLevel, StudentProfile } from "@/types";

/* ── Skill level badge ───────────────────────────────────────────────────── */
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
type Level = typeof LEVELS[number];
const TYPE_VALUES: Record<string, OpportunityType> = {
  Internship: "internship",
  Job: "job",
  Hackathon: "hackathon",
  Scholarship: "scholarship",
  Fellowship: "fellowship",
  Research: "research",
  Competition: "competition",
};

/* ── Profile form state ──────────────────────────────────────────────────── */
const EMPTY_PROFILE = {
  name: "",
  institution: "",
  fieldOfStudy: "",
  graduationYear: "",
  bio: "",
  // Skills
  skills: [] as { name: string; level: Level }[],
  newSkill: "",
  newSkillLevel: "Beginner" as Level,
  projects: [] as StudentProfile["projects"],
  newProjectTitle: "",
  newProjectDescription: "",
  newProjectUrl: "",
  newProjectSkills: "",
  // Interests
  interests: [] as string[],
  newInterest: "",
  // Goals
  goals: "",
  targetRoles: "",
  preferredTypes: [] as string[],
  // Logistics
  location: "",
  remotePreference: "",
  weeklyHours: "",
  // Links
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
};

const OPPORTUNITY_TYPES = ["Internship", "Job", "Hackathon", "Scholarship", "Fellowship", "Research", "Competition"];

function profileToForm(profile: StudentProfile) {
  return {
    ...EMPTY_PROFILE,
    name: profile.name,
    institution: profile.institution,
    fieldOfStudy: profile.fieldOfStudy,
    graduationYear: profile.graduationYear?.toString() ?? "",
    bio: profile.bio,
    skills: profile.skills.map((skill) => ({
      name: skill.name,
      level: (skill.level.charAt(0).toUpperCase() + skill.level.slice(1)) as Level,
    })),
    projects: profile.projects,
    interests: profile.interests,
    goals: profile.goals,
    targetRoles: profile.targetRoles,
    preferredTypes: profile.preferredTypes.map((type) => type.charAt(0).toUpperCase() + type.slice(1)),
    location: profile.location,
    remotePreference: profile.remotePreference,
    weeklyHours: profile.weeklyHours?.toString() ?? "",
    portfolioUrl: profile.portfolioUrl,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
  };
}

export default function ProfilePage() {
  const { state, loading } = useAppState();
  if (loading) return <p role="status" className="py-12 text-center text-sm">Loading profile…</p>;
  return <ProfileEditor profile={state.profile} />;
}

function ProfileEditor({ profile }: { profile: StudentProfile }) {
  const { state, patch, error } = useAppState();
  const [form, setForm]       = useState(() => profileToForm(profile));
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  function update(field: keyof typeof EMPTY_PROFILE, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  /* Skills */
  function addSkill() {
    if (!form.newSkill.trim()) { setErrors((e) => ({ ...e, newSkill: "Enter a skill name" })); return; }
    if (form.skills.some((s) => s.name.toLowerCase() === form.newSkill.toLowerCase())) {
      setErrors((e) => ({ ...e, newSkill: "Skill already added" })); return;
    }
    update("skills", [...form.skills, { name: form.newSkill.trim(), level: form.newSkillLevel }]);
    update("newSkill", "");
  }
  function removeSkill(name: string) { update("skills", form.skills.filter((s) => s.name !== name)); }

  function addProject() {
    if (!form.newProjectTitle.trim()) {
      setErrors((current) => ({ ...current, newProjectTitle: "Project title is required" }));
      return;
    }
    if (form.newProjectUrl && !isUrl(form.newProjectUrl)) {
      setErrors((current) => ({ ...current, newProjectUrl: "Enter a valid URL" }));
      return;
    }
    const id = `project-${Date.now()}`;
    update("projects", [...form.projects, {
      id,
      title: form.newProjectTitle.trim(),
      description: form.newProjectDescription.trim(),
      url: form.newProjectUrl.trim() || undefined,
      skills: form.newProjectSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
    }]);
    update("newProjectTitle", "");
    update("newProjectDescription", "");
    update("newProjectUrl", "");
    update("newProjectSkills", "");
  }

  function removeProject(id: string) {
    update("projects", form.projects.filter((project) => project.id !== id));
  }

  /* Interests */
  function addInterest() {
    if (!form.newInterest.trim()) return;
    if (form.interests.includes(form.newInterest.trim())) return;
    update("interests", [...form.interests, form.newInterest.trim()]);
    update("newInterest", "");
  }
  function removeInterest(i: string) { update("interests", form.interests.filter((x) => x !== i)); }

  /* Preferred types */
  function toggleType(t: string) {
    update("preferredTypes", form.preferredTypes.includes(t)
      ? form.preferredTypes.filter((x) => x !== t)
      : [...form.preferredTypes, t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.graduationYear && (isNaN(Number(form.graduationYear)) || Number(form.graduationYear) < 2020 || Number(form.graduationYear) > 2035)) {
      newErrors.graduationYear = "Enter a valid graduation year (2020–2035)";
    }
    if (form.portfolioUrl && !isUrl(form.portfolioUrl)) newErrors.portfolioUrl = "Enter a valid URL";
    if (form.githubUrl && !isUrl(form.githubUrl)) newErrors.githubUrl = "Enter a valid URL";
    if (form.linkedinUrl && !isUrl(form.linkedinUrl)) newErrors.linkedinUrl = "Enter a valid URL";
    if (form.newProjectUrl && !isUrl(form.newProjectUrl)) newErrors.newProjectUrl = "Enter a valid project URL";

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setSaving(true);
    const result = await patch({
      profile: {
        name: form.name.trim(),
        institution: form.institution.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        bio: form.bio.trim(),
        skills: form.skills.map((skill, index) => ({
          id: `skill-${skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
          name: skill.name.trim(),
          category: "general",
          level: skill.level.toLowerCase() as SkillLevel,
        })),
        projects: form.projects,
        interests: form.interests,
        goals: form.goals.trim(),
        targetRoles: form.targetRoles.trim(),
        preferredTypes: form.preferredTypes.map((type) => TYPE_VALUES[type]).filter(Boolean),
        location: form.location.trim(),
        remotePreference: form.remotePreference,
        weeklyHours: form.weeklyHours ? Number(form.weeklyHours) : undefined,
        portfolioUrl: form.portfolioUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
      },
    });
    setSaving(false);
    setSaved(!result);
  }

  return (
    <div className="animate-fadein max-w-3xl mx-auto">
      <PageHeading
        title="Your Profile"
        subtitle="Education, skills, interests, and goals"
      />

      {/* Persistence notice */}
      <div
        className="rounded-lg px-4 py-3 text-sm mb-6 flex items-start gap-2"
        style={{ background: "var(--warning-50)", border: "1px solid #fde68a", color: "var(--warning-700)" }}
        role="note"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{state.persistence.label}</span>
      </div>

      {error && <p role="alert" className="text-sm text-red-700 mb-4">{error}</p>}
      {saved && (
        <div
          className="rounded-lg px-4 py-3 text-sm mb-6 flex items-start gap-2 animate-fadein"
          style={{ background: "var(--success-50)", border: "1px solid #86efac", color: "var(--success-700)" }}
          role="status"
          aria-live="polite"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Profile saved. Matching and readiness now use these details.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── Education ──────────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Education</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField id="name" label="Full name" required error={errors.name}>
              <input id="name" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
            </FormField>
            <FormField id="institution" label="Institution" hint="Your college or university">
              <input id="institution" className="input" value={form.institution} onChange={(e) => update("institution", e.target.value)} placeholder="e.g. IIT Delhi" />
            </FormField>
            <FormField id="fieldOfStudy" label="Field of study">
              <input id="fieldOfStudy" className="input" value={form.fieldOfStudy} onChange={(e) => update("fieldOfStudy", e.target.value)} placeholder="e.g. Computer Science" />
            </FormField>
            <FormField id="graduationYear" label="Graduation year" error={errors.graduationYear}>
              <input id="graduationYear" type="number" className="input" value={form.graduationYear} onChange={(e) => update("graduationYear", e.target.value)} placeholder="e.g. 2026" min={2020} max={2035} />
            </FormField>
            <FormField id="bio" label="Short bio" hint="A sentence or two about yourself">
              <textarea id="bio" className="input" rows={2} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="e.g. CS undergrad interested in AI and social impact" />
            </FormField>
          </div>
        </SectionCard>

        {/* ── Skills ─────────────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Technical & non-technical skills</h3>

          {/* Add skill */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <FormField id="newSkill" label="" error={errors.newSkill}>
                <input id="newSkill" className="input" value={form.newSkill} onChange={(e) => update("newSkill", e.target.value)} placeholder="Add a skill…"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
              </FormField>
            </div>
            <select id="skill-level" className="input" style={{ width: 150, flexShrink: 0 }} value={form.newSkillLevel}
              onChange={(e) => update("newSkillLevel", e.target.value as Level)}
              aria-label="Skill level">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <button type="button" onClick={addSkill} className="btn btn-secondary flex-shrink-0" aria-label="Add skill">Add</button>
          </div>

          {/* Skill list */}
          {form.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((s) => (
                <SkillBadge key={s.name} label={`${s.name} · ${s.level}`} variant="brand" onRemove={() => removeSkill(s.name)} />
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No skills added yet. Type a skill name and click Add.</p>
          )}
        </SectionCard>

        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Projects & experience</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField id="newProjectTitle" label="Project title" error={errors.newProjectTitle}>
              <input id="newProjectTitle" className="input" value={form.newProjectTitle} onChange={(event) => update("newProjectTitle", event.target.value)} maxLength={120} />
            </FormField>
            <FormField id="newProjectUrl" label="Project URL" error={errors.newProjectUrl}>
              <input id="newProjectUrl" type="url" className="input" value={form.newProjectUrl} onChange={(event) => update("newProjectUrl", event.target.value)} placeholder="https://…" />
            </FormField>
            <FormField id="newProjectDescription" label="Description">
              <textarea id="newProjectDescription" className="input" rows={2} value={form.newProjectDescription} onChange={(event) => update("newProjectDescription", event.target.value)} maxLength={500} />
            </FormField>
            <FormField id="newProjectSkills" label="Skills used" hint="Separate with commas">
              <input id="newProjectSkills" className="input" value={form.newProjectSkills} onChange={(event) => update("newProjectSkills", event.target.value)} />
            </FormField>
          </div>
          <button type="button" className="btn btn-secondary mt-3" onClick={addProject}>Add project</button>
          {form.projects.length > 0 && <ul className="mt-4 space-y-2">{form.projects.map((project) => <li key={project.id} className="flex justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm"><span><strong>{project.title}</strong>{project.description && <span className="block text-slate-600">{project.description}</span>}</span><button type="button" className="text-red-700" onClick={() => removeProject(project.id)} aria-label={`Remove ${project.title}`}>Remove</button></li>)}</ul>}
        </SectionCard>

        {/* ── Interests ──────────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Interests & domains</h3>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input id="newInterest" className="input" value={form.newInterest} onChange={(e) => update("newInterest", e.target.value)} placeholder="e.g. Climate tech, EdTech, AI, Open source…"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }} aria-label="Add an interest" />
            </div>
            <button type="button" onClick={addInterest} className="btn btn-secondary flex-shrink-0" aria-label="Add interest">Add</button>
          </div>
          {form.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.interests.map((i) => <SkillBadge key={i} label={i} variant="gray" onRemove={() => removeInterest(i)} />)}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No interests added yet.</p>
          )}
        </SectionCard>

        {/* ── Career goals ───────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Career goals & preferences</h3>
          <div className="space-y-4">
            <FormField id="goals" label="Career goals" hint="What do you want to achieve in the next 1–3 years?">
              <textarea id="goals" className="input" rows={2} value={form.goals} onChange={(e) => update("goals", e.target.value)} placeholder="e.g. Land a software engineering internship at a product company, publish AI research" />
            </FormField>

            <FormField id="targetRoles" label="Target roles" hint="Job titles or roles you are aiming for">
              <input id="targetRoles" className="input" value={form.targetRoles} onChange={(e) => update("targetRoles", e.target.value)} placeholder="e.g. Software Engineer, Data Scientist, Product Manager" />
            </FormField>

            <FormField id="preferredTypes" label="Preferred opportunity types">
              <div className="flex flex-wrap gap-2 pt-1">
                {OPPORTUNITY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={form.preferredTypes.includes(t)}
                    onClick={() => toggleType(t)}
                    className="badge cursor-pointer select-none transition-colors"
                    style={{
                      background: form.preferredTypes.includes(t) ? "var(--brand-100)" : "var(--bg-sunken)",
                      color: form.preferredTypes.includes(t) ? "var(--brand-700)" : "var(--text-secondary)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </SectionCard>

        {/* ── Logistics ──────────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Logistics</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormField id="location" label="Location">
              <input id="location" className="input" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Hyderabad, India" />
            </FormField>
            <FormField id="remotePreference" label="Remote preference">
              <select id="remotePreference" className="input" value={form.remotePreference} onChange={(e) => update("remotePreference", e.target.value)}>
                <option value="">No preference</option>
                <option value="remote">Remote only</option>
                <option value="hybrid">Hybrid</option>
                <option value="in-person">In-person only</option>
              </select>
            </FormField>
            <FormField id="weeklyHours" label="Available hours/week" hint="For preparation">
              <input id="weeklyHours" type="number" className="input" min={1} max={80} value={form.weeklyHours} onChange={(e) => update("weeklyHours", e.target.value)} placeholder="e.g. 10" />
            </FormField>
          </div>
        </SectionCard>

        {/* ── Links ──────────────────────────────────────────────────── */}
        <SectionCard>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Portfolio & links</h3>
          <div className="space-y-4">
            <FormField id="portfolioUrl" label="Portfolio website" error={errors.portfolioUrl}>
              <input id="portfolioUrl" type="url" className="input" value={form.portfolioUrl} onChange={(e) => update("portfolioUrl", e.target.value)} placeholder="https://yourportfolio.dev" />
            </FormField>
            <FormField id="githubUrl" label="GitHub profile" error={errors.githubUrl}>
              <input id="githubUrl" type="url" className="input" value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} placeholder="https://github.com/username" />
            </FormField>
            <FormField id="linkedinUrl" label="LinkedIn profile" error={errors.linkedinUrl}>
              <input id="linkedinUrl" type="url" className="input" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/username" />
            </FormField>
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex justify-end pb-8">
          <button type="submit" id="save-profile-btn" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function isUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}
