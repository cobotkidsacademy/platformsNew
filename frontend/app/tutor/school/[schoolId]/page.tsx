"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SchoolPerformance {
  school: {
    id: string;
    name: string;
    code: string;
  };
  kpis: {
    total_students: number;
    lessons_completed: number;
    total_lessons: number;
    most_enrolled_class: {
      class_name: string;
      enrollments: number;
      course_name: string;
    } | null;
    overall_rating: number;
  };
  class_statistics: Array<{
    class_id: string;
    class_name: string;
    enrollments: number;
    completed_lessons: number;
    total_lessons: number;
    average_performance: number;
  }>;
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

const COLORS = {
  no_attempt: '#9CA3AF',
  below_expectation: '#EF4444',
  approaching: '#F59E0B',
  meeting: '#3B82F6',
  exceeding: '#10B981',
};

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#A855F7', '#F43F5E', '#64748B', '#0EA5E9',
];

export default function TutorSchoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [performanceData, setPerformanceData] = useState<SchoolPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId) {
      fetchPerformanceData();
    }
  }, [schoolId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/allocations/tutor/me/schools/${schoolId}/performance`);
      setPerformanceData(response.data);
    } catch (err: any) {
      console.error("Error fetching performance data:", err);
      setError(err.response?.data?.message || "Failed to load school performance");
    } finally {
      setLoading(false);
    }
  };

  const getRatingCategory = (rating: number): { label: string; color: string } => {
    if (rating >= 76) return { label: "Exceeds Expectation", color: "text-green-600" };
    if (rating >= 51) return { label: "Meets Expectation", color: "text-blue-600" };
    if (rating >= 26) return { label: "Approaching Expectation", color: "text-yellow-600" };
    return { label: "Below Expectation", color: "text-red-600" };
  };

  const getPerformanceCategory = (percentage: number): { label: string; color: string } => {
    if (percentage >= 76) return { label: "Exceeds Expectation", color: "bg-green-100 text-green-700" };
    if (percentage >= 51) return { label: "Meets Expectation", color: "bg-blue-100 text-blue-700" };
    if (percentage >= 26) return { label: "Approaching Expectation", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Below Expectation", color: "bg-red-100 text-red-700" };
  };

  // Prepare data for line chart
  const prepareLineChartData = () => {
    if (!performanceData) return [];
    
    const allCourses = new Set<string>();
    performanceData.weekly_trends.forEach((week) => {
      week.courses.forEach((course) => {
        allCourses.add(course.course_id);
      });
    });

    const courseNames = new Map<string, string>();
    performanceData.weekly_trends.forEach((week) => {
      week.courses.forEach((course) => {
        courseNames.set(course.course_id, course.course_name);
      });
    });

    return performanceData.weekly_trends.map((week) => {
      const dataPoint: any = { week: week.week };
      week.courses.forEach((course) => {
        dataPoint[course.course_name] = course.average_score;
      });
      return dataPoint;
    });
  };

  // Prepare donut chart data
  const prepareDonutData = (category: string, value: number, total: number) => {
    const otherValue = total - value;
    return [
      { name: category, value, fill: COLORS[category as keyof typeof COLORS] },
      { name: 'Other', value: otherValue, fill: '#E5E7EB' },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/tutor/school")}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Schools
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "School not found"}
        </div>
      </div>
    );
  }

  const ratingCategory = getRatingCategory(performanceData.kpis.overall_rating);
  const totalStudents = performanceData.kpis.total_students;
  const lineChartData = prepareLineChartData();
  const allCourseNames = Array.from(new Set(performanceData.weekly_trends.flatMap(w => w.courses.map(c => c.course_name))));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/tutor/school")}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Schools
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
        School's Overall Performance
      </h1>

      {/* School Logo and KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* School Logo Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 text-center">{performanceData.school.name}</h2>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{performanceData.kpis.total_students}</p>
              <p className="text-sm text-gray-600">Enrolled students</p>
            </div>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{performanceData.kpis.lessons_completed}</p>
              <p className="text-sm text-gray-600">of {performanceData.kpis.total_lessons} Lessons</p>
            </div>
          </div>
        </div>

        {/* Most Enrolled Class */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              {performanceData.kpis.most_enrolled_class ? (
                <>
                  <p className="text-lg font-bold text-gray-900">{performanceData.kpis.most_enrolled_class.class_name}</p>
                  <p className="text-sm text-gray-600">Enrollments: {performanceData.kpis.most_enrolled_class.enrollments}</p>
                  <p className="text-xs text-gray-500">Course: {performanceData.kpis.most_enrolled_class.course_name}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-gray-400">N/A</p>
                  <p className="text-sm text-gray-500">No enrollments</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Overall School Rating */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{performanceData.kpis.overall_rating.toFixed(2)}</p>
              <p className={`text-sm font-medium ${ratingCategory.color}`}>{ratingCategory.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Statistics Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Class Statistics
          </h2>
          <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
            Switch to Card View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Class List */}
          <div className="lg:col-span-2 space-y-4">
            {performanceData.class_statistics.map((classStat) => {
              const perfCategory = getPerformanceCategory(classStat.average_performance);
              return (
                <div key={classStat.class_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{classStat.class_name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${perfCategory.color}`}>
                      {perfCategory.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Enrollments: {classStat.enrollments}</p>
                    <p>Completed Lessons: {classStat.completed_lessons} of {classStat.total_lessons}</p>
                    <p>Average Performance: {classStat.average_performance.toFixed(2)}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Student Performance Distribution */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              Student Performance Distribution
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(performanceData.performance_distribution).map(([key, value]) => {
                const percentage = totalStudents > 0 ? ((value / totalStudents) * 100).toFixed(2) : "0.00";
                const donutData = prepareDonutData(key, value, totalStudents);
                return (
                  <div key={key} className="text-center">
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-xs font-medium mt-2 text-gray-700 capitalize">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                    <p className="text-xs text-gray-500">{value} students</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 10 Weekly Average Quiz Points Trend */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            10 Weekly Average Quiz Points Trend
          </h2>
          <p className="text-sm text-gray-600">
            This shows the average quiz points over the last 10 weeks.
          </p>
        </div>

        {lineChartData.length > 0 && allCourseNames.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: 'Avg Score (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
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
    </div>
  );
}
