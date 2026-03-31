"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRightIcon,
  BotIcon,
  BriefcaseIcon,
  CheckIcon,
  DocumentIcon,
  HomeIcon,
  LocationIcon,
  LogoutIcon,
  RocketIcon,
  SettingsIcon,
  SparklesIcon,
} from "@/components/icons/Icons";
const navItems = [
  { href: "/jobready/app", label: "Overview", icon: HomeIcon },
  { href: "/jobready/app/documents", label: "Documents", icon: DocumentIcon },
  { href: "/jobready/app/jobs", label: "Job Search", icon: BriefcaseIcon },
  { href: "/jobready/app/interview", label: "Interview", icon: BotIcon },
  { href: "/jobready/app/salary", label: "Salary", icon: LocationIcon },
  { href: "/jobready/app/pathways", label: "Pathways", icon: SparklesIcon },
  { href: "/jobready/app/settings", label: "Settings", icon: SettingsIcon },
];

function isActivePath(pathname: string, href: string) {
  return href === "/jobready/app" ? pathname === href : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
      <>
        <style>{shellStyles}</style>
        <div className="jr-shell jr-shell-loading">
          <div className="jr-loading-card">
            <div className="jr-loading-badge">JobReady Platform</div>
            <h1>Loading your workspace</h1>
            <p>Preparing documents, job targets, and career tools.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{shellStyles}</style>
      <div className="jr-shell">
        <aside className="jr-side">
          <Link href="/jobready/app" className="jr-brand">
            <span className="jr-brand-mark"><RocketIcon size={18} /></span>
            <span>
              <strong>JobReady</strong>
              <em>Career Platform</em>
            </span>
          </Link>

          <div className="jr-side-card">
            <span className="jr-side-label">Core promise</span>
            <strong>Sharper applications with less noise.</strong>
            <p>Build stronger documents, search with intent, prep better, and make every move measurable.</p>
          </div>

          <nav className="jr-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`jr-nav-link ${isActivePath(pathname, item.href) ? "jr-nav-link-active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="jr-side-metric">
            <span className="jr-side-label">Current state</span>
            <strong>{user.cvGenerated ? "Resume in place" : "Profile still needs setup"}</strong>
            <p>{user.location || "India-first job search"} · {user.email}</p>
          </div>
        </aside>

        <div className="jr-main-shell">
          <header className="jr-topbar">
            <div>
              <span className="jr-topbar-kicker">India-first career operating system</span>
              <h1>{navItems.find((item) => isActivePath(pathname, item.href))?.label || "Overview"}</h1>
            </div>
            <div className="jr-topbar-actions">
              <div className="jr-status-pill">
                <CheckIcon size={14} />
                <span>{user.cvGenerated ? "Documents ready" : "Finish onboarding"}</span>
              </div>
              <button
                className="jr-logout"
                onClick={() => {
                  logout();
                }}
              >
                <LogoutIcon size={16} />
                Sign out
              </button>
            </div>
          </header>

          <div className="jr-banner-grid">
            <div className="jr-banner-card">
              <span className="jr-side-label">Platform rule</span>
              <strong>No hidden services. No auto-apply. No pricing tricks.</strong>
              <p>Every tool in this workspace makes your next hiring move clearer before it makes it faster.</p>
            </div>
            <div className="jr-banner-card">
              <span className="jr-side-label">Fast path</span>
              <strong>Documents → Jobs → Interview → Offer</strong>
              <p>Use the route model to move across focused workspaces instead of one overloaded dashboard.</p>
            </div>
            <Link href="/jobready/app/jobs" className="jr-banner-card jr-banner-card-cta">
              <span className="jr-side-label">Next best action</span>
              <strong>{user.cvGenerated ? "Run a focused job search" : "Finish your resume baseline"}</strong>
              <span className="jr-banner-link">
                Open workspace
                <ArrowRightIcon size={15} />
              </span>
            </Link>
          </div>

          <main className="jr-page-content">{children}</main>
        </div>
      </div>
    </>
  );
}

const shellStyles = `
  .jr-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background:
      radial-gradient(circle at top left, rgba(14,165,233,0.16), transparent 28%),
      radial-gradient(circle at bottom right, rgba(16,185,129,0.12), transparent 24%),
      linear-gradient(180deg, #04111c 0%, #071827 100%);
    color: #eff6ff;
  }
  .jr-shell-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }
  .jr-loading-card {
    width: min(560px, 100%);
    border: 1px solid rgba(148, 163, 184, 0.16);
    border-radius: 28px;
    padding: 36px;
    background: rgba(7, 18, 31, 0.84);
    box-shadow: 0 32px 70px rgba(2, 8, 23, 0.36);
  }
  .jr-loading-badge,
  .jr-side-label,
  .jr-topbar-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 0.68rem;
    font-weight: 700;
    color: #93c5fd;
  }
  .jr-side {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding: 28px 24px;
    border-right: 1px solid rgba(148, 163, 184, 0.1);
    background: rgba(2, 9, 18, 0.78);
    backdrop-filter: blur(16px);
  }
  .jr-brand {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    color: #fff;
    text-decoration: none;
  }
  .jr-brand strong {
    display: block;
    font-size: 1rem;
  }
  .jr-brand em {
    display: block;
    font-style: normal;
    color: #9fb3c8;
    font-size: 0.88rem;
  }
  .jr-brand-mark {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    box-shadow: 0 18px 40px rgba(14, 165, 233, 0.24);
  }
  .jr-side-card,
  .jr-side-metric,
  .jr-banner-card {
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 24px;
    padding: 18px 18px 16px;
    background: rgba(7, 18, 31, 0.72);
  }
  .jr-side-card strong,
  .jr-side-metric strong,
  .jr-banner-card strong {
    display: block;
    margin: 12px 0 8px;
    font-size: 1.05rem;
    line-height: 1.35;
    color: #f8fbff;
  }
  .jr-side-card p,
  .jr-side-metric p,
  .jr-banner-card p {
    margin: 0;
    color: #91a4bb;
    font-size: 0.92rem;
  }
  .jr-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .jr-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    color: #b7c6d9;
    border: 1px solid transparent;
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }
  .jr-nav-link:hover,
  .jr-nav-link-active {
    color: #fff;
    background: rgba(14, 165, 233, 0.12);
    border-color: rgba(125, 211, 252, 0.2);
    transform: translateY(-1px);
  }
  .jr-main-shell {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .jr-topbar {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: flex-start;
  }
  .jr-topbar h1 {
    margin: 6px 0 0;
    font-size: clamp(2rem, 3vw, 2.7rem);
    color: #fff;
  }
  .jr-topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .jr-status-pill,
  .jr-logout {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(7, 18, 31, 0.72);
    color: #dbeafe;
    font-weight: 600;
  }
  .jr-logout {
    cursor: pointer;
  }
  .jr-banner-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .jr-banner-card-cta {
    color: inherit;
    text-decoration: none;
  }
  .jr-banner-link {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #7dd3fc;
    font-weight: 700;
  }
  .jr-page-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  @media (max-width: 1080px) {
    .jr-shell {
      grid-template-columns: 1fr;
    }
    .jr-side {
      border-right: none;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .jr-banner-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 760px) {
    .jr-main-shell,
    .jr-side {
      padding: 20px;
    }
    .jr-topbar {
      flex-direction: column;
    }
    .jr-topbar-actions {
      width: 100%;
      flex-wrap: wrap;
    }
    .jr-status-pill,
    .jr-logout {
      width: 100%;
      justify-content: center;
    }
  }
`;
