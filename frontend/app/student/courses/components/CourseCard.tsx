"use client";

import { CourseWithLevels, CourseLevel } from "../types";

interface CourseCardProps {
  course: CourseWithLevels;
  level?: CourseLevel;
  onClick?: () => void;
}

export default function CourseCard({ course, level, onClick }: CourseCardProps) {
  // Determine status based on level or course
  const getStatus = () => {
    if (level) {
      return level.enrollment_status;
    }
    // For course-only view, check if any level is accessible
    if (course.completed_levels > 0 || course.enrolled_levels > 0) {
      return course.course_status === 'completed' ? 'completed' : 'enrolled';
    }
    return 'not_assigned';
  };

  const status = getStatus();
  const isAccessible = status === 'enrolled' || status === 'completed';
  const displayName = level ? `${course.name} - Level ${level.level_number}` : course.name;
  const displayCode = level ? `Level ${level.level_number}` : `Code: ${course.code}`;

  const getBadgeStyle = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'enrolled':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getBadgeText = () => {
    switch (status) {
      case 'completed':
        return 'COMPLETED';
      case 'enrolled':
        return 'ENROLLED';
      default:
        return 'LOCKED';
    }
  };

  const getNameColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'enrolled':
        return 'text-blue-500';
      default:
        return 'text-pink-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed - Click to review';
      case 'enrolled':
        return 'Ready to start';
      default:
        return 'Not assigned to your class';
    }
  };

  const getButtonStyle = () => {
    if (status === 'completed') {
      return 'bg-green-500 hover:bg-green-600 text-white cursor-pointer';
    }
    if (status === 'enrolled') {
      return 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer';
    }
    return 'bg-gray-200 text-gray-400 cursor-not-allowed';
  };

  const getButtonText = () => {
    switch (status) {
      case 'completed':
        return 'REVIEW CONTENT';
      case 'enrolled':
        return 'START LEARNING';
      default:
        return 'LOCKED';
    }
  };

  const handleClick = () => {
    if (isAccessible && onClick) {
      onClick();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Image Section */}
      <div className="relative h-40 bg-gray-100">
        {course.icon_image_url ? (
          <img
            src={course.icon_image_url}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '';
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-bold ${getBadgeStyle()}`}>
          {getBadgeText()}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className={`text-xl font-bold mb-1 ${getNameColor()}`}>
          {level ? `Level ${level.level_number}` : course.name}
        </h3>
        <p className="text-gray-600 text-sm mb-1">
          {level ? course.name : `Code: ${course.code}`}
        </p>
        <p className={`text-sm mb-4 ${isAccessible ? 'text-blue-500' : 'text-gray-400'}`}>
          {getStatusText()}
        </p>

        {/* Button */}
        <button
          onClick={handleClick}
          disabled={!isAccessible}
          className={`mt-auto w-full py-3 rounded-lg font-semibold text-sm transition-colors ${getButtonStyle()}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
