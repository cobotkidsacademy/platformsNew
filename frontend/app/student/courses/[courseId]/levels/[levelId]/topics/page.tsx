"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface Topic {
  id: string;
  title: string;
  description: string;
  order_index: number;
  notes_count: number;
}

interface NoteElement {
  id: string;
  element_type: string;
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  font_size?: number;
  font_weight?: string;
  font_family?: string;
  font_color?: string;
  text_align?: string;
  background_color?: string;
  order_index?: number;
}

interface LevelInfo {
  id: string;
  name: string;
  level_number: number;
  course_name: string;
  enrollment_status: string;
}

export default function TopicsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const levelId = params.levelId as string;

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [notes, setNotes] = useState<NoteElement[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Class code states
  const [isVerified, setIsVerified] = useState(false);
  const [classCode, setClassCode] = useState(["", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Course editor states
  const [courseEditorLink, setCourseEditorLink] = useState<string | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(false);

  useEffect(() => {
    fetchLevelData();
    fetchCourseEditor();
  }, [levelId, courseId]);

  const fetchCourseEditor = async () => {
    try {
      setLoadingEditor(true);
      const response = await apiClient.get(`/allocations/course-editors`);
      console.log("Course editor response:", response.data);
      console.log("Looking for courseId:", courseId);
      const assignment = response.data?.find((a: any) => a.course_id === courseId);
      console.log("Found assignment:", assignment);
      if (assignment && assignment.editor_link) {
        setCourseEditorLink(assignment.editor_link);
      } else {
        setCourseEditorLink(null);
      }
    } catch (err: any) {
      console.error("Error fetching course editor:", err);
      setCourseEditorLink(null);
    } finally {
      setLoadingEditor(false);
    }
  };

  const handleTryOut = () => {
    if (courseEditorLink) {
      // Navigate to editor page with URL and context
      const editorUrl = `/student/editor?url=${encodeURIComponent(courseEditorLink)}&courseId=${courseId}&levelId=${levelId}${selectedTopic ? `&topicId=${selectedTopic.id}` : ''}`;
      router.push(editorUrl);
    } else {
      alert("No editor assigned to this course yet.");
    }
  };

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch level info and topics
      const response = await apiClient.get(`/student-courses/level/${levelId}/details`);
      setLevelInfo(response.data.level);
      setTopics(response.data.topics || []);

      // Auto-verify if:
      // 1. Level is completed, OR
      // 2. Code was already verified (stored in sessionStorage)
      const isAlreadyVerified = sessionStorage.getItem(`level_verified_${levelId}`) === 'true';
      if (response.data.level?.enrollment_status === "completed" || isAlreadyVerified) {
        setIsVerified(true);
        // Keep the sessionStorage for navigation back from editor
        // Only clear it when explicitly logging out or ending class
      }
    } catch (err: any) {
      console.error("Error fetching level data:", err);
      setError(err.response?.data?.message || "Failed to load level data");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const newCode = [...classCode];
    newCode[index] = numericValue.slice(0, 1);
    setClassCode(newCode);
    setCodeError("");

    // Auto-focus next input
    if (numericValue && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !classCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = classCode.join("");
    if (code.length !== 3) {
      setCodeError("Please enter all 3 digits");
      return;
    }

    setVerifying(true);
    setCodeError("");

    try {
      const response = await apiClient.post("/student-courses/validate-code", {
        course_level_id: levelId,
        code: code,
      });

      if (response.data.valid) {
        setIsVerified(true);
      } else {
        setCodeError(response.data.message || "Invalid code");
      }
    } catch (err: any) {
      setCodeError(err.response?.data?.message || "Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setLoadingNotes(true);

    try {
      const response = await apiClient.get(`/student-courses/topic/${topic.id}/notes`);
      setNotes(response.data || []);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleEndClass = () => {
    router.push("/student/dashboard");
  };

  const renderNoteElement = (element: NoteElement) => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: element.position_x,
      top: element.position_y,
      width: element.width,
      height: element.height,
      zIndex: element.z_index,
      fontSize: element.font_size || 16,
      fontWeight: element.font_weight || "normal",
      fontFamily: element.font_family || "Inter",
      color: element.font_color || "#000000",
      textAlign: (element.text_align as any) || "left",
      backgroundColor: element.background_color || "transparent",
    };

    switch (element.element_type) {
      case "text":
        return (
          <div key={element.id} style={baseStyle} className="p-2 overflow-auto">
            {element.content}
          </div>
        );
      case "image":
        return (
          <div key={element.id} style={baseStyle} className="overflow-hidden">
            <img
              src={element.content}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        );
      default:
        return (
          <div key={element.id} style={baseStyle} className="p-2">
            {element.content}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">COBOT</span>
            </div>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>/</span>
              <span className="text-blue-600">{levelInfo?.course_name}</span>
              <span>/</span>
              <span className="font-medium text-gray-900">Level {levelInfo?.level_number}</span>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>

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
              onClick={handleEndClass}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Class Code or Topics List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {!isVerified ? (
            /* Class Code Entry */
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Class Code</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Get the 3-digit code from your tutor to access this content
              </p>

              {/* Code Input */}
              <div className="flex gap-3 mb-4">
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={classCode[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {codeError && (
                <p className="text-sm text-red-500 mb-4">{codeError}</p>
              )}

              <button
                onClick={handleVerifyCode}
                disabled={verifying || classCode.join("").length !== 3}
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>
          ) : (
            /* Topics List */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">Topics</h2>
                <p className="text-xs text-gray-500">{topics.length} topics available</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {topics.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No topics yet</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {topics.map((topic, index) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSelectTopic(topic)}
                        className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                          selectedTopic?.id === topic.id
                            ? "bg-blue-50 border-2 border-blue-500"
                            : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            selectedTopic?.id === topic.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {topic.notes_count} notes
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Notes Content */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {!isVerified ? (
            /* Locked State */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Content Locked</h3>
                <p className="text-gray-500">Enter the class code to view content</p>
              </div>
            </div>
          ) : !selectedTopic ? (
            /* No Topic Selected */
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Topic</h3>
                <p className="text-gray-500">Choose a topic from the left to view notes</p>
              </div>
            </div>
          ) : loadingNotes ? (
            /* Loading Notes */
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            /* Notes Content */
            <div className="h-full flex flex-col">
              {/* Topic Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{selectedTopic.title}</h2>
                    {selectedTopic.description && (
                      <p className="text-sm text-gray-500 mt-1">{selectedTopic.description}</p>
                    )}
                  </div>
                  <button
                    onClick={handleTryOut}
                    disabled={!courseEditorLink || loadingEditor}
                    className={`ml-4 px-4 py-2 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                      courseEditorLink && !loadingEditor
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loadingEditor ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Try Out
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Notes Canvas */}
              <div className="flex-1 overflow-auto p-4">
                {notes.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">No notes in this topic yet</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white rounded-xl shadow-sm border border-gray-200 relative"
                    style={{ minHeight: "600px", width: "100%" }}
                  >
                    {notes.map(renderNoteElement)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
