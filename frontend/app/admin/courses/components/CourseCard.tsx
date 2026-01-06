"use client";

import { Course } from "../types";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CourseCard({ course, onClick, onEdit, onDelete }: CourseCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] cursor-pointer hover:shadow-xl hover:border-violet-500/30 transition-all duration-300 group overflow-hidden"
    >
      {/* Icon/Image Header */}
      <div className="h-32 bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative">
        {course.icon_image_url ? (
          <img 
            src={course.icon_image_url} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
        {/* Course Code Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
          {course.code}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 group-hover:text-violet-500 transition-colors line-clamp-1">
          {course.name}
        </h3>
        
        {course.description && (
          <p className="text-sm text-[var(--muted)] mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">
              {course.level_count} Level{course.level_count > 1 ? 's' : ''}
            </span>
          </div>

          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            course.status === "active" 
              ? "bg-emerald-500/10 text-emerald-500" 
              : course.status === "draft"
              ? "bg-amber-500/10 text-amber-500"
              : "bg-gray-500/10 text-gray-500"
          }`}>
            {course.status}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
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
                  onDelete();
                }}
                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-600"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-sm text-[var(--muted)] group-hover:text-violet-500 transition-colors flex items-center gap-1">
            View Levels
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}



