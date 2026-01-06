"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface ClassWithAllocation {
  id: string;
  name: string;
  level: string;
  description?: string;
  status: string;
  school: {
    id: string;
    name: string;
    code: string;
  };
  schedule: any;
  lead_tutor: any;
  assistant_tutor: any;
  student_count: number;
  current_code: {
    code: string;
    valid_from: string;
    valid_until: string;
    generated_at: string;
  } | null;
  class_status: string;
  can_generate_code: boolean;
  next_class_datetime: string | null;
  time_window: {
    starts_at: string | null;
    ends_at: string | null;
    is_within_window: boolean;
  };
}

export default function TutorClassCodePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassWithAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<{ code: string; class_name: string } | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/class-codes/tutor/me/classes");
      if (response.data.data) {
        setClasses(response.data.data);
      } else {
        setClasses(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async (classItem: ClassWithAllocation) => {
    setGenerating(classItem.id);
    setError("");

    try {
      const response = await apiClient.post("/class-codes/generate", {
        class_id: classItem.id,
      });
      setGeneratedCode({
        code: response.data.code,
        class_name: classItem.name,
      });
      setShowCodeModal(true);
      fetchClasses(); // Refresh to show new code
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to generate code";
      setError(errorMessage);
      setTimeout(() => setError(""), 10000);
    } finally {
      setGenerating(null);
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "today":
        return "bg-green-100 text-green-700 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "tomorrow":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "past":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "assigned":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "today":
        return "Today";
      case "upcoming":
        return "Upcoming";
      case "tomorrow":
        return "Tomorrow";
      case "past":
        return "Past";
      case "assigned":
        return "Assigned";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Class Code
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Generate class codes for your assigned classes
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
          <p className="text-gray-600">
            You haven&apos;t been assigned to any classes yet. Please contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem, index) => (
            <div
              key={classItem.id}
              onClick={() => router.push(`/tutor/school/${classItem.school.id}/class/${classItem.id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Class Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{classItem.name}</h3>
                    <p className="text-sm text-gray-600">{classItem.school.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(classItem.class_status)}`}>
                    {getStatusLabel(classItem.class_status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Level: {classItem.level}</p>
              </div>

              {/* Schedule Info */}
              {classItem.schedule && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Schedule</p>
                  <p className="text-sm font-medium text-gray-900">
                    {classItem.schedule.day_of_week} • {formatTime(classItem.schedule.start_time)} - {formatTime(classItem.schedule.end_time)}
                  </p>
                </div>
              )}

              {/* Current Code */}
              {classItem.current_code && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-2">Active Code</p>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-700 mb-2">{classItem.current_code.code}</p>
                    <p className="text-xs text-gray-600">
                      Valid until: {formatDateTime(classItem.current_code.valid_until)}
                    </p>
                  </div>
                </div>
              )}

              {/* Student Count */}
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{classItem.student_count} students</span>
              </div>

              {/* Generate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateCode(classItem);
                }}
                disabled={generating === classItem.id || !classItem.can_generate_code}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  classItem.can_generate_code
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {generating === classItem.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Class Code"
                )}
              </button>

              {!classItem.can_generate_code && classItem.next_class_datetime && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Next class: {formatDateTime(classItem.next_class_datetime)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && generatedCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Code Generated!</h2>
              <p className="text-gray-600 mb-6">{generatedCode.class_name}</p>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border-2 border-purple-200">
                <p className="text-6xl font-bold text-purple-700 mb-2">{generatedCode.code}</p>
                <p className="text-sm text-gray-600">Share this code with your students</p>
              </div>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setGeneratedCode(null);
                }}
                className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
