"use client";

import { TutorWithCredentials } from "../types";

interface TutorCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: TutorWithCredentials | null;
}

export default function TutorCredentialsModal({ isOpen, onClose, tutor }: TutorCredentialsModalProps) {
  if (!isOpen || !tutor) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-[var(--card)] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Tutor Created!</h2>
          <p className="text-[var(--muted)] mt-2">
            {tutor.first_name} {tutor.middle_name} {tutor.last_name}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Auto-Generated Email</label>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[var(--foreground)] font-mono text-sm break-all">{tutor.generated_email}</span>
              <button 
                onClick={() => copyToClipboard(tutor.generated_email, "Email")}
                className="ml-2 p-2 hover:bg-[var(--accent)] rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Auto-Generated Password</label>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[var(--foreground)] font-mono text-sm">{tutor.generated_password}</span>
              <button 
                onClick={() => copyToClipboard(tutor.generated_password, "Password")}
                className="ml-2 p-2 hover:bg-[var(--accent)] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Please save these credentials securely. The password cannot be recovered once this dialog is closed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Done
        </button>
      </div>
    </div>
  );
}






