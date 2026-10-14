import type { ReactNode } from "react";

/* ── EmptyState ───────────────────────────────────────────────────────────── */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div
          className="mb-4 flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── LoadingState ─────────────────────────────────────────────────────────── */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
      <div
        className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-500"
        style={{ animation: "spin 0.8s linear infinite" }}
        aria-hidden="true"
      />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

/* ── ErrorState ───────────────────────────────────────────────────────────── */
export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      role="alert"
    >
      <div
        className="mb-4 flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{ background: "var(--danger-50)", color: "var(--danger-500)" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
      )}
      {retry && (
        <button onClick={retry} className="btn btn-secondary btn-sm mt-5">
          Try again
        </button>
      )}
    </div>
  );
}

/* ── SkillBadge ───────────────────────────────────────────────────────────── */
type BadgeVariant = "brand" | "success" | "warning" | "danger" | "gray";

interface SkillBadgeProps {
  label: string;
  variant?: BadgeVariant;
  onRemove?: () => void;
}

export function SkillBadge({ label, variant = "brand", onRemove }: SkillBadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-1 -mr-1 opacity-60 hover:opacity-100 transition-opacity"
          style={{ lineHeight: 1 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

/* ── PageHeading ─────────────────────────────────────────────────────────── */
interface PageHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeading({ title, subtitle, action }: PageHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ── SectionCard ──────────────────────────────────────────────────────────── */
interface SectionCardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function SectionCard({ children, className = "", padding = true }: SectionCardProps) {
  return (
    <div className={`card ${padding ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── DeadlineItem ─────────────────────────────────────────────────────────── */
interface DeadlineItemProps {
  title: string;
  organization: string;
  deadline: string;
  daysLeft: number;
  href: string;
}

export function DeadlineItem({ title, organization, deadline, daysLeft, href }: DeadlineItemProps) {
  const urgency = daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "gray";
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-4 py-3 px-1 rounded-lg hover:bg-slate-50 transition-colors group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-indigo-600 transition-colors" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
          {organization}
        </p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0 gap-1">
        <SkillBadge label={daysLeft <= 0 ? "Closed" : `${daysLeft}d left`} variant={urgency} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{deadline}</span>
      </div>
    </a>
  );
}

/* ── LearningStep ─────────────────────────────────────────────────────────── */
interface LearningStepProps {
  step: number;
  skill: string;
  resource: string;
  provider: string;
  status: "completed" | "in_progress" | "upcoming";
}

export function LearningStep({ step, skill, resource, provider, status }: LearningStepProps) {
  const dotStyle = {
    completed: "bg-green-500 border-green-500",
    in_progress: "bg-indigo-500 border-indigo-500",
    upcoming: "bg-white border-slate-300",
  }[status];

  const statusLabel = { completed: "Done", in_progress: "In progress", upcoming: "Upcoming" }[status];

  return (
    <div className="flex gap-4">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${dotStyle}`}
          style={{ color: status === "upcoming" ? "var(--text-muted)" : "white" }}
        >
          {status === "completed" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : step}
        </div>
      </div>
      {/* Content */}
      <div className="pb-5 min-w-0">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{skill}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{resource} · {provider}</p>
        <span className={`badge badge-${status === "completed" ? "success" : status === "in_progress" ? "brand" : "gray"} mt-2`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

/* ── ProfileCompletion ────────────────────────────────────────────────────── */
interface ProfileCompletionItem {
  label: string;
  completed: boolean;
}

interface ProfileCompletionProps {
  items: ProfileCompletionItem[];
  percentage: number;
}

export function ProfileCompletion({ items, percentage }: ProfileCompletionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profile completion</p>
        <span className="text-sm font-bold" style={{ color: "var(--brand-600)" }}>{percentage}%</span>
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success-500)", flexShrink: 0 }} aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }} aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
              </svg>
            )}
            <span style={{ color: item.completed ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── FormField ────────────────────────────────────────────────────────────── */
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ id, label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>
      )}
      {error && (
        <p className="text-xs" style={{ color: "var(--danger-500)" }} role="alert">{error}</p>
      )}
    </div>
  );
}

/* ── DemoNotice ─────────────────────────────────────────────────────────────
   Always displayed when showing demonstration/fixture data, clearly labelled.
────────────────────────────────────────────────────────────────────────────── */
export function DemoNotice({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm mb-4"
      style={{ background: "var(--warning-50)", color: "var(--warning-700)", border: "1px solid #fde68a" }}
      role="note"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

/* ── ComingSoon ───────────────────────────────────────────────────────────── */
export function ComingSoon({ feature }: { feature: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}
      aria-label={`${feature} – coming soon`}
      title="This feature is planned for a future release"
    >
      Coming soon
    </span>
  );
}
