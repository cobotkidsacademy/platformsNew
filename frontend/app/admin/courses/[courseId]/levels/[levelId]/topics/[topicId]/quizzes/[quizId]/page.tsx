"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api/client";
import {
  Quiz,
  QuizQuestion,
  QuizOption,
  CreateQuestionForm,
  QUESTION_TYPES,
  QUIZ_STATUS_OPTIONS,
  getStatusColor,
} from "../types";

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, levelId, topicId: topicIdParam, quizId: quizIdParam } = params;
  
  // Ensure IDs are strings (Next.js params can be string | string[])
  const topicId = Array.isArray(topicIdParam) ? topicIdParam[0] : topicIdParam;
  const quizId = Array.isArray(quizIdParam) ? quizIdParam[0] : quizIdParam;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<CreateQuestionForm>({
    question_text: "",
    question_type: "multiple_choice",
    points: 10,
    explanation: "",
    options: [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (err) {
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async (updates: Partial<Quiz>) => {
    try {
      setSaving(true);
      await apiClient.put(`/quizzes/${quizId}`, updates);
      fetchQuiz();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question_text: "",
      question_type: "multiple_choice",
      points: 10,
      explanation: "",
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_text: question.question_text,
      question_type: question.question_type,
      points: question.points,
      explanation: question.explanation || "",
      options: question.options?.map((o) => ({
        option_text: o.option_text,
        is_correct: o.is_correct,
      })) || [],
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!quizId) {
      alert("Quiz ID is missing. Please refresh the page.");
      return;
    }

    if (!questionForm.question_text.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = questionForm.options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    if (!validOptions.some((o) => o.is_correct)) {
      alert("Please mark at least one option as correct");
      return;
    }

    try {
      setSaving(true);

      if (editingQuestion) {
        // Update existing question
        await apiClient.put(`/quizzes/questions/${editingQuestion.id}`, {
          question_text: questionForm.question_text,
          question_type: questionForm.question_type,
          points: questionForm.points,
          explanation: questionForm.explanation || null,
        });

        // Delete old options and create new ones
        if (editingQuestion.options) {
          for (const option of editingQuestion.options) {
            await apiClient.delete(`/quizzes/options/${option.id}`);
          }
        }

        for (let i = 0; i < validOptions.length; i++) {
          await apiClient.post("/quizzes/options", {
            question_id: editingQuestion.id,
            option_text: validOptions[i].option_text,
            is_correct: validOptions[i].is_correct,
            order_position: i,
          });
        }
      } else {
        // Create new question
        const payload = {
          quiz_id: String(quizId), // Ensure it's a string
          question_text: questionForm.question_text.trim(),
          question_type: questionForm.question_type || 'multiple_choice',
          points: questionForm.points || 10,
          explanation: questionForm.explanation || null,
          options: validOptions.map((o, i) => ({
            option_text: o.option_text.trim(),
            is_correct: o.is_correct,
            order_position: i,
          })),
        };
        console.log("Creating question with payload:", payload);
        console.log("Quiz ID type:", typeof quizId, "Value:", quizId);
        await apiClient.post("/quizzes/questions", payload);
      }

      setShowQuestionModal(false);
      fetchQuiz();
    } catch (err: any) {
      console.error("Error saving question:", err);
      let errorMessage = "Failed to save question";
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        errorMessage = Array.isArray(message) ? message.join("\n") : message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await apiClient.delete(`/quizzes/questions/${questionId}`);
      fetchQuiz();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...questionForm.options];
    if (field === "is_correct" && value === true) {
      // For single choice, only one can be correct
      if (questionForm.question_type !== "multi_select") {
        newOptions.forEach((o, i) => {
          newOptions[i] = { ...o, is_correct: i === index };
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { option_text: "", is_correct: false }],
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) return;
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--foreground)]">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-70">
        <Link href="/admin/courses" className="hover:text-violet-500 transition-colors">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}/quizzes`} className="hover:text-violet-500 transition-colors">
          Quizzes
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{quiz.title}</span>
      </div>

      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur">
              🎯
            </div>
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-white/80 mt-1">{quiz.description}</p>
              )}
            </div>
          </div>
          <select
            value={quiz.status}
            onChange={(e) => handleUpdateQuiz({ status: e.target.value as any })}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
          >
            {QUIZ_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-3xl font-bold">{quiz.questions_count}</p>
            <p className="text-sm text-white/80">Questions</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-3xl font-bold">{quiz.total_points}</p>
            <p className="text-sm text-white/80">Total Points</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-3xl font-bold">{quiz.passing_score}%</p>
            <p className="text-sm text-white/80">To Pass</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <p className="text-3xl font-bold">{quiz.time_limit_minutes || "∞"}</p>
            <p className="text-sm text-white/80">Minutes</p>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Questions ({quiz.questions?.length || 0})
        </h2>
        <button
          onClick={handleAddQuestion}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2"
        >
          <span>➕</span>
          Add Question
        </button>
      </div>

      {/* Questions List */}
      {quiz.questions && quiz.questions.length > 0 ? (
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Question Number */}
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                  {index + 1}
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[var(--foreground)] font-medium text-lg">
                        {question.question_text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-lg">
                          {question.question_type.replace("_", " ")}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                          {question.points} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-3">
                    {question.options?.map((option, optIndex) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                          option.is_correct
                            ? "border-green-500 bg-green-50"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          option.is_correct
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className={`text-sm ${option.is_correct ? "text-green-700 font-medium" : "text-[var(--foreground)]"}`}>
                          {option.option_text}
                        </span>
                        {option.is_correct && (
                          <span className="ml-auto text-green-500">✓</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">💡 Explanation:</span> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No questions yet
          </h3>
          <p className="text-[var(--foreground)] opacity-70 mb-6">
            Add questions to make your quiz ready
          </p>
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            Add Your First Question
          </button>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                ❓
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {editingQuestion ? "Edit Question" : "Add Question"}
                </h2>
                <p className="text-sm text-[var(--foreground)] opacity-70">
                  Create a multiple choice question
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Question *
                </label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Enter your question..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Question Type & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Question Type
                  </label>
                  <select
                    value={questionForm.question_type}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 10 })}
                    min="1"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Answer Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    Answer Options *
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-violet-500 hover:text-violet-600 font-medium"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleOptionChange(index, "is_correct", !option.is_correct)}
                        className={`px-3 py-2 rounded-xl font-medium transition-all ${
                          option.is_correct
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {option.is_correct ? "✓ Correct" : "Mark Correct"}
                      </button>
                      {questionForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Explanation (shown after answering)
                </label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Explain why the correct answer is correct..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-xl hover:bg-[var(--background)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingQuestion ? "Update Question" : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

