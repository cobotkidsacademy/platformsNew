"use client";

import { Tutor, TUTOR_LEVELS } from "../types";

interface TutorCardProps {
  tutor: Tutor;
  onClick: () => void;
  onEdit?: (tutor: Tutor) => void;
  onDelete?: (tutor: Tutor) => void;
}

const levelColors: Record<string, string> = {
  intern: "from-blue-500 to-indigo-600",
  tutor: "from-emerald-500 to-teal-600",
  manager: "from-purple-500 to-violet-600",
  edl: "from-orange-500 to-amber-600",
  operations_manager: "from-rose-500 to-pink-600",
  curriculum_manager: "from-cyan-500 to-sky-600",
};

export default function TutorCard({ tutor, onClick, onEdit, onDelete }: TutorCardProps) {
  const levelLabel = TUTOR_LEVELS.find(l => l.value === tutor.level)?.label || tutor.level;
  const gradientClass = levelColors[tutor.level] || "from-gray-500 to-slate-600";
  
  const initials = `${tutor.first_name[0]}${tutor.last_name[0]}`.toUpperCase();

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] cursor-pointer hover:shadow-lg hover:border-emerald-500/30 transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        {tutor.profile_image_url ? (
          <img 
            src={tutor.profile_image_url} 
            alt={`${tutor.first_name} ${tutor.last_name}`}
            className="w-14 h-14 rounded-xl object-cover"
          />
        ) : (
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-lg`}>
            {initials}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)] truncate group-hover:text-emerald-500 transition-colors">
            {tutor.first_name} {tutor.middle_name} {tutor.last_name}
          </h3>
          <p className="text-sm text-[var(--muted)] truncate">{tutor.email}</p>
        </div>
        
        <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${gradientClass} text-white whitespace-nowrap`}>
          {levelLabel}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-[var(--muted)]">Phone:</span>
          <span className="ml-2 text-[var(--foreground)]">{tutor.phone}</span>
        </div>
        <div>
          <span className="text-[var(--muted)]">Gender:</span>
          <span className="ml-2 text-[var(--foreground)] capitalize">{tutor.gender}</span>
        </div>
        {tutor.location && (
          <div className="col-span-2">
            <span className="text-[var(--muted)]">Location:</span>
            <span className="ml-2 text-[var(--foreground)]">{tutor.location}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
          tutor.status === "active" 
            ? "bg-emerald-500/10 text-emerald-500" 
            : tutor.status === "suspended"
            ? "bg-red-500/10 text-red-500"
            : "bg-gray-500/10 text-gray-500"
        }`}>
          {tutor.status}
        </span>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tutor);
              }}
              className="p-1.5 hover:bg-green-500/10 rounded-lg transition-colors text-green-600"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tutor);
              }}
              className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-600"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}



