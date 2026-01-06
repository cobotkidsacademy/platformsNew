"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import {
  CourseWithLevels,
  CourseLevel,
  StudentCoursesResponse,
} from "../types";
import CourseCard from "./CourseCard";
import ClassCodeModal from "./ClassCodeModal";

export default function StudentCoursesView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coursesData, setCoursesData] = useState<StudentCoursesResponse | null>(null);

  // Modal states
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithLevels | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/student-courses/my-courses");
      setCoursesData(response.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelClick = (level: CourseLevel, course: CourseWithLevels) => {
    if (level.enrollment_status === "completed") {
      // Directly navigate to topics for completed levels
      router.push(`/student/courses/${course.id}/levels/${level.id}/topics`);
    } else if (level.enrollment_status === "enrolled") {
      // Show class code modal for enrolled levels
      setSelectedLevel(level);
      setSelectedCourse(course);
      setValidationError("");
      setShowCodeModal(true);
    }
  };

  const handleCodeSubmit = async (code: string) => {
    if (!selectedLevel || !selectedCourse || !coursesData) return;

    setIsValidating(true);
    setValidationError("");

    try {
      const response = await apiClient.post("/student-courses/validate-code", {
        class_id: coursesData.class_id,
        code: code,
        course_level_id: selectedLevel.id,
      });

      if (response.data.valid) {
        setShowCodeModal(false);
        // Store verification in sessionStorage
        sessionStorage.setItem(`level_verified_${selectedLevel.id}`, 'true');
        // Navigate to topics
        router.push(`/student/courses/${selectedCourse.id}/levels/${selectedLevel.id}/topics`);
      } else {
        setValidationError(response.data.message || "Invalid class code");
      }
    } catch (err: any) {
      console.error("Error validating code:", err);
      setValidationError(err.response?.data?.message || "Failed to validate code");
    } finally {
      setIsValidating(false);
    }
  };

  // Build display items: courses without accessible levels + accessible levels as separate cards
  const buildDisplayItems = (): { type: 'course' | 'level'; course: CourseWithLevels; level?: CourseLevel }[] => {
    if (!coursesData) return [];

    const items: { type: 'course' | 'level'; course: CourseWithLevels; level?: CourseLevel }[] = [];

    coursesData.courses.forEach((course) => {
      const accessibleLevels = course.levels.filter(
        (l) => l.enrollment_status === 'enrolled' || l.enrollment_status === 'completed'
      );

      if (accessibleLevels.length === 0) {
        // Show course as locked
        items.push({ type: 'course', course });
      } else {
        // Show each accessible level as a separate card
        accessibleLevels.forEach((level) => {
          items.push({ type: 'level', course, level });
        });
      }
    });

    // Sort: enrolled/completed first, then locked
    return items.sort((a, b) => {
      const getOrder = (item: typeof a) => {
        if (item.type === 'level') {
          return item.level?.enrollment_status === 'completed' ? 0 : 1;
        }
        return 2; // locked courses last
      };
      return getOrder(a) - getOrder(b);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!coursesData || coursesData.courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <p className="text-gray-600">No courses available for your class.</p>
      </div>
    );
  }

  const displayItems = buildDisplayItems();

  return (
    <div className="space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
          <p className="text-sm text-gray-600">
            Class: <span className="font-medium text-blue-600">{coursesData.class_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span>
            Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            Enrolled
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-400"></span>
            Locked
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayItems.map((item, index) => (
          <CourseCard
            key={item.level ? `level-${item.level.id}` : `course-${item.course.id}`}
            course={item.course}
            level={item.level}
            onClick={
              item.level
                ? () => handleLevelClick(item.level!, item.course)
                : undefined
            }
          />
        ))}
      </div>

      {/* Class Code Modal */}
      <ClassCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSubmit={handleCodeSubmit}
        levelName={selectedLevel && selectedCourse ? `${selectedCourse.name} - Level ${selectedLevel.level_number}` : ""}
        isValidating={isValidating}
        error={validationError}
      />
    </div>
  );
}
