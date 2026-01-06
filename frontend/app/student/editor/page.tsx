"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api/client";

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editorUrl = searchParams.get("url");
  const courseId = searchParams.get("courseId");
  const levelId = searchParams.get("levelId");
  const topicId = searchParams.get("topicId");

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showExternalMessage, setShowExternalMessage] = useState(false);

  useEffect(() => {
    if (topicId) {
      fetchQuizzes();
    }
  }, [topicId]);

  // Detect if iframe is blocked after a timeout
  useEffect(() => {
    if (!editorUrl) return;

    const timeout = setTimeout(() => {
      // If still loading after 5 seconds, might be blocked
      if (iframeLoading) {
        // Check if it's an external editor that might be blocked
        const isExternal = editorUrl.includes('scratch.mit.edu') || 
                          editorUrl.includes('code.org') || 
                          editorUrl.includes('applab.code.org');
        if (isExternal) {
          setIframeError(true);
          setShowExternalMessage(true);
        }
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [editorUrl, iframeLoading]);

  const fetchQuizzes = async () => {
    if (!topicId) return;
    try {
      const response = await apiClient.get(`/quizzes/topic/${topicId}`);
      setQuizzes(response.data || []);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/student/quiz/${quizId}`);
  };

  const handleBack = () => {
    // Always go to dashboard to avoid class code re-entry
    router.push("/student/dashboard");
  };

  if (!editorUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Editor URL</h3>
          <p className="text-gray-600 mb-4">No editor link was provided.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if editor is external (might not be embeddable)
  const isExternalEditor = editorUrl && (
    editorUrl.includes('scratch.mit.edu') ||
    editorUrl.includes('code.org') ||
    editorUrl.includes('applab.code.org') ||
    (typeof window !== 'undefined' && !editorUrl.startsWith(window.location.origin))
  );

  const handleOpenExternalEditor = () => {
    if (editorUrl) {
      const newWindow = window.open(editorUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        alert('Popup blocked. Please allow popups for this site to open the editor.');
      }
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoading(false);
    setShowExternalMessage(true);
  };

  const handleRetryIframe = () => {
    setIframeError(false);
    setIframeLoading(true);
    setShowExternalMessage(false);
    // Force iframe reload by changing key
    const iframe = document.querySelector('iframe[title="Code Editor"]') as HTMLIFrameElement;
    if (iframe && editorUrl) {
      iframe.src = '';
      setTimeout(() => {
        iframe.src = editorUrl;
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Static Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Code Editor</span>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            <button
              onClick={() => router.push("/student/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </button>

            {topicId && (
              <button
                onClick={() => setShowQuizModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quiz</span>
              </button>
            )}

            <button
              onClick={() => router.push("/student/profile/update")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </button>

            <button
              onClick={() => router.push("/student/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>End Class</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        {showExternalMessage && iframeError ? (
          /* External Editor - Show message and link */
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-white">
            <div className="text-center max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Editor Cannot Be Embedded
              </h3>
              <p className="text-gray-600 mb-6">
                This editor cannot be embedded due to security restrictions (X-Frame-Options). 
                Please open it in a new tab to use it.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleOpenExternalEditor}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Editor in New Tab
                </button>
                <button
                  onClick={handleRetryIframe}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Embedding Again
                </button>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
              {editorUrl && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Editor URL:</p>
                  <p className="text-xs text-gray-700 break-all">{editorUrl}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Try to embed editor - will show error if blocked */
          <>
            <iframe
              key={editorUrl} // Force re-render on URL change
              src={editorUrl}
              className="w-full h-full border-0"
              title="Code Editor"
              allow="clipboard-read; clipboard-write; fullscreen"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            {/* Loading overlay */}
            {iframeLoading && !iframeError && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading editor...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No quizzes available for this topic yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => {
                      handleQuizClick(quiz.id);
                      setShowQuizModal(false);
                    }}
                    className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{quiz.questions_count || 0} questions</span>
                          {quiz.time_limit_minutes > 0 && (
                            <span>{quiz.time_limit_minutes} min</span>
                          )}
                          <span>{quiz.total_points || 0} points</span>
                        </div>
                      </div>
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

