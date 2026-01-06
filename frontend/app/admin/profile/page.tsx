"use client";

import PageHeader from "@/components/admin/PageHeader";

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Profile"
        description="Manage your account settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">AD</span>
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>Admin User</h3>
          <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>Super Administrator</p>
          <button
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
            style={{
              backgroundColor: "var(--secondary)",
              color: "var(--primary)",
            }}
          >
            Change Photo
          </button>
        </div>

        {/* Profile Details */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>
            Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Admin User"
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
                Email
              </label>
              <input
                type="email"
                defaultValue="admin@cobot.com"
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
                Phone
              </label>
              <input
                type="tel"
                defaultValue="+1 234-567-8900"
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
                Role
              </label>
              <input
                type="text"
                defaultValue="Super Administrator"
                disabled
                className="w-full px-4 py-2.5 rounded-xl opacity-60"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






