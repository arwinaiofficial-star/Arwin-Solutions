"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import {
  BriefcaseIcon,
  ClipboardIcon,
  DocumentIcon,
  HomeIcon,
  LogoutIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/icons/Icons";
import { Copilot } from "@/components/jobready/copilot";
import "@/app/jobready/jobready.css";

const navItems = [
  { href: "/jobready/app", label: "Home", icon: HomeIcon },
  { href: "/jobready/app/documents", label: "Resume", icon: DocumentIcon },
  { href: "/jobready/app/jobs", label: "Jobs", icon: SearchIcon },
  { href: "/jobready/app/applications", label: "Applications", icon: ClipboardIcon },
];

function isActivePath(pathname: string, href: string) {
  return href === "/jobready/app" ? pathname === href : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    trackEvent("jobready_app_view", { pathname });
  }, [pathname, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/jobready/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="jr-app">
        <div className="jr-empty">
          <div className="jr-empty-icon" />
          <h2 className="jr-empty-title">Loading your workspace</h2>
          <p className="jr-empty-text">Preparing your documents, job targets, and career tools.</p>
        </div>
      </div>
    );
  }

  const currentPageLabel = navItems.find((item) => isActivePath(pathname, item.href))?.label || "Home";
  const pageTitle = currentPageLabel;

  return (
    <div className={`jr-app jr-layout ${sidebarOpen ? "jr-sidebar-open" : ""}`}>
      {/* Mobile Header */}
      <div className="jr-mobile-header">
        <button
          className="jr-mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="jr-topbar-title">{pageTitle}</h1>
        <div style={{ width: "36px" }} />
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="jr-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className="jr-sidebar">
        <Link href="/jobready/app" className="jr-sidebar-logo">
          <div className="jr-sidebar-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26H22L17.55 12.5L20.09 18.5H12" />
            </svg>
          </div>
          <span className="jr-sidebar-logo-text">JobReady</span>
        </Link>

        <nav className="jr-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`jr-sidebar-link ${isActive ? "jr-sidebar-link-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/jobready/app/settings"
          className={`jr-sidebar-link ${pathname.startsWith("/jobready/app/settings") ? "jr-sidebar-link-active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        >
          <SettingsIcon size={18} />
          <span>Settings</span>
        </Link>

        <div className="jr-sidebar-footer">
          <div className="jr-sidebar-user">
            <div className="jr-sidebar-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="jr-sidebar-user-info">
              <div className="jr-sidebar-user-name">{user.name || "User"}</div>
              <div className="jr-sidebar-user-email">{user.email}</div>
            </div>
          </div>
          <button
            className="jr-btn jr-btn-ghost jr-btn-sm"
            style={{ marginTop: "12px", width: "100%" }}
            onClick={() => logout()}
          >
            <LogoutIcon size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="jr-content">
        <header className="jr-topbar">
          <h1 className="jr-topbar-title">{pageTitle}</h1>
          <div className="jr-topbar-actions">
            <span className="jr-badge jr-badge-blue">
              {user.cvGenerated ? "Ready" : "Setup needed"}
            </span>
          </div>
        </header>

        <main className="jr-page">
          {children}
        </main>
      </div>

      {/* AI Copilot — available on every page */}
      <Copilot />
    </div>
  );
}
