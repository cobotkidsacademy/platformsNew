"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api/client";

interface Course {
  id: string;
  name: string;
  description?: string;
  status: string;
  levels_count?: number;
}

interface Level {
  id: string;
  name: string;
  description?: string;
  order_position: number;
  topics_count?: number;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  order_position: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions_count: number;
  total_points: number;
  passing_score: number;
  status: string;
}

type SelectionStep = "course" | "level" | "topic" | "quizzes";

export default function QuizzesPage() {
  const router = useRouter();

  // Selection state
  const [step, setStep] = useState<SelectionStep>("course");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbNotReady, setDbNotReady] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLevels(selectedCourse.id);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLevel) {
      fetchTopics(selectedLevel.id);
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuizzes(selectedTopic.id);
    }
  }, [selectedTopic]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/courses");
      setCourses(response.data.filter((c: Course) => c.status === "active"));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/courses/${courseId}/levels`);
      setLevels(response.data);
    } catch (err) {
      console.error("Error fetching levels:", err);
      setError("Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (levelId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/courses/levels/${levelId}/topics`);
      setTopics(response.data);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (topicId: string) => {
    try {
      setLoading(true);
      setError(null);
      setDbNotReady(false);
      const response = await apiClient.get(`/quizzes/topic/${topicId}`);
      setQuizzes(response.data || []);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      const errorMessage = err?.response?.data?.message || "";
      // Check if it's a database table missing error
      if (errorMessage.includes("Could not find the table") || 
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relationship")) {
        setDbNotReady(true);
        setError("Quiz tables not found in database. Please run the migration.");
      } else {
        // For other errors, just show empty state
        setError(null);
      }
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLevel(null);
    setSelectedTopic(null);
    setLevels([]);
    setTopics([]);
    setQuizzes([]);
    setStep("level");
    setError(null);
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setSelectedTopic(null);
    setTopics([]);
    setQuizzes([]);
    setStep("topic");
    setError(null);
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setQuizzes([]);
    setStep("quizzes");
  };

  const handleBack = () => {
    setError(null);
    if (step === "level") {
      setSelectedCourse(null);
      setStep("course");
    } else if (step === "topic") {
      setSelectedLevel(null);
      setStep("level");
    } else if (step === "quizzes") {
      setSelectedTopic(null);
      setStep("topic");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "draft":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const navigateToQuizEditor = (quizId: string) => {
    if (selectedCourse && selectedLevel && selectedTopic) {
      router.push(
        `/admin/courses/${selectedCourse.id}/levels/${selectedLevel.id}/topics/${selectedTopic.id}/quizzes/${quizId}`
      );
    }
  };

  const navigateToCreateQuiz = () => {
    if (selectedCourse && selectedLevel && selectedTopic) {
      router.push(
        `/admin/courses/${selectedCourse.id}/levels/${selectedLevel.id}/topics/${selectedTopic.id}/quizzes`
      );
    }
  };

  if (loading && step === "course" && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🎯</span>
            Quizzes
          </h1>
          <p className="text-sm sm:text-base text-[var(--foreground)] opacity-70 mt-1">
            Manage quizzes for your courses
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation - Responsive */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          <button
            onClick={() => {
              setSelectedCourse(null);
              setSelectedLevel(null);
              setSelectedTopic(null);
              setStep("course");
              setError(null);
            }}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
              step === "course"
                ? "bg-violet-500 text-white"
                : selectedCourse
                ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="hidden sm:inline">📚 </span>
            {selectedCourse?.name ? (
              <span className="max-w-[80px] sm:max-w-none truncate inline-block align-middle">
                {selectedCourse.name}
              </span>
            ) : (
              "Course"
            )}
          </button>

          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <button
            onClick={() => {
              if (selectedCourse) {
                setSelectedLevel(null);
                setSelectedTopic(null);
                setStep("level");
                setError(null);
              }
            }}
            disabled={!selectedCourse}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
              step === "level"
                ? "bg-violet-500 text-white"
                : selectedLevel
                ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="hidden sm:inline">📊 </span>
            {selectedLevel?.name ? (
              <span className="max-w-[80px] sm:max-w-none truncate inline-block align-middle">
                {selectedLevel.name}
              </span>
            ) : (
              "Level"
            )}
          </button>

          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <button
            onClick={() => {
              if (selectedLevel) {
                setSelectedTopic(null);
                setStep("topic");
                setError(null);
              }
            }}
            disabled={!selectedLevel}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
              step === "topic"
                ? "bg-violet-500 text-white"
                : selectedTopic
                ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="hidden sm:inline">📝 </span>
            {selectedTopic?.name ? (
              <span className="max-w-[80px] sm:max-w-none truncate inline-block align-middle">
                {selectedTopic.name}
              </span>
            ) : (
              "Topic"
            )}
          </button>

          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <span
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap ${
              step === "quizzes"
                ? "bg-violet-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="hidden sm:inline">🎮 </span>Quizzes
          </span>
        </div>
      </div>

      {/* Back Button */}
      {step !== "course" && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm sm:text-base text-[var(--foreground)] opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Database Not Ready Message */}
      {dbNotReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl">⚠️</div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-2">
                Database Migration Required
              </h3>
              <p className="text-sm sm:text-base text-amber-700 mb-4">
                The quiz tables don&apos;t exist in your database yet. Please run the migration file
                <code className="mx-1 px-2 py-0.5 bg-amber-100 rounded text-amber-800 text-xs sm:text-sm">
                  007_create_quizzes.sql
                </code>
                in your Supabase SQL editor.
              </p>
              <div className="text-xs sm:text-sm text-amber-600">
                <p className="font-medium mb-1">Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your Supabase dashboard</li>
                  <li>Go to SQL Editor</li>
                  <li>Copy the contents of <code className="px-1 bg-amber-100 rounded">backend/src/database/migrations/007_create_quizzes.sql</code></li>
                  <li>Paste and run the SQL</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Course Selection */}
          {step === "course" && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 sm:mb-4">
                Select a Course
              </h2>
              {courses.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl">
                  <div className="text-4xl sm:text-5xl mb-4">📚</div>
                  <p className="text-sm sm:text-base text-[var(--foreground)] opacity-70">No courses found</p>
                  <Link
                    href="/admin/courses"
                    className="mt-4 inline-block px-4 py-2 bg-violet-500 text-white text-sm rounded-xl hover:bg-violet-600 transition-colors"
                  >
                    Create a Course
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:shadow-xl hover:border-violet-500/50 transition-all group"
                    >
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                        📚
                      </div>
                      <h3 className="text-sm sm:text-lg font-bold text-[var(--foreground)] mb-1 sm:mb-2 line-clamp-1">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-70 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-violet-500">
                        Select Course
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level Selection */}
          {step === "level" && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 sm:mb-4">
                Select a Level in {selectedCourse?.name}
              </h2>
              {levels.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl">
                  <div className="text-4xl sm:text-5xl mb-4">📊</div>
                  <p className="text-sm sm:text-base text-[var(--foreground)] opacity-70">No levels found in this course</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {levels.map((level, index) => (
                    <button
                      key={level.id}
                      onClick={() => handleSelectLevel(level)}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left hover:shadow-xl hover:border-blue-500/50 transition-all group"
                    >
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-xs sm:text-base text-[var(--foreground)] line-clamp-1">{level.name}</h3>
                      {level.description && (
                        <p className="text-[10px] sm:text-xs text-[var(--foreground)] opacity-70 mt-1 line-clamp-2">
                          {level.description}
                        </p>
                      )}
                      <div className="mt-2 sm:mt-3 text-[10px] sm:text-sm text-blue-500 flex items-center gap-1">
                        Select
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Topic Selection */}
          {step === "topic" && (
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 sm:mb-4">
                Select a Topic in {selectedLevel?.name}
              </h2>
              {topics.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl">
                  <div className="text-4xl sm:text-5xl mb-4">📝</div>
                  <p className="text-sm sm:text-base text-[var(--foreground)] opacity-70">No topics found in this level</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {topics.map((topic, index) => (
                    <button
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left hover:shadow-xl hover:border-green-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] line-clamp-1">{topic.name}</h3>
                          {topic.description && (
                            <p className="text-[10px] sm:text-xs text-[var(--foreground)] opacity-70 mt-1 line-clamp-2">
                              {topic.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs sm:text-sm text-green-500 flex items-center gap-1">
                            View Quizzes
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quizzes List */}
          {step === "quizzes" && !dbNotReady && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
                  Quizzes in {selectedTopic?.name}
                </h2>
                <button
                  onClick={navigateToCreateQuiz}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-violet-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>➕</span>
                  Create Quiz
                </button>
              </div>

              {quizzes.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl">
                  <div className="text-4xl sm:text-6xl mb-4">🎮</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-2">
                    No quizzes yet
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--foreground)] opacity-70 mb-4 sm:mb-6">
                    Create your first quiz for this topic
                  </p>
                  <button
                    onClick={navigateToCreateQuiz}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-violet-600 hover:to-purple-700 transition-all"
                  >
                    Create Quiz
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl">
                          🎮
                        </div>
                        <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-lg border ${getStatusColor(quiz.status)}`}>
                          {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] mb-1 sm:mb-2 line-clamp-1">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-xs sm:text-sm text-[var(--foreground)] opacity-70 mb-3 sm:mb-4 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                        <div className="text-center p-1.5 sm:p-2 bg-violet-50 rounded-lg">
                          <p className="text-sm sm:text-lg font-bold text-violet-600">{quiz.questions_count}</p>
                          <p className="text-[8px] sm:text-xs text-violet-600">Questions</p>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-green-50 rounded-lg">
                          <p className="text-sm sm:text-lg font-bold text-green-600">{quiz.total_points}</p>
                          <p className="text-[8px] sm:text-xs text-green-600">Points</p>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                          <p className="text-sm sm:text-lg font-bold text-blue-600">{quiz.passing_score}%</p>
                          <p className="text-[8px] sm:text-xs text-blue-600">Pass</p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateToQuizEditor(quiz.id)}
                        className="w-full px-3 sm:px-4 py-2 bg-violet-500 text-white text-xs sm:text-sm rounded-xl font-medium hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>✏️</span>
                        Edit Quiz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
