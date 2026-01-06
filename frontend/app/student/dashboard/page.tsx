"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import StudentCoursesView from "../courses/components/StudentCoursesView";

type ActiveView = "class-code" | "courses" | "report" | "message";

interface StudentInfo {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  last_login?: string;
  login_count?: number;
  class?: {
    id: string;
    name: string;
    level: string;
  };
  school?: {
    id: string;
    name: string;
    code: string;
  };
}

interface CourseWithEnrollment {
  id: string;
  name: string;
  code: string;
  icon_image_url?: string;
  description?: string;
  enrollment_status: 'not_enrolled' | 'enrolled' | 'completed';
  progress_percentage: number;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>("courses");
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  // Stats
  const [stats, setStats] = useState({
    completedCourses: 0,
    totalCourses: 0,
    inProgress: 0,
    certificates: 0,
    points: 0,
  });

  // Capitalize name helper
  const capitalizeName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const token = localStorage.getItem("student_token");
      const userStr = localStorage.getItem("student_user");

      if (!token || !userStr) {
        router.push("/student/login");
        return;
      }

      try {
        const response = await apiClient.get("/auth/student/me");
        setStudent(response.data);
        setProfileImageUrl(response.data.profile_image_url || "");

        // Fetch points using JWT auth
        try {
          console.log("=== FETCHING POINTS ===");
          console.log("Student ID from response:", response.data.id);
          console.log("Student token exists:", !!localStorage.getItem("student_token"));
          
          const pointsResponse = await apiClient.get(`/quizzes/student-points`);
          console.log("=== POINTS RESPONSE ===");
          console.log("Full response:", pointsResponse);
          console.log("Response data:", pointsResponse.data);
          console.log("Total points:", pointsResponse.data?.total_points);
          console.log("Response status:", pointsResponse.status);
          
          const points = pointsResponse.data?.total_points ?? 0;
          console.log("Setting points to:", points);
          
          setStats((prev) => ({
            ...prev,
            points: points,
          }));
        } catch (err: any) {
          console.error("=== POINTS FETCH ERROR ===");
          console.error("Error object:", err);
          console.error("Error message:", err.message);
          console.error("Error code:", err.code);
          console.error("Error response:", err.response);
          console.error("Error response data:", err.response?.data);
          console.error("Error response status:", err.response?.status);
          
          // If it's a network error, the backend might not be running
          if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            console.error("❌ Backend server is not running. Please start the backend server on port 3001.");
          }
          
          // Set to 0 if not available
          setStats((prev) => ({
            ...prev,
            points: 0,
          }));
        }

        // Fetch courses with enrollment status
        try {
          const coursesResponse = await apiClient.get("/enrollments/me/courses");
          setCourses(coursesResponse.data || []);
          
          // Update stats from enrollments
          const enrolled = coursesResponse.data?.filter((c: CourseWithEnrollment) => c.enrollment_status === 'enrolled').length || 0;
          const completed = coursesResponse.data?.filter((c: CourseWithEnrollment) => c.enrollment_status === 'completed').length || 0;
          const total = coursesResponse.data?.length || 0;
          
          setStats((prev) => ({
            ...prev,
            totalCourses: total,
            enrolled: enrolled,
            completedCourses: completed,
            inProgress: enrolled,
          }));
        } catch (err) {
          console.log("Could not fetch courses yet");
        }

        // Fetch enrollment stats
        try {
          const statsResponse = await apiClient.get("/enrollments/me/stats");
          setStats((prev) => ({
            ...prev,
            totalCourses: statsResponse.data?.total || prev.totalCourses,
            completedCourses: statsResponse.data?.completed || prev.completedCourses,
            inProgress: statsResponse.data?.enrolled || prev.inProgress,
          }));
        } catch (err) {
          console.log("Could not fetch enrollment stats yet");
        }
      } catch (err: any) {
        console.error("Error fetching student info:", err);
        if (err.response?.status === 401) {
          router.push("/student/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    router.push("/student/login");
  };


  const handleEnrollCourse = async (courseId: string) => {
    try {
      await apiClient.put(`/enrollments/me/course/${courseId}`, {
        status: "enrolled",
      });
      // Refresh courses
      const coursesResponse = await apiClient.get("/enrollments/me/courses");
      setCourses(coursesResponse.data || []);
      alert("Successfully enrolled in course!");
    } catch (err: any) {
      console.error("Error enrolling in course:", err);
      alert("Failed to enroll in course. Please try again.");
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                <div className="text-2xl">🤖</div>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">COBOT KIDS KENYA</h1>
                <p className="text-sm text-gray-500">Smart Robotics, Brighter Future</p>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/student/profile")}
                className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-base"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-base"
              >
                END CLASS
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="w-full mx-auto px-6 sm:px-8 lg:px-12 py-6 flex-1 flex flex-col">
        {/* Profile and Stats Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Profile Picture and Info */}
            <div className="flex gap-6 flex-1">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {student.profile_image_url ? (
                  <img
                    src={student.profile_image_url}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.className = 'text-5xl font-bold text-gray-400';
                        fallback.textContent = student.first_name.charAt(0).toUpperCase();
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <span className="text-5xl font-bold text-gray-400">
                    {student.first_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Information */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {capitalizeName(student.first_name)} {capitalizeName(student.last_name)}
                </h2>
                <div className="space-y-2">
                  {student.class && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-600 font-medium">Class :</span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-semibold text-base">
                        {student.class.name}
                      </span>
                    </div>
                  )}
                  {student.school && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-gray-600 font-medium">School:</span>
                      <span className="text-orange-600 font-semibold text-base">
                        {student.school.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-600 font-medium">Username:</span>
                    <span className="text-orange-600 font-semibold text-base">
                      {student.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-600 font-medium">Points:</span>
                    <span className="text-green-600 font-bold text-xl">
                      {stats.points}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 lg:w-80">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.totalCourses}
                </div>
                <div className="text-sm text-gray-600 font-medium">TOTAL COURSES</div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.completedCourses}
                </div>
                <div className="text-sm text-gray-600 font-medium">COMPLETED</div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.inProgress}
                </div>
                <div className="text-sm text-gray-600 font-medium">IN PROGRESS</div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.certificates}
                </div>
                <div className="text-sm text-gray-600 font-medium">CERTIFICATES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveView("class-code")}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              activeView === "class-code"
                ? "bg-blue-500 text-white border-blue-500 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div className="text-3xl mb-2">🔑</div>
            <div className="font-semibold text-base">Class Code</div>
          </button>

          <button
            onClick={() => setActiveView("courses")}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              activeView === "courses"
                ? "bg-blue-500 text-white border-blue-500 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="font-semibold text-base">Courses</div>
          </button>

          <button
            onClick={() => setActiveView("report")}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              activeView === "report"
                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-base">Report</div>
          </button>

          <button
            onClick={() => setActiveView("message")}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              activeView === "message"
                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                : "bg-white border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-orange-50"
            }`}
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="font-semibold text-base">Message</div>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col min-h-0">
          {activeView === "class-code" && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Class Code</h3>
              <p className="text-base text-gray-600 mb-4">
                Enter the 3-digit code from your teacher to join the class session.
              </p>
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Enter class code (3 digits)"
                  maxLength={3}
                  pattern="[0-9]{3}"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg">
                  Join Class
                </button>
              </div>
            </div>
          )}

          {activeView === "courses" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <StudentCoursesView />
            </div>
          )}

          {activeView === "report" && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">My Report</h3>
              <div className="space-y-3 flex-1">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-xl mb-3">Progress Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-base text-gray-700 font-medium">Total Points</span>
                      <span className="text-blue-600 font-bold text-2xl">{stats.points}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-base text-gray-700 font-medium">Courses Completed</span>
                      <span className="text-orange-600 font-bold text-2xl">{stats.completedCourses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "message" && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Messages</h3>
              <div className="space-y-3 flex-1">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-base text-gray-600">No messages yet</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

    </div>
  );
}
