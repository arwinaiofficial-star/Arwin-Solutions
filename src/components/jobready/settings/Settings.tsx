"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/client";
import { CheckIcon, SettingsIcon, UserIcon } from "@/components/icons/Icons";
import "@/app/jobready/jobready.css";

type Message = { type: "success" | "error"; text: string } | null;

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileMsg, setProfileMsg] = useState<Message>(null);
  const [passwordMsg, setPasswordMsg] = useState<Message>(null);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMsg(null);
    const res = await authApi.updateProfile({
      name: profile.name,
      phone: profile.phone,
      location: profile.location,
    });
    if (res.error) {
      setProfileMsg({ type: "error", text: res.error });
    } else {
      setProfileMsg({ type: "success", text: "Profile updated." });
      if (refreshUser) {
        await refreshUser();
      }
    }
    setSaving(false);
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
    setSaving(true);
    const res = await authApi.changePassword(passwords.current, passwords.new);
    if (res.error) {
      setPasswordMsg({ type: "error", text: res.error });
    } else {
      setPasswordMsg({ type: "success", text: "Password changed." });
      setPasswords({ current: "", new: "", confirm: "" });
    }
    setSaving(false);
  };

  return (
    <div className="jr-settings">
      <section className="jr-page-hero jr-settings-hero">
        <div className="jr-page-hero-copy">
          <span className="jr-page-eyebrow">Workspace controls</span>
          <h2>Manage the details behind your workspace.</h2>
          <p>Keep profile information current, secure your account, and make sure your resume starts from the right base data.</p>
        </div>
        <div className="jr-page-hero-aside">
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <UserIcon size={16} />
            </div>
            <div>
              <strong>{user?.name || "Profile"}</strong>
              <span>{user?.email || "No email available"}</span>
            </div>
          </div>
          <div className="jr-mini-metric">
            <div className="jr-mini-metric-icon">
              <CheckIcon size={16} />
            </div>
            <div>
              <strong>{user?.cvGenerated ? "Resume available" : "Resume not created yet"}</strong>
              <span>{user?.createdAt ? `Member since ${new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}` : "Account details available once synced."}</span>
            </div>
          </div>
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
              <p>This information pre-fills your resume and keeps the workspace consistent.</p>
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Email</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>

          <div className="jr-settings-row">
            <div className="jr-settings-field">
              <label>Full name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="jr-settings-field">
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 ..."
              />
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
            />
          </div>

          <div className="jr-settings-actions">
            <button
              className="jr-btn jr-btn-primary"
              onClick={handleProfileSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>

          {profileMsg && (
            <div className={`jr-settings-message ${profileMsg.type}`}>
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
              <p>Update your password and keep the workspace protected.</p>
            </div>
          </div>

          <div className="jr-settings-field">
            <label>Current password</label>
            <input
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
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="jr-settings-field">
              <label>Confirm new password</label>
              <input
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
              disabled={saving || !passwords.current || !passwords.new}
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>

          {passwordMsg && (
            <div className={`jr-settings-message ${passwordMsg.type}`}>
              {passwordMsg.text}
            </div>
          )}
        </section>

        <section className="jr-settings-section">
          <div className="jr-settings-section-head">
            <div className="jr-settings-section-icon">
              <UserIcon size={18} />
            </div>
            <div>
              <h2>Account details</h2>
              <p>Reference information tied to your JobReady membership.</p>
            </div>
          </div>

          <div className="jr-settings-readonly-list">
            <div className="jr-settings-readonly-item">
              <span>Member since</span>
              <strong>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unavailable"}
              </strong>
            </div>
            <div className="jr-settings-readonly-item">
              <span>Resume status</span>
              <strong>{user?.cvGenerated ? "Created" : "Not started"}</strong>
            </div>
            <div className="jr-settings-readonly-item">
              <span>Workspace email</span>
              <strong>{user?.email || "Unavailable"}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
