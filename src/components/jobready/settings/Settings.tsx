"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/client";
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
      if (refreshUser) refreshUser();
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (passwords.new !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords don't match." });
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
      {/* Profile Section */}
      <div className="jr-settings-section">
        <h2>Profile</h2>
        <div className="jr-settings-field">
          <label>Email</label>
          <input type="email" value={user?.email || ""} disabled />
        </div>
        <div className="jr-settings-row">
          <div className="jr-settings-field">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="jr-settings-field">
            <label>Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 ..."
            />
          </div>
        </div>
        <div className="jr-settings-field">
          <label>Location</label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
            placeholder="City, Country"
          />
        </div>
        <div className="jr-settings-actions">
          <button
            className="jr-btn jr-btn-primary jr-btn-sm"
            onClick={handleProfileSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {profileMsg && (
          <div className={`jr-settings-message ${profileMsg.type}`}>
            {profileMsg.text}
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="jr-settings-section">
        <h2>Change Password</h2>
        <div className="jr-settings-field">
          <label>Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            placeholder="Enter current password"
          />
        </div>
        <div className="jr-settings-row">
          <div className="jr-settings-field">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="jr-settings-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Confirm password"
            />
          </div>
        </div>
        <div className="jr-settings-actions">
          <button
            className="jr-btn jr-btn-secondary jr-btn-sm"
            onClick={handlePasswordChange}
            disabled={saving || !passwords.current || !passwords.new}
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
        {passwordMsg && (
          <div className={`jr-settings-message ${passwordMsg.type}`}>
            {passwordMsg.text}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="jr-settings-section">
        <h2>Account</h2>
        <div className="jr-settings-field">
          <label>Member Since</label>
          <input
            type="text"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
            disabled
          />
        </div>
      </div>
    </div>
  );
}
