"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import {
  ClassWithAllocation,
  ClassCode,
  ClassStatus,
  CLASS_STATUS_OPTIONS,
  CLASS_LEVELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "./types";
import { School } from "../school/types";

export default function ClassCodePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassWithAllocation[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<ClassStatus | "all">("all");

  // Modal states
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithAllocation | null>(null);
  const [generatedCode, setGeneratedCode] = useState<ClassCode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [selectedSchool, selectedLevel, selectedStatus]);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get("/schools");
      setSchools(response.data.filter((s: School) => s.status === "active"));
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      let url = "/class-codes/classes";
      const params = new URLSearchParams();
      
      if (selectedSchool !== "all") params.append("school_id", selectedSchool);
      if (selectedLevel !== "all") params.append("level", selectedLevel);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiClient.get(url);
      // Handle new response format with server_time
      if (response.data.data) {
        setClasses(response.data.data);
        setServerTime(response.data.server_time);
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

  const handleGenerateCode = async (cls: ClassWithAllocation) => {
    setSelectedClass(cls);
    setGeneratedCode(null);
    setGenerating(true);

    try {
      const response = await apiClient.post("/class-codes/generate", {
        class_id: cls.id,
      });
      setGeneratedCode(response.data);
      setShowCodeModal(true);
      fetchClasses(); // Refresh to show new code
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to generate code";
      setError(errorMessage);
      // Auto-clear error after 10 seconds
      setTimeout(() => setError(""), 10000);
    } finally {
      setGenerating(false);
    }
  };

  const handleDebugClass = async (classId: string) => {
    try {
      const response = await apiClient.get(`/class-codes/debug/${classId}`);
      console.log("Class Debug Info:", response.data);
      alert(`Debug Info:\n${JSON.stringify(response.data, null, 2)}`);
    } catch (err: any) {
      alert("Failed to get debug info");
    }
  };

  const handleAssignClick = (cls: ClassWithAllocation) => {
    // Navigate to allocation page
    router.push("/admin/allocation");
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

  const getStatusBadge = (status: ClassStatus) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Class Codes"
        description="Generate and manage class attendance codes"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Server Time Display */}
      {serverTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700">
              Server Time: {new Date(serverTime).toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => fetchClasses()}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              School
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {CLASS_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ClassStatus | "all")}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {CLASS_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--foreground)] opacity-70">No classes found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => router.push(`/admin/school/${cls.school.id}/class/${cls.id}`)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{cls.name}</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-80">
                    {cls.school.name} ({cls.school.code})
                  </p>
                </div>
                {getStatusBadge(cls.class_status)}
              </div>

              {/* Class Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--foreground)] opacity-70">Level:</span>
                  <span className="text-[var(--foreground)] font-medium capitalize">{cls.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--foreground)] opacity-70">Students:</span>
                  <span className="text-[var(--foreground)] font-medium">{cls.student_count}</span>
                </div>

                {/* Schedule */}
                {cls.schedule ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--foreground)] opacity-70">Schedule:</span>
                    <span className="text-[var(--foreground)] font-medium capitalize">
                      {cls.schedule.day_of_week} {formatTime(cls.schedule.start_time)} - {formatTime(cls.schedule.end_time)}
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-amber-600 italic">No schedule set</div>
                )}

                {/* Tutors */}
                <div className="space-y-1">
                  {cls.lead_tutor ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--foreground)] opacity-70">Lead:</span>
                      <span className="text-[var(--foreground)] font-medium">
                        {cls.lead_tutor.first_name} {cls.lead_tutor.last_name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-amber-600 italic">No lead tutor</div>
                  )}
                  {cls.assistant_tutor ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--foreground)] opacity-70">Assistant:</span>
                      <span className="text-[var(--foreground)] font-medium">
                        {cls.assistant_tutor.first_name} {cls.assistant_tutor.last_name}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Current Code */}
                {cls.current_code && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Active Code:</span>
                      <span className="text-2xl font-bold text-green-700 tracking-wider">
                        {cls.current_code.code}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Valid until {formatDateTime(cls.current_code.valid_until)}
                    </div>
                    {cls.current_code.generated_by && (
                      <div className="text-xs text-green-600 mt-1">
                        Generated by: {cls.current_code.generated_by.first_name} {cls.current_code.generated_by.last_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Next Class */}
                {!cls.can_generate_code && cls.next_class_datetime && cls.class_status !== 'unassigned' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-700">
                      Next class: {formatDateTime(cls.next_class_datetime)}
                    </div>
                    {cls.schedule && (
                      <div className="text-xs text-blue-600 mt-1">
                        Code generation available during class time ({formatTime(cls.schedule.start_time)} - {formatTime(cls.schedule.end_time)})
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[var(--border)] space-y-2" onClick={(e) => e.stopPropagation()}>
                {cls.class_status === 'unassigned' ? (
                  <button
                    onClick={() => handleAssignClick(cls)}
                    className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                  >
                    Assign Schedule & Tutor
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleGenerateCode(cls)}
                      disabled={generating}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        cls.can_generate_code
                          ? "bg-violet-500 text-white hover:bg-violet-600"
                          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                      }`}
                    >
                      {generating && selectedClass?.id === cls.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </span>
                      ) : cls.can_generate_code ? (
                        "Generate Code"
                      ) : (
                        "Generate Code (Outside Class Time)"
                      )}
                    </button>
                    <button
                      onClick={() => handleDebugClass(cls.id)}
                      className="w-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Debug Time Info
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Code Modal */}
      {showCodeModal && selectedClass && generatedCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)] text-center">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Class Code Generated!
            </h2>
            <p className="text-sm text-[var(--foreground)] opacity-80 mb-6">
              {selectedClass.name}
            </p>
            
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 mb-6">
              <p className="text-white text-sm mb-2">Class Code</p>
              <p className="text-6xl font-bold text-white tracking-widest">
                {generatedCode.code}
              </p>
            </div>

            <div className="space-y-2 text-sm text-[var(--foreground)] opacity-80 mb-6">
              <p>Valid from: {formatDateTime(generatedCode.valid_from)}</p>
              <p>Valid until: {formatDateTime(generatedCode.valid_until)}</p>
            </div>

            <button
              onClick={() => setShowCodeModal(false)}
              className="w-full px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
