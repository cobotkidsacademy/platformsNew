"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api/client";
import { Quiz, CreateQuizForm, QUIZ_STATUS_OPTIONS, getStatusColor } from "./types";

export default function QuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId, topicId: topicIdParam } = params;
  
  // Ensure topicId is a string (Next.js params can be string | string[])
  const topicId = Array.isArray(topicIdParam) ? topicIdParam[0] : topicIdParam;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<CreateQuizForm>({
    title: "",
    description: "",
    time_limit_minutes: 0,
    passing_score: 60,
    shuffle_questions: false,
    shuffle_options: false,
    show_correct_answers: true,
    allow_retake: true,
    status: "draft",
  });

  useEffect(() => {
    if (topicId) {
      fetchTopic();
      fetchQuizzes();
    } else {
      console.error("Topic ID is missing from URL params");
      setLoading(false);
    }
  }, [topicId]);

  const fetchTopic = async () => {
    if (!topicId) {
      console.error("Cannot fetch topic: topicId is missing");
      return;
    }
    try {
      const response = await apiClient.get(`/courses/topics/${topicId}`);
      setTopic(response.data);
      console.log("Topic fetched:", response.data);
    } catch (err: any) {
      console.error("Error fetching topic:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch topic";
      alert(`Error loading topic: ${errorMessage}`);
    }
  };

  const fetchQuizzes = async () => {
    if (!topicId) {
      console.error("Cannot fetch quizzes: topicId is missing");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.get(`/quizzes/topic/${topicId}`);
      setQuizzes(response.data || []);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      // If tables don't exist, just show empty state
      if (err?.response?.data?.message?.includes("Could not find") ||
          err?.response?.data?.message?.includes("does not exist") ||
          err?.response?.data?.message?.includes("relationship")) {
        setQuizzes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (!topicId) {
      alert("Topic ID is missing. Please refresh the page.");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        topic_id: String(topicId), // Ensure it's a string
        title: formData.title.trim(),
        description: formData.description || undefined,
        time_limit_minutes: formData.time_limit_minutes || 0,
        passing_score: formData.passing_score || 60,
        shuffle_questions: formData.shuffle_questions || false,
        shuffle_options: formData.shuffle_options || false,
        show_correct_answers: formData.show_correct_answers !== false,
        allow_retake: formData.allow_retake !== false,
        status: formData.status || 'draft',
      };
      console.log("Creating quiz with payload:", payload);
      console.log("Topic ID type:", typeof topicId, "Value:", topicId);
      await apiClient.post("/quizzes", payload);
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        time_limit_minutes: 0,
        passing_score: 60,
        shuffle_questions: false,
        shuffle_options: false,
        show_correct_answers: true,
        allow_retake: true,
        status: "draft",
      });
      fetchQuizzes();
    } catch (err: any) {
      console.error("Error creating quiz:", err);
      let errorMessage = "Failed to create quiz";
      
      if (err.response?.data?.message) {
        // Handle validation errors (can be array or string)
        const message = err.response.data.message;
        if (Array.isArray(message)) {
          errorMessage = message.join("\n");
        } else {
          errorMessage = message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.delete(`/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete quiz");
    }
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-70">
        <Link href="/admin/courses" className="hover:text-violet-500 transition-colors">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}`} className="hover:text-violet-500 transition-colors">
          {topic?.level?.course?.name || "Course"}
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}/levels/${levelId}`} className="hover:text-violet-500 transition-colors">
          {topic?.level?.name || "Level"}
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}`} className="hover:text-violet-500 transition-colors">
          {topic?.name || "Topic"}
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">Quizzes</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            🎯 Quizzes
          </h1>
          <p className="text-[var(--foreground)] opacity-70 mt-1">
            Manage quizzes for {topic?.name || "this topic"}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          Create Quiz
        </button>
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No quizzes yet
          </h3>
          <p className="text-[var(--foreground)] opacity-70 mb-6">
            Create your first quiz to test student knowledge
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  🎮
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(quiz.status)}`}>
                  {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                </span>
              </div>

              {/* Quiz Info */}
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              {quiz.description && (
                <p className="text-sm text-[var(--foreground)] opacity-70 mb-4 line-clamp-2">
                  {quiz.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-violet-50 rounded-lg">
                  <p className="text-lg font-bold text-violet-600">{quiz.questions_count}</p>
                  <p className="text-xs text-violet-600 opacity-80">Questions</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{quiz.total_points}</p>
                  <p className="text-xs text-green-600 opacity-80">Points</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{quiz.passing_score}%</p>
                  <p className="text-xs text-blue-600 opacity-80">To Pass</p>
                </div>
              </div>

              {/* Settings Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quiz.time_limit_minutes > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                    ⏱️ {quiz.time_limit_minutes} min
                  </span>
                )}
                {quiz.shuffle_questions && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    🔀 Shuffle
                  </span>
                )}
                {quiz.allow_retake && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    🔄 Retakes
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <Link
                  href={`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}/quizzes/${quiz.id}`}
                  className="flex-1 px-4 py-2 bg-violet-500 text-white text-center rounded-lg font-medium hover:bg-violet-600 transition-colors"
                >
                  Edit Quiz
                </Link>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg border border-[var(--border)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Create New Quiz
                </h2>
                <p className="text-sm text-[var(--foreground)] opacity-70">
                  Set up quiz details and settings
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quiz title"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter quiz description"
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Time Limit */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="0 = No limit"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 60 })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {QUIZ_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3 p-4 bg-[var(--background)] rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shuffle_questions}
                    onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-[var(--foreground)]">🔀 Shuffle questions</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shuffle_options}
                    onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-[var(--foreground)]">🎲 Shuffle answer options</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_correct_answers}
                    onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-[var(--foreground)]">✅ Show correct answers after quiz</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_retake}
                    onChange={(e) => setFormData({ ...formData, allow_retake: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border)] text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-[var(--foreground)]">🔄 Allow students to retake</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-xl hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.title.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

