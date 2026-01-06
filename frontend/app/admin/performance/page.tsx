"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { School, Class } from "../school/types";
import { Course, CourseLevel } from "../courses/types";
import { QuizPerformanceResponse, QuizPerformanceFilter } from "./types";

type PerformanceView = "selection" | "quizzes";

export default function PerformancePage() {
  const [viewMode, setViewMode] = useState<PerformanceView>("selection");
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<QuizPerformanceResponse | null>(null);

  // Filter states
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const [filters, setFilters] = useState<QuizPerformanceFilter>({
    school_id: "",
    class_id: "",
    course_id: "",
    course_level_id: "",
    topic_id: "",
    quiz_id: "",
    date_from: "",
    date_to: "",
    status: "all",
  });

  useEffect(() => {
    fetchSchools();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (filters.school_id) {
      fetchClasses(filters.school_id);
    } else {
      setClasses([]);
      setFilters((prev) => ({ ...prev, class_id: "" }));
    }
  }, [filters.school_id]);

  useEffect(() => {
    if (filters.course_id) {
      fetchCourseLevels(filters.course_id);
    } else {
      setCourseLevels([]);
      setFilters((prev) => ({ ...prev, course_level_id: "", topic_id: "", quiz_id: "" }));
    }
  }, [filters.course_id]);

  useEffect(() => {
    if (filters.course_level_id) {
      fetchTopics(filters.course_level_id);
    } else {
      setTopics([]);
      setFilters((prev) => ({ ...prev, topic_id: "", quiz_id: "" }));
    }
  }, [filters.course_level_id]);

  useEffect(() => {
    if (filters.topic_id) {
      fetchQuizzes(filters.topic_id);
    } else {
      setQuizzes([]);
      setFilters((prev) => ({ ...prev, quiz_id: "" }));
    }
  }, [filters.topic_id]);

  useEffect(() => {
    if (viewMode === "quizzes") {
      fetchPerformanceData();
    }
  }, [viewMode, filters]);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get("/schools");
      setSchools(response.data || []);
    } catch (err) {
      console.error("Error fetching schools:", err);
    }
  };

  const fetchClasses = async (schoolId: string) => {
    try {
      const response = await apiClient.get(`/schools/${schoolId}/classes`);
      setClasses(response.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get("/courses");
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchCourseLevels = async (courseId: string) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/levels`);
      setCourseLevels(response.data || []);
    } catch (err) {
      console.error("Error fetching course levels:", err);
    }
  };

  const fetchTopics = async (levelId: string) => {
    try {
      const response = await apiClient.get(`/courses/levels/${levelId}/topics`);
      setTopics(response.data || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setTopics([]);
    }
  };

  const fetchQuizzes = async (topicId: string) => {
    try {
      const response = await apiClient.get(`/quizzes/topic/${topicId}`);
      setQuizzes(response.data || []);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.school_id) params.append("school_id", filters.school_id);
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.course_id) params.append("course_id", filters.course_id);
      if (filters.course_level_id) params.append("course_level_id", filters.course_level_id);
      if (filters.topic_id) params.append("topic_id", filters.topic_id);
      if (filters.quiz_id) params.append("quiz_id", filters.quiz_id);
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);

      const response = await apiClient.get(`/quizzes/performance?${params.toString()}`);
      setPerformanceData(response.data);
    } catch (err: any) {
      console.error("Error fetching performance data:", err);
      alert(err.response?.data?.message || "Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof QuizPerformanceFilter, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      school_id: "",
      class_id: "",
      course_id: "",
      course_level_id: "",
      topic_id: "",
      quiz_id: "",
      date_from: "",
      date_to: "",
      status: "all",
    });
  };

  // Selection View
  if (viewMode === "selection") {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Performance Analytics"
          description="Track and analyze student performance across different metrics"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setViewMode("quizzes")}
            className="group relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Quiz Performance</h3>
              <p className="text-white/90 text-sm">View quiz performance metrics and analytics</p>
            </div>
          </button>

          {/* Placeholder for future performance types */}
          <div className="group relative bg-gray-200 rounded-2xl p-8 opacity-50 cursor-not-allowed">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-500">Coming Soon</h3>
              <p className="text-gray-400 text-sm">More performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Performance View
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quiz Performance"
          description="Analyze quiz performance with detailed filters and statistics"
        />
        <button
          onClick={() => setViewMode("selection")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <select
              value={filters.school_id || ""}
              onChange={(e) => handleFilterChange("school_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={filters.class_id || ""}
              onChange={(e) => handleFilterChange("class_id", e.target.value)}
              disabled={!filters.school_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={filters.course_id || ""}
              onChange={(e) => handleFilterChange("course_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={filters.course_level_id || ""}
              onChange={(e) => handleFilterChange("course_level_id", e.target.value)}
              disabled={!filters.course_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Levels</option>
              {courseLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
              value={filters.topic_id || ""}
              onChange={(e) => handleFilterChange("topic_id", e.target.value)}
              disabled={!filters.course_level_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title || topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz</label>
            <select
              value={filters.quiz_id || ""}
              onChange={(e) => handleFilterChange("quiz_id", e.target.value)}
              disabled={!filters.topic_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Quizzes</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={filters.date_from || ""}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={fetchPerformanceData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Performance Data */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : performanceData ? (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900">{performanceData.stats.total_attempts}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Average Score</p>
              <p className="text-3xl font-bold text-blue-600">{performanceData.stats.average_score.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Average Percentage</p>
              <p className="text-3xl font-bold text-green-600">{performanceData.stats.average_percentage.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-2">Total Students</p>
              <p className="text-3xl font-bold text-purple-600">{performanceData.stats.total_students}</p>
            </div>
          </div>

          {/* Score Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution (Highest Attempts)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 mb-1">Below Expectation</p>
                <p className="text-xs text-red-600 mb-2">0-25%</p>
                <p className="text-2xl font-bold text-red-700">{performanceData.stats.score_categories?.below_expectation || 0}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-700 mb-1">Approaching</p>
                <p className="text-xs text-yellow-600 mb-2">26-50%</p>
                <p className="text-2xl font-bold text-yellow-700">{performanceData.stats.score_categories?.approaching || 0}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-700 mb-1">Meeting</p>
                <p className="text-xs text-blue-600 mb-2">51-75%</p>
                <p className="text-2xl font-bold text-blue-700">{performanceData.stats.score_categories?.meeting || 0}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700 mb-1">Exceeding</p>
                <p className="text-xs text-green-600 mb-2">76-100%</p>
                <p className="text-2xl font-bold text-green-700">{performanceData.stats.score_categories?.exceeding || 0}</p>
              </div>
            </div>
          </div>

          {/* Quiz Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quiz</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course/Level</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Attempts</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Passed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Failed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Pass Rate</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Students</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Score Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.quiz_data.map((quiz) => (
                    <tr key={quiz.quiz_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{quiz.quiz_title}</div>
                        {quiz.topic_name && (
                          <div className="text-sm text-gray-500">Topic: {quiz.topic_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {quiz.course_name && (
                          <div className="text-sm text-gray-900">{quiz.course_name}</div>
                        )}
                        {quiz.level_name && (
                          <div className="text-xs text-gray-500">{quiz.level_name}</div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">{quiz.total_attempts}</td>
                      <td className="text-center py-3 px-4 text-green-600 font-medium">{quiz.passed_attempts}</td>
                      <td className="text-center py-3 px-4 text-red-600 font-medium">{quiz.failed_attempts}</td>
                      <td className="text-center py-3 px-4 text-gray-700">{quiz.average_score.toFixed(1)}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-medium ${quiz.pass_rate >= 70 ? 'text-green-600' : quiz.pass_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {quiz.pass_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">{quiz.total_students}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-red-600">{quiz.score_categories?.below_expectation || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            <span className="text-yellow-600">{quiz.score_categories?.approaching || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="text-blue-600">{quiz.score_categories?.meeting || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-green-600">{quiz.score_categories?.exceeding || 0}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Class/School</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Attempts</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Passed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Highest Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Highest %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Points</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.student_data.map((student) => (
                    <tr key={student.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{student.student_name}</div>
                        <div className="text-sm text-gray-500">@{student.student_username}</div>
                      </td>
                      <td className="py-3 px-4">
                        {student.class_name && (
                          <div className="text-sm text-gray-900">{student.class_name}</div>
                        )}
                        {student.school_name && (
                          <div className="text-xs text-gray-500">{student.school_name}</div>
                        )}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">{student.total_attempts}</td>
                      <td className="text-center py-3 px-4 text-green-600 font-medium">{student.passed_attempts}</td>
                      <td className="text-center py-3 px-4 text-gray-700 font-medium">{student.highest_score.toFixed(1)}</td>
                      <td className="text-center py-3 px-4 text-gray-700 font-medium">{student.highest_percentage.toFixed(1)}%</td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.score_category === 'below_expectation' ? 'bg-red-100 text-red-700' :
                          student.score_category === 'approaching' ? 'bg-yellow-100 text-yellow-700' :
                          student.score_category === 'meeting' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {student.score_category === 'below_expectation' ? 'Below Expectation' :
                           student.score_category === 'approaching' ? 'Approaching' :
                           student.score_category === 'meeting' ? 'Meeting' :
                           'Exceeding'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-purple-600 font-bold">{student.total_points}</td>
                      <td className="text-center py-3 px-4 text-gray-700">{student.quizzes_completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-lg">No data available. Apply filters to view performance metrics.</p>
        </div>
      )}
    </div>
  );
}



