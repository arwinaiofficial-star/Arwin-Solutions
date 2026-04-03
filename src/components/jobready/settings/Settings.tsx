"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/client";
import { CheckIcon, SettingsIcon } from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

type Message = { type: "success" | "error"; text: string } | null;

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: null as string | null,
    phone: null as string | null,
    location: null as string | null,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileMsg, setProfileMsg] = useState<Message>(null);
  const [passwordMsg, setPasswordMsg] = useState<Message>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const profileValues = {
    name: profile.name ?? user?.name ?? "",
    phone: profile.phone ?? user?.phone ?? "",
    location: profile.location ?? user?.location ?? "",
  };

  const profileDirty =
    profileValues.name !== (user?.name || "") ||
    profileValues.phone !== (user?.phone || "") ||
    profileValues.location !== (user?.location || "");
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Unavailable";

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await authApi.updateProfile({
      name: profileValues.name,
      phone: profileValues.phone,
      location: profileValues.location,
    });
    if (res.error) {
      setProfileMsg({ type: "error", text: res.error });
    } else {
      setProfileMsg({ type: "success", text: "Profile updated." });
      if (refreshUser) {
        await refreshUser();
      }
    }
    setProfileSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPasswordSaving(true);
    const res = await authApi.changePassword(passwords.current, passwords.new);
    if (res.error) {
      setPasswordMsg({ type: "error", text: res.error });
    } else {
      setPasswordMsg({ type: "success", text: "Password changed." });
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setPasswordSaving(false);
  };

  return (
    <div className="jr-settings">
      <section className="jr-page-hero jr-settings-hero jr-page-hero-compact">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Settings</span>
          <h2>Manage your account.</h2>
          <p>Profile details, password, and workspace status live here.</p>
        </div>
      </section>

      <section className="jr-settings-summary">
        <div className="jr-settings-summary-item">
          <span>Workspace email</span>
          <strong>{user?.email || "Unavailable"}</strong>
        </div>
        <div className="jr-settings-summary-item">
          <span>Member since</span>
          <strong>{memberSince}</strong>
        </div>
        <div className="jr-settings-summary-item">
          <span>Resume status</span>
          <strong>{user?.cvGenerated ? "Created" : "Not started"}</strong>
        </div>
      </section>

      <div className="jr-settings-grid">
        <section className="jr-settings-section jr-settings-section-featured">
          <div className="jr-settings-section-head">
            <div className="jr-settings-section-icon">
              <SettingsIcon size={18} />
            </div>
            <div>
              <h2>Profile</h2>
              <p>This information fills your resume and appears across the workspace.</p>
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Email</label>
            <input className="jr-input" type="email" value={user?.email || ""} disabled />
          </div>

          <div className="jr-settings-row">
            <div className="jr-settings-field">
              <label>Full name</label>
              <input
                className="jr-input"
                type="text"
                value={profileValues.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="jr-settings-field">
              <label>Phone</label>
              <input
                className="jr-input"
                type="tel"
                value={profileValues.phone}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 ..."
              />
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Location</label>
            <input
              className="jr-input"
              type="text"
              value={profileValues.location}
              onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
            />
          </div>

          <div className="jr-settings-actions">
            <button
              className="jr-btn jr-btn-primary"
              onClick={handleProfileSave}
              disabled={profileSaving || !profileDirty}
            >
              {profileSaving ? "Saving..." : "Save profile"}
            </button>
          </div>

          {profileMsg && (
            <div className={`jr-settings-message ${profileMsg.type}`} aria-live="polite">
              {profileMsg.text}
            </div>
          )}
        </section>

        <section className="jr-settings-section">
          <div className="jr-settings-section-head">
            <div className="jr-settings-section-icon">
              <CheckIcon size={18} />
            </div>
            <div>
              <h2>Security</h2>
              <p>Change your password for this account.</p>
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Current password</label>
            <input
              className="jr-input"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
              placeholder="Enter current password"
            />
          </div>

          <div className="jr-settings-row">
            <div className="jr-settings-field">
              <label>New password</label>
              <input
                className="jr-input"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="jr-settings-field">
              <label>Confirm new password</label>
              <input
                className="jr-input"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <div className="jr-settings-actions">
            <button
              className="jr-btn jr-btn-secondary"
              onClick={handlePasswordChange}
              disabled={passwordSaving || !passwords.current || !passwords.new}
            >
              {passwordSaving ? "Updating..." : "Update password"}
            </button>
          </div>

          {passwordMsg && (
            <div className={`jr-settings-message ${passwordMsg.type}`} aria-live="polite">
              {passwordMsg.text}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
