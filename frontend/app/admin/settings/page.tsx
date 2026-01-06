"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "COBOT LMS",
    adminEmail: "admin@cobot.com",
    timezone: "UTC",
    notifications: true,
    twoFactor: false,
    autoBackup: true,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Configure system settings and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">GMT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>
            Security & Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>Email Notifications</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Receive email notifications</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.notifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>Two-Factor Auth</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Enable 2FA for extra security</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, twoFactor: !settings.twoFactor })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.twoFactor ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.twoFactor ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <div>
                <p className="font-medium" style={{ color: "var(--foreground)" }}>Auto Backup</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Automatic daily backups</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoBackup ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoBackup ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}






