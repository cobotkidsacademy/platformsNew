"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/api/client";

interface Student {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  profile_image_url?: string;
  last_login?: string;
  login_count: number;
  status: string;
  class: {
    id: string;
    name: string;
    level: string;
  } | null;
  school: {
    id: string;
    name: string;
    code: string;
  } | null;
  quiz_progress: {
    total_points: number;
    quizzes_completed: number;
    average_score: number;
  };
}

interface TopicResult {
  topic_id: string;
  topic_name: string;
  order_index: number;
  completed: boolean;
  passed: boolean;
  quiz_results: Array<{
    quiz_id: string;
    quiz_title: string;
    percentage: number;
    score: number;
    max_score: number;
    passed: boolean;
  }>;
}

interface CourseLevelExam {
  course_level_id: string;
  course_level_name: string;
  level_number: number;
  course_id: string;
  course_name: string;
  topics: TopicResult[];
}

export default function TutorStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [examData, setExamData] = useState<CourseLevelExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExam, setShowExam] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Get student from the tutor's students list
      const response = await apiClient.get("/allocations/tutor/me/students");
      const students = response.data || [];
      const foundStudent = students.find((s: Student) => s.id === studentId);
      
      if (!foundStudent) {
        setError("Student not found or you don't have access to this student");
        return;
      }

      setStudent(foundStudent);
    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError(err.response?.data?.message || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const fetchExamData = async () => {
    try {
      setLoadingExam(true);
      const response = await apiClient.get(`/allocations/tutor/me/students/${studentId}/exam`);
      setExamData(response.data || []);
      setShowExam(true);
    } catch (err: any) {
      console.error("Error fetching exam data:", err);
      setError(err.response?.data?.message || "Failed to load exam data");
    } finally {
      setLoadingExam(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Students
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Student not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/tutor/students")}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Students
      </button>

      {/* Student Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-6">
          {student.profile_image_url ? (
            <img
              src={student.profile_image_url}
              alt={`${student.first_name} ${student.last_name}`}
              className="w-24 h-24 rounded-full border-4 border-white/20 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
              {getInitials(student.first_name, student.last_name)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-purple-100">@{student.username}</p>
            {student.class && (
              <p className="text-purple-100 mt-1">
                {student.class.name} • {student.class.level}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Total Points</p>
          <p className="text-2xl font-bold text-purple-600">{student.quiz_progress.total_points}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Quizzes Completed</p>
          <p className="text-2xl font-bold text-blue-600">{student.quiz_progress.quizzes_completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-green-600">
            {student.quiz_progress.average_score > 0 ? `${Math.round(student.quiz_progress.average_score)}%` : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Total Logins</p>
          <p className="text-2xl font-bold text-orange-600">{student.login_count}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Student Information
          </h2>
          <button
            onClick={fetchExamData}
            disabled={loadingExam}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingExam ? "Loading..." : "Exam"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Username</p>
            <p className="text-base font-medium text-gray-900 font-mono">{student.username}</p>
          </div>
          {student.email && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-base font-medium text-gray-900">{student.email}</p>
            </div>
          )}
          {student.class && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Class</p>
              <p className="text-base font-medium text-gray-900">
                {student.class.name} ({student.class.level})
              </p>
            </div>
          )}
          {student.school && (
            <div>
              <p className="text-sm text-gray-600 mb-1">School</p>
              <p className="text-base font-medium text-gray-900">
                {student.school.name} ({student.school.code})
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">Last Login</p>
            <p className="text-base font-medium text-gray-900">{formatDate(student.last_login)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                student.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Exam Data Table */}
      {showExam && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Exam Results
          </h2>
          {loadingExam ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : examData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exam Data</h3>
              <p className="text-gray-600">No course levels assigned or no quiz data available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Results
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {examData.map((level, levelIndex) => (
                    <tr key={level.course_level_id} className="hover:bg-gray-50">
                      {/* Course Level */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{level.course_level_name}</p>
                          <p className="text-xs text-gray-500">{level.course_name}</p>
                        </div>
                      </td>
                      {/* Topics */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {level.topics.length === 0 ? (
                            <span className="text-sm text-gray-400">No topics</span>
                          ) : (
                            level.topics.map((topic) => (
                              <div key={topic.topic_id} className="flex items-center gap-2">
                                {topic.passed ? (
                                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : topic.completed ? (
                                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                )}
                                <span className="text-sm text-gray-900">{topic.topic_name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      {/* Quiz Results */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {level.topics.map((topic) => (
                            <div key={topic.topic_id} className="space-y-1">
                              {topic.quiz_results.length === 0 ? (
                                <span className="text-xs text-gray-400">No quizzes</span>
                              ) : (
                                topic.quiz_results.map((result, idx) => (
                                  <div key={result.quiz_id || idx} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">{result.quiz_title}:</span>
                                      <span className={`font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.percentage}% ({result.score}/{result.max_score})
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

