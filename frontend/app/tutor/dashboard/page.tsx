"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TutorInfo {
  id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  level: string;
  phone?: string;
  profile_image_url?: string;
}

interface TutorDashboardData {
  tutor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    level: string;
    status: string;
  };
  schools: Array<{
    id: string;
    name: string;
    code: string;
    classes: Array<{
      id: string;
      name: string;
      level: string;
      role: string;
      assigned_at: string;
      student_count: number;
    }>;
  }>;
  summary: {
    total_schools: number;
    total_classes: number;
    total_students: number;
  };
}

interface SchoolPerformanceSummary {
  kpis: {
    total_students: number;
    lessons_completed: number;
    total_lessons: number;
    overall_rating: number;
  };
  performance_distribution: {
    no_attempt: number;
    below_expectation: number;
    approaching: number;
    meeting: number;
    exceeding: number;
  };
  weekly_trends: Array<{
    week: string;
    courses: Array<{
      course_id: string;
      course_name: string;
      average_score: number;
    }>;
  }>;
}

const PERFORMANCE_COLORS = {
  no_attempt: "#9CA3AF",
  below_expectation: "#EF4444",
  approaching: "#F59E0B",
  meeting: "#3B82F6",
  exceeding: "#10B981",
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
  "#F43F5E",
  "#64748B",
  "#0EA5E9",
];

export default function TutorDashboardPage() {
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [dashboardData, setDashboardData] = useState<TutorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolPerformance, setSchoolPerformance] = useState<SchoolPerformanceSummary | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    const fetchTutorData = async () => {
      const token = localStorage.getItem("tutor_token");
      const userStr = localStorage.getItem("tutor_user");

      if (!token || !userStr) {
        router.push("/tutor/login");
        return;
      }

      try {
        // Fetch tutor info
        const tutorResponse = await apiClient.get("/auth/tutor/me");
        setTutor(tutorResponse.data);

        // Fetch tutor dashboard data (assignments, classes, etc.)
        const dashboardResponse = await apiClient.get(`/allocations/tutor/me`);
        const data: TutorDashboardData = dashboardResponse.data;
        setDashboardData(data);

        if (data.schools && data.schools.length > 0) {
          const firstSchoolId = data.schools[0].id;
          setSelectedSchoolId(firstSchoolId);
          fetchSchoolPerformance(firstSchoolId);
        }
      } catch (err: any) {
        console.error("Error fetching tutor data:", err);
        if (err.response?.status === 401) {
          router.push("/tutor/login");
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [router]);

  const fetchSchoolPerformance = async (schoolId: string) => {
    try {
      setLoadingPerformance(true);
      const response = await apiClient.get(`/allocations/tutor/me/schools/${schoolId}/performance`);
      const data = response.data;
      setSchoolPerformance({
        kpis: data.kpis,
        performance_distribution: data.performance_distribution,
        weekly_trends: data.weekly_trends,
      });
    } catch (err) {
      console.error("Error fetching school performance:", err);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const capitalizeName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getOverallRatingLabel = (rating: number) => {
    if (rating >= 76) return "Exceeds Expectation";
    if (rating >= 51) return "Meets Expectation";
    if (rating >= 26) return "Approaching Expectation";
    if (rating > 0) return "Below Expectation";
    return "No Data";
  };

  const prepareLineChartData = () => {
    if (!schoolPerformance) return [];

    return schoolPerformance.weekly_trends.map((week) => {
      const dataPoint: any = { week: week.week };
      week.courses.forEach((course) => {
        dataPoint[course.course_name] = course.average_score;
      });
      return dataPoint;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/tutor/login")}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const performanceChartData =
    schoolPerformance && schoolPerformance.kpis
      ? [
          {
            key: "no_attempt",
            name: "No Quiz Attempt Yet",
            value: schoolPerformance.performance_distribution.no_attempt,
            fill: PERFORMANCE_COLORS.no_attempt,
          },
          {
            key: "below_expectation",
            name: "Below Expectation",
            value: schoolPerformance.performance_distribution.below_expectation,
            fill: PERFORMANCE_COLORS.below_expectation,
          },
          {
            key: "approaching",
            name: "Approaching Expectation",
            value: schoolPerformance.performance_distribution.approaching,
            fill: PERFORMANCE_COLORS.approaching,
          },
          {
            key: "meeting",
            name: "Meets Expectation",
            value: schoolPerformance.performance_distribution.meeting,
            fill: PERFORMANCE_COLORS.meeting,
          },
          {
            key: "exceeding",
            name: "Exceeds Expectation",
            value: schoolPerformance.performance_distribution.exceeding,
            fill: PERFORMANCE_COLORS.exceeding,
          },
        ]
      : [];

  const totalStudents = schoolPerformance?.kpis.total_students || 0;
  const overallRating = schoolPerformance?.kpis.overall_rating || 0;
  const overallRatingLabel = getOverallRatingLabel(overallRating);
  const lineChartData = prepareLineChartData();
  const allCourseNames =
    schoolPerformance?.weekly_trends &&
    Array.from(new Set(schoolPerformance.weekly_trends.flatMap((w) => w.courses.map((c) => c.course_name))));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 mb-2 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Hello, {tutor ? capitalizeName(tutor.first_name) : "Tutor"},
            </h1>
            <p className="text-sm text-purple-100 mb-2">
              Here is an overview of your tutor&apos;s dashboard
            </p>
            <p className="text-xs text-purple-100 opacity-90">
              {tutor?.level
                ? `Level: ${tutor.level.charAt(0).toUpperCase() + tutor.level.slice(1)}`
                : "Manage your classes and students"}
            </p>
          </div>
          {tutor?.profile_image_url ? (
            <img
              src={tutor.profile_image_url}
              alt={`${tutor.first_name} ${tutor.last_name}`}
              className="w-20 h-20 rounded-full border-4 border-white/20 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {tutor?.first_name?.charAt(0).toUpperCase() || "T"}
            </div>
          )}
        </div>
      </div>

      {/* Top Row: Self-Registration + Stats + Performance Donut */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Self-Registration Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 11-4 0 2 2 0 014 0zM13 11h-2a4 4 0 00-4 4v1h10v-1a4 4 0 00-4-4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Self-Registration</p>
                <p className="text-xs text-gray-600">
                  Students can use a class code to register themselves — no admin needed.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/tutor/class-code")}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Generate Code
            </button>
          </div>

          {/* Summary Stats (Students / Schools / Classes) */}
          <div className="grid grid-rows-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Number of students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.total_students}</p>
              </div>
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Number of schools</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.total_schools}</p>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Number of classes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.total_classes}</p>
              </div>
              <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13M9 6.253C7.832 5.477 6.246 5 4.5 5S1.168 5.477 0 6.253v13"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Overall Performance Donut */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Your Overall Performance</h3>
                <p className="text-xs text-gray-500">
                  This shows your overall performance in{" "}
                  {dashboardData.schools.length > 0 ? dashboardData.schools[0].name : "your schools"}.
                </p>
              </div>
              {schoolPerformance && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">
                  Rating: {overallRating.toFixed(2)} ({overallRatingLabel})
                </span>
              )}
            </div>

            {loadingPerformance || !schoolPerformance ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-full md:w-1/2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {performanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-2 text-xs">
                  <p className="font-semibold text-gray-900 mb-1">Legend</p>
                  <div className="space-y-1">
                    {performanceChartData.map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          ></span>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-gray-500">
                          {item.value}{" "}
                          <span className="hidden sm:inline">
                            students
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-gray-500 text-xs">
                    Total students: <span className="font-semibold text-gray-900">{totalStudents}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Courses - 10 Weekly Average Quiz Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--foreground)" }}>
              All Courses
            </h2>
            <p className="text-sm text-gray-600">10 Weekly Average Quiz Score</p>
          </div>
        </div>

        {schoolPerformance && lineChartData.length > 0 && allCourseNames && allCourseNames.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: "Avg Score (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {allCourseNames.map((courseName, index) => (
                <Line
                  key={courseName}
                  type="monotone"
                  dataKey={courseName}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No quiz data available for the last 10 weeks.
          </div>
        )}
      </div>

      {/* Schools and Classes */}
      {dashboardData && dashboardData.schools.length > 0 ? (
        <div className="space-y-6">
          {dashboardData.schools.map((school) => (
            <div key={school.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{school.name}</h3>
                  <p className="text-sm text-gray-600">Code: {school.code}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {school.classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                          <p className="text-sm text-gray-600">Level: {classItem.level}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg">
                          {classItem.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
                            />
                          </svg>
                          <span>{classItem.student_count} students</span>
                        </div>
                        <button
                          onClick={() => router.push(`/tutor/class/${classItem.id}`)}
                          className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
          <p className="text-gray-600">
            You haven&apos;t been assigned to any classes yet. Please contact your administrator.
          </p>
        </div>
      )}

      {/* Tutor Info Card */}
      {tutor && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900">{tutor.email}</p>
            </div>
            {tutor.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-base font-medium text-gray-900">{tutor.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-base font-medium text-gray-900 capitalize">{tutor.level}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
