"use client";

import { Tutor, TUTOR_LEVELS, GENDERS } from "../types";

interface TutorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: Tutor | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TutorDetailModal({ isOpen, onClose, tutor, onEdit, onDelete }: TutorDetailModalProps) {
  if (!isOpen || !tutor) return null;

  const levelLabel = TUTOR_LEVELS.find(l => l.value === tutor.level)?.label || tutor.level;
  const genderLabel = GENDERS.find(g => g.value === tutor.gender)?.label || tutor.gender;
  const initials = `${tutor.first_name[0]}${tutor.last_name[0]}`.toUpperCase();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[var(--card)] rounded-2xl w-full max-w-2xl shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Avatar */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-2xl p-6">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            {tutor.profile_image_url ? (
              <img 
                src={tutor.profile_image_url} 
                alt={`${tutor.first_name} ${tutor.last_name}`}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {tutor.first_name} {tutor.middle_name} {tutor.last_name}
              </h2>
              <p className="text-white/80">{levelLabel}</p>
              <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-lg ${
                tutor.status === "active" 
                  ? "bg-white/20 text-white" 
                  : tutor.status === "suspended"
                  ? "bg-red-500/80 text-white"
                  : "bg-gray-500/80 text-white"
              }`}>
                {tutor.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Credentials */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Login Credentials</h3>
            <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-[var(--foreground)]">{tutor.email}</span>
                  <button 
                    onClick={() => copyToClipboard(tutor.email, "Email")}
                    className="p-1 hover:bg-[var(--accent)] rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              {tutor.plain_password && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--foreground)]">{tutor.plain_password}</span>
                    <button 
                      onClick={() => copyToClipboard(tutor.plain_password!, "Password")}
                      className="p-1 hover:bg-[var(--accent)] rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Phone" value={tutor.phone} />
              <InfoItem label="Gender" value={genderLabel} />
              {tutor.date_of_birth && <InfoItem label="Date of Birth" value={formatDate(tutor.date_of_birth)} />}
              {tutor.location && <InfoItem label="Location" value={tutor.location} className="col-span-2" />}
            </div>
          </div>

          {/* Official Documents */}
          {(tutor.id_number || tutor.nssf_no || tutor.kra_pin) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Official Documents</h3>
              <div className="grid grid-cols-3 gap-4">
                {tutor.id_number && <InfoItem label="ID Number" value={tutor.id_number} />}
                {tutor.nssf_no && <InfoItem label="NSSF No" value={tutor.nssf_no} />}
                {tutor.kra_pin && <InfoItem label="KRA PIN" value={tutor.kra_pin} />}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Record Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted)]">Created: </span>
                <span className="text-[var(--foreground)]">{formatDate(tutor.created_at)}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Updated: </span>
                <span className="text-[var(--foreground)]">{formatDate(tutor.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="py-3 px-4 bg-red-500/10 text-red-500 rounded-xl font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-[var(--background)] rounded-lg p-3 border border-[var(--border)] ${className}`}>
      <span className="text-xs text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <p className="text-[var(--foreground)] font-medium mt-1">{value}</p>
    </div>
  );
}






