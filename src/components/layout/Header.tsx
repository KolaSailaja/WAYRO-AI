"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileSidebar } from "./Sidebar";
import { useAppState } from "@/components/app/AppStateProvider";
import { LogoutButton } from "./LogoutButton";

/* Map route to page title + subtitle */
const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":     { title: "Overview",          subtitle: "Your opportunity workspace" },
  "/opportunities": { title: "Opportunities",     subtitle: "Discover internships, hackathons, scholarships, and more" },
  "/readiness":     { title: "Readiness",         subtitle: "Assess your preparation for target opportunities" },
  "/learn":         { title: "Learning Roadmap",  subtitle: "Build the skills to reach your goals" },
  "/hackathon-lab": { title: "Hackathon Lab",     subtitle: "Research problems and develop winning ideas" },
  "/progress":      { title: "My Progress",       subtitle: "Track your skills, tasks, and applications" },
  "/profile":       { title: "Profile",           subtitle: "Manage your education, skills, and goals" },
  "/settings":      { title: "Settings",          subtitle: "Preferences and account configuration" },
  "/journey":       { title: "Student Journey",   subtitle: "Discover → Assess → Learn → Build → Apply → Achieve" },
};

function getPageMeta(pathname: string) {
  // exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // prefix match for nested routes
  const match = Object.keys(PAGE_META)
    .filter((k) => pathname.startsWith(k) && k !== "/")
    .sort((a, b) => b.length - a.length)[0];
  return PAGE_META[match] ?? { title: "WAYRO AI", subtitle: "Find Your Way. Make It Happen." };
}

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const { reminders, state } = useAppState();

  return (
    <>
      <header
        className="flex items-center gap-4 px-6 bg-white border-b border-slate-100 flex-shrink-0"
        style={{ height: "var(--header-height)" }}
      >
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-btn"
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <h1 className="page-title truncate">{meta.title}</h1>
          <p className="page-subtitle hidden sm:block truncate">{meta.subtitle}</p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search — entry point */}
          <Link
            href="/opportunities"
            aria-label="Search opportunities"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm hover:bg-slate-100 hover:text-slate-600 transition-colors"
            style={{ minWidth: 200 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>Search opportunities…</span>
          </Link>

          <Link
            href="/settings"
            id="notifications-btn"
            aria-label={
              reminders.length
                ? `${reminders.length} in-app deadline reminder(s)`
                : "In-app reminders"
            }
            title={
              reminders.length
                ? reminders.map((r) => `${r.title} · ${r.daysLeft}d`).join(", ")
                : "No upcoming tracked deadlines"
            }
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {reminders.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" aria-hidden="true" />
            )}
          </Link>

          <Link
            href="/profile"
            id="profile-menu-btn"
            aria-label="Your profile"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {(state.profile.name.trim()[0] ?? "S").toUpperCase()}
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
