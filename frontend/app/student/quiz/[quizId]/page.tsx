"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api/client";
import confetti from "canvas-confetti";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  total_points: number;
  questions_count: number;
  questions?: Question[];
}

interface Question {
  id: string;
  question_text: string;
  points: number;
  options?: Option[];
}

interface Option {
  id: string;
  option_text: string;
  is_correct?: boolean;
}

interface AttemptResult {
  attempt: any;
  correct_answers: number;
  total_questions: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  is_new_high_score: boolean;
  points_earned: number;
  total_points: number;
  answers: {
    question: Question;
    selected_option?: Option;
    correct_option: Option;
    is_correct: boolean;
    points_earned: number;
  }[];
}

type GameState = "start" | "playing" | "results";

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = Array.isArray(params.quizId) ? params.quizId[0] : params.quizId;

  const [gameState, setGameState] = useState<GameState>("start");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  useEffect(() => {
    if (gameState === "playing" && quiz?.time_limit_minutes && quiz.time_limit_minutes > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Call handleSubmitQuiz when time runs out
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, quiz]);

  // Safety check: if playing but no attemptId, redirect to start
  useEffect(() => {
    if (gameState === "playing" && !attemptId) {
      console.error("Playing state but no attemptId - resetting to start");
      setGameState("start");
      alert("Error: Quiz attempt was not initialized. Please start the quiz again.");
    }
  }, [gameState, attemptId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/quizzes/student/${quizId}?shuffle=true`);
      setQuiz(response.data);
      if (response.data.time_limit_minutes) {
        setTimeLeft(response.data.time_limit_minutes * 60);
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const response = await apiClient.post("/quizzes/attempts/start", {
        quiz_id: quizId,
      });
      console.log("Start attempt response:", response.data);
      if (response.data && response.data.id) {
        setAttemptId(response.data.id);
        setStartTime(Date.now());
        setGameState("playing");
      } else {
        console.error("No attempt ID in response:", response.data);
        alert("Failed to start quiz: No attempt ID received");
      }
    } catch (err: any) {
      console.error("Error starting quiz:", err);
      alert(err.response?.data?.message || "Failed to start quiz");
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !quiz?.questions) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOpt = currentQuestion.options?.find((o) => o.id === selectedOption);
    const correct = selectedOpt?.is_correct || false;

    setIsCorrect(correct);
    setShowFeedback(true);

    // Update answers
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOption,
    }));

    // Update streak and score for visual feedback
    if (correct) {
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + currentQuestion.points);
      
      // Confetti on correct answer
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#EC4899", "#10B981"],
      });
    } else {
      setStreak(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions!.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        handleSubmitQuiz();
      }
    }, 1500);
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId) {
      console.error("Cannot submit: No attempt ID", { attemptId, hasQuestions: !!quiz?.questions, submitting });
      alert("Error: Attempt ID is missing. Please start the quiz again.");
      return;
    }
    
    if (!quiz?.questions || submitting) {
      console.error("Cannot submit:", { attemptId, hasQuestions: !!quiz?.questions, submitting });
      return;
    }

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const answersArray = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] || selectedOption || "",
      }));

      console.log("Submitting quiz:", { attempt_id: attemptId, answersCount: answersArray.length, timeSpent });

      const response = await apiClient.post("/quizzes/attempts/submit", {
        attempt_id: attemptId,
        answers: answersArray,
        time_spent_seconds: timeSpent,
      });

      setResult(response.data);
      setGameState("results");

      // Big confetti celebration for passing
      if (response.data.passed) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            colors: ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B"],
          });
        }, 500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4 text-xl">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold">Quiz not found</h1>
        </div>
      </div>
    );
  }

  // Start Screen
  if (gameState === "start") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform hover:scale-105 transition-transform">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg animate-bounce">
            🎮
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-violet-100 rounded-2xl p-4">
              <p className="text-2xl font-bold text-violet-600">{quiz.questions_count}</p>
              <p className="text-xs text-violet-600">Questions</p>
            </div>
            <div className="bg-green-100 rounded-2xl p-4">
              <p className="text-2xl font-bold text-green-600">{quiz.total_points}</p>
              <p className="text-xs text-green-600">Points</p>
            </div>
            <div className="bg-amber-100 rounded-2xl p-4">
              <p className="text-2xl font-bold text-amber-600">
                {quiz.time_limit_minutes || "∞"}
              </p>
              <p className="text-xs text-amber-600">Minutes</p>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🚀 Start Quiz!
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (gameState === "results" && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Result Card */}
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mb-6">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 ${
              result.passed 
                ? "bg-gradient-to-br from-green-400 to-emerald-500" 
                : "bg-gradient-to-br from-amber-400 to-orange-500"
            }`}>
              {result.passed ? "🏆" : "💪"}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result.passed ? "Congratulations!" : "Good Effort!"}
            </h1>
            <p className="text-gray-600 mb-8">
              {result.passed
                ? "You passed the quiz! Keep up the great work!"
                : "You didn't pass this time, but don't give up!"}
            </p>

            {/* Score Circle */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={result.passed ? "#10B981" : "#F59E0B"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - result.percentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {Math.round(result.percentage)}%
                </span>
                <span className="text-sm text-gray-500">Score</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-violet-100 rounded-2xl p-4">
                <p className="text-xl font-bold text-violet-600">{result.correct_answers}</p>
                <p className="text-xs text-violet-600">Correct</p>
              </div>
              <div className="bg-red-100 rounded-2xl p-4">
                <p className="text-xl font-bold text-red-600">
                  {result.total_questions - result.correct_answers}
                </p>
                <p className="text-xs text-red-600">Wrong</p>
              </div>
              <div className="bg-green-100 rounded-2xl p-4">
                <p className="text-xl font-bold text-green-600">{result.score}</p>
                <p className="text-xs text-green-600">Points</p>
              </div>
              <div className="bg-amber-100 rounded-2xl p-4">
                <p className="text-xl font-bold text-amber-600">{result.total_points}</p>
                <p className="text-xs text-amber-600">Total Pts</p>
              </div>
            </div>

            {/* New High Score Badge */}
            {result.is_new_high_score && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-4 mb-6 animate-pulse">
                <p className="text-lg font-bold">🎉 NEW HIGH SCORE! 🎉</p>
                <p className="text-sm opacity-90">
                  You earned {result.points_earned} new points!
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              🔄 Try Again
            </button>
          </div>

          {/* Answer Review */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Review Answers</h2>
            <div className="space-y-4">
              {result.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 ${
                    answer.is_correct
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                      answer.is_correct ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {answer.is_correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        {index + 1}. {answer.question.question_text}
                      </p>
                      {answer.selected_option && !answer.is_correct && (
                        <p className="text-sm text-red-600 mb-1">
                          Your answer: {answer.selected_option.option_text}
                        </p>
                      )}
                      <p className="text-sm text-green-600">
                        Correct: {answer.correct_option.option_text}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      answer.is_correct ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}>
                      +{answer.points_earned} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="bg-white rounded-xl px-4 py-2">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-xl font-bold text-violet-600">{score}</p>
            </div>
            {/* Streak */}
            {streak > 1 && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl px-4 py-2 text-white animate-pulse">
                <p className="text-sm">🔥 Streak</p>
                <p className="text-xl font-bold">{streak}x</p>
              </div>
            )}
          </div>

          {/* Timer */}
          {quiz.time_limit_minutes > 0 && (
            <div className={`bg-white rounded-xl px-4 py-2 ${timeLeft < 60 ? "animate-pulse" : ""}`}>
              <p className="text-sm text-gray-600">Time</p>
              <p className={`text-xl font-bold ${timeLeft < 60 ? "text-red-600" : "text-gray-900"}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white text-center mt-2 text-sm opacity-80">
          Question {currentQuestionIndex + 1} of {quiz.questions?.length}
        </p>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {/* Points Badge */}
            <div className="flex justify-between items-center mb-4">
              <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ {currentQuestion.points} points
              </span>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-2xl border-3 text-left transition-all transform ${
                    showFeedback
                      ? option.is_correct
                        ? "border-green-500 bg-green-100 scale-105"
                        : selectedOption === option.id
                        ? "border-red-500 bg-red-100"
                        : "border-gray-200 bg-gray-50 opacity-50"
                      : selectedOption === option.id
                      ? "border-violet-500 bg-violet-50 scale-105 shadow-lg"
                      : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50 hover:scale-102"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        showFeedback
                          ? option.is_correct
                            ? "bg-green-500 text-white"
                            : selectedOption === option.id
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-600"
                          : selectedOption === option.id
                          ? "bg-violet-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {showFeedback && option.is_correct
                        ? "✓"
                        : showFeedback && selectedOption === option.id
                        ? "✗"
                        : String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-lg text-gray-900">{option.option_text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            {!showFeedback && (
              <button
                onClick={handleConfirmAnswer}
                disabled={!selectedOption}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-xl transition-all ${
                  selectedOption
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedOption ? "Confirm Answer ✓" : "Select an Answer"}
              </button>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div
                className={`mt-6 p-4 rounded-2xl text-center ${
                  isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p className={`text-2xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "🎉 Correct!" : "😅 Not quite!"}
                </p>
                <p className="text-sm mt-1 opacity-70">
                  {currentQuestionIndex < (quiz.questions?.length || 0) - 1
                    ? "Next question coming..."
                    : "Calculating results..."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

