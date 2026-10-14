import { DesktopSidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/Header";
import { AppStateProvider } from "@/components/app/AppStateProvider";
import type { ReactNode } from "react";

/**
 * AppShell wraps application pages with sidebar, header, and demo state.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <div className="app-shell">
        <DesktopSidebar />
        <div className="main-content">
          <AppHeader />
          <main id="main-content" className="page-content">
            {children}
          </main>
        </div>
      </div>
    </AppStateProvider>
  );
}
