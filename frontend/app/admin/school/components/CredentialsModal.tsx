"use client";

import { useState } from "react";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "school" | "student";
  data: {
    name: string;
    email?: string;
    username?: string;
    password: string;
  };
}

export default function CredentialsModal({ isOpen, onClose, type, data }: CredentialsModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 animate-fade-in"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {type === "school" ? "School Credentials" : "Student Credentials"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <svg className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: "var(--muted)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {data.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>{data.name}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {type === "school" ? "School Account" : "Student Account"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {data.email && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.email}
                  readOnly
                  className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                />
                <button
                  onClick={() => copyToClipboard(data.email!, "email")}
                  className="p-2.5 rounded-xl transition-colors hover:bg-[var(--muted)]"
                  style={{ color: copied === "email" ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {copied === "email" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {data.username && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                Username
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={data.username}
                  readOnly
                  className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}
                />
                <button
                  onClick={() => copyToClipboard(data.username!, "username")}
                  className="p-2.5 rounded-xl transition-colors hover:bg-[var(--muted)]"
                  style={{ color: copied === "username" ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {copied === "username" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={data.password}
                readOnly
                className="flex-1 px-4 py-2.5 rounded-xl font-mono text-sm"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
              <button
                onClick={() => copyToClipboard(data.password, "password")}
                className="p-2.5 rounded-xl transition-colors hover:bg-[var(--muted)]"
                style={{ color: copied === "password" ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {copied === "password" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-yellow-600">
              Please save these credentials securely. The password should be changed after first login.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}






