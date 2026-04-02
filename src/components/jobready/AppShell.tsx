"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import {
  ClipboardIcon,
  DocumentIcon,
  HomeIcon,
  LogoutIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
} from "@/components/icons/Icons";
import { Copilot } from "@/components/jobready/copilot";
import "@/app/jobready/jobready.css";

const navItems = [
  {
    href: "/jobready/app",
    label: "Home",
    caption: "Progress and next steps",
    icon: HomeIcon,
  },
  {
    href: "/jobready/app/documents",
    label: "Resume",
    caption: "Build and improve",
    icon: DocumentIcon,
  },
  {
    href: "/jobready/app/jobs",
    label: "Jobs",
    caption: "Search and shortlist",
    icon: SearchIcon,
  },
  {
    href: "/jobready/app/applications",
    label: "Applications",
    caption: "Track every stage",
    icon: ClipboardIcon,
  },
];

const pageMeta = [
  {
    match: "/jobready/app/onboarding",
    eyebrow: "Workspace setup",
    title: "Personalize JobReady",
    description: "Answer a few quick questions so the workspace can guide you to the right first action.",
  },
  {
    match: "/jobready/app/documents",
    eyebrow: "Resume studio",
    title: "Resume",
    description: "Create one polished, ATS-ready source of truth and refine it with AI where it actually helps.",
  },
  {
    match: "/jobready/app/jobs",
    eyebrow: "Role discovery",
    title: "Jobs",
    description: "Search ranked opportunities, review fit signals, and save the roles that deserve attention.",
  },
  {
    match: "/jobready/app/applications",
    eyebrow: "Pipeline tracking",
    title: "Applications",
    description: "Move each role from saved to offer with a clean board that keeps follow-ups visible.",
  },
  {
    match: "/jobready/app/settings",
    eyebrow: "Account controls",
    title: "Settings",
    description: "Manage your profile, security, and workspace details from one place.",
  },
  {
    match: "/jobready/app",
    eyebrow: "Career workspace",
    title: "Home",
    description: "See resume readiness, job momentum, and the clearest next step without digging through the product.",
  },
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

  const page = pageMeta.find((item) =>
    item.match === "/jobready/app" ? pathname === item.match : pathname.startsWith(item.match)
  ) || pageMeta[pageMeta.length - 1];

  const workspaceState = user.cvGenerated
    ? {
        label: "Resume ready",
        tone: "green",
        detail: "Your profile can now power search and matching.",
      }
    : {
        label: "Setup in progress",
        tone: "yellow",
        detail: "Add your resume details to unlock stronger matches.",
      };

  return (
    <div className={`jr-app jr-layout ${sidebarOpen ? "jr-sidebar-open" : ""}`}>
      {sidebarOpen && (
        <div className="jr-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className="jr-sidebar">
        <div className="jr-sidebar-panel">
        <Link href="/jobready/app" className="jr-sidebar-logo">
          <div className="jr-sidebar-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26H22L17.55 12.5L20.09 18.5H12" />
            </svg>
          </div>
          <div className="jr-sidebar-logo-copy">
            <span className="jr-sidebar-logo-text">JobReady</span>
            <span className="jr-sidebar-logo-subtext">Career workspace</span>
          </div>
        </Link>

        <div className="jr-sidebar-overview">
          <span className="jr-badge jr-badge-blue">From resume to offer</span>
          <h2>One calm system for every career move.</h2>
          <p>Build your profile, review roles, and keep the pipeline moving without losing context.</p>
        </div>

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
                <div className="jr-sidebar-link-copy">
                  <span>{item.label}</span>
                  <small>{item.caption}</small>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="jr-sidebar-secondary">
          <Link
            href="/jobready/app/settings"
            className={`jr-sidebar-link ${pathname.startsWith("/jobready/app/settings") ? "jr-sidebar-link-active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <SettingsIcon size={18} />
            <div className="jr-sidebar-link-copy">
              <span>Settings</span>
              <small>Profile and security</small>
            </div>
          </Link>
        </div>

        <div className="jr-sidebar-footer">
          <Link href="/jobready/app/settings" className="jr-sidebar-user">
            <div className="jr-sidebar-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="jr-sidebar-user-info">
              <div className="jr-sidebar-user-name">{user.name || "User"}</div>
              <div className="jr-sidebar-user-email">{user.email}</div>
            </div>
          </Link>
          <button
            className="jr-btn jr-btn-ghost jr-btn-sm jr-sidebar-signout"
            onClick={() => logout()}
          >
            <LogoutIcon size={16} />
            <span>Sign out</span>
          </button>
        </div>
        </div>
      </aside>

      <div className="jr-content">
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
          <div className="jr-mobile-header-copy">
            <span className="jr-mobile-header-eyebrow">JobReady</span>
            <h1 className="jr-mobile-header-title">{page.title}</h1>
          </div>
          <Link href="/jobready/app/settings" className="jr-mobile-profile" aria-label="Open settings">
            <div className="jr-sidebar-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </Link>
        </div>

        <header className="jr-topbar">
          <div className="jr-topbar-copy">
            <span className="jr-topbar-eyebrow">{page.eyebrow}</span>
            <h1 className="jr-topbar-title">{page.title}</h1>
            <p className="jr-topbar-description">{page.description}</p>
          </div>
          <div className="jr-topbar-actions">
            <div className="jr-topbar-status">
              <span className={`jr-badge jr-badge-${workspaceState.tone}`}>
                {workspaceState.label}
              </span>
              <small>{workspaceState.detail}</small>
            </div>
            <Link href="/jobready/app/settings" className="jr-topbar-profile">
              <div className="jr-sidebar-avatar">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="jr-topbar-profile-copy">
                <strong>{user.name?.split(" ")[0] || "User"}</strong>
                <span>Workspace settings</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="jr-page">
          {children}
        </main>
      </div>

      <nav className="jr-mobile-tabs" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`jr-mobile-tab ${isActive ? "jr-mobile-tab-active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          className="jr-mobile-tab jr-mobile-tab-assistant"
          type="button"
          onClick={() => {
            const event = new CustomEvent("jobready:open-copilot");
            window.dispatchEvent(event);
          }}
        >
          <SparklesIcon size={18} />
          <span>Assist</span>
        </button>
      </nav>

      <div className="jr-desktop-actions-rail">
        <button
          className="jr-floating-assist"
          type="button"
          onClick={() => {
            const event = new CustomEvent("jobready:open-copilot");
            window.dispatchEvent(event);
          }}
        >
          <SparklesIcon size={18} />
          <span>AI assistant</span>
        </button>
      </div>

      <Copilot />
    </div>
  );
}
