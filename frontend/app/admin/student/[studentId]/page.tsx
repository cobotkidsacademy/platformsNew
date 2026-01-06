"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";

interface StudentProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
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
  tutors?: Array<{
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }>;
  course_levels?: Array<{
    id: string;
    name: string;
    course_name?: string;
    enrollment_status: 'enrolled' | 'completed';
  }>;
  performance?: {
    category: 'below_expectation' | 'approaching' | 'meeting' | 'exceeding';
    total_points: number;
    quizzes_completed: number;
    highest_percentage: number;
  };
}

export default function AdminStudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("=== FETCHING STUDENT PROFILE (ADMIN) ===");
        console.log("Student ID:", studentId);
        const response = await apiClient.get(`/auth/admin/student/${studentId}`);
        console.log("Profile response:", response);
        console.log("Profile data:", response.data);
        setProfile(response.data);
      } catch (err: any) {
        console.error("=== PROFILE FETCH ERROR ===");
        console.error("Error object:", err);
        console.error("Error response:", err.response);
        console.error("Error data:", err.response?.data);
        setError(err.response?.data?.message || err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [studentId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never logged in";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Never logged in";
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return "Never logged in";
    }
  };

  const formatTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };

  const getPerformanceColor = (category?: string) => {
    switch (category) {
      case 'exceeding':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'meeting':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'approaching':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'below_expectation':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPerformanceLabel = (category?: string) => {
    switch (category) {
      case 'exceeding':
        return 'Exceeding';
      case 'meeting':
        return 'Meeting';
      case 'approaching':
        return 'Approaching';
      case 'below_expectation':
        return 'Below Expectation';
      default:
        return 'No Data';
    }
  };

  const capitalizeName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error || "Profile not found"}</p>
            <button
              onClick={() => router.push("/admin/student")}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/student")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Students
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.className = 'text-5xl font-bold text-gray-400';
                          fallback.textContent = profile.first_name.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-5xl font-bold text-gray-400">
                      {profile.first_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                  {capitalizeName(`${profile.first_name} ${profile.last_name}`)}
                </h2>
                <p className="text-gray-500 mt-1">@{profile.username}</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">School</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.school?.name ? `${profile.school.name}` : "Not assigned"}
                  </p>
                  {profile.school?.code && (
                    <p className="text-xs text-gray-500 mt-0.5">Code: {profile.school.code}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Class</p>
                  <p className="text-sm font-medium text-gray-900">
                    {profile.class?.name ? `${profile.class.name}` : "Not assigned"}
                  </p>
                  {profile.class?.level && (
                    <p className="text-xs text-gray-500 mt-0.5">Level: {profile.class.level}</p>
                  )}
                </div>
                {profile.gender && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{profile.gender}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Today's Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatTodayDate()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Performance Level</p>
                  <div className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getPerformanceColor(profile.performance?.category)}`}>
                    {getPerformanceLabel(profile.performance?.category)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Points</p>
                  <p className="text-3xl font-bold text-blue-600">{profile.performance?.total_points || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Quizzes Completed</p>
                  <p className="text-3xl font-bold text-green-600">{profile.performance?.quizzes_completed || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Highest Score</p>
                  <p className="text-3xl font-bold text-orange-600">{profile.performance?.highest_percentage ? profile.performance.highest_percentage.toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>

            {/* Login Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Last Login</p>
                  {profile.last_login ? (
                    <div>
                      <p className={`text-base font-medium ${isToday(profile.last_login) ? 'text-green-600' : 'text-gray-900'}`}>
                        {formatDate(profile.last_login)}
                      </p>
                      {isToday(profile.last_login) && (
                        <p className="text-xs text-green-600 mt-1">✓ Logged in today</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-base text-red-600 font-medium">Never logged in</p>
                      <p className="text-xs text-gray-500 mt-1">No login history available</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Logins</p>
                  <p className="text-base text-gray-900 font-medium">{profile.login_count || 0} {profile.login_count === 1 ? 'time' : 'times'}</p>
                  {profile.login_count === 0 && (
                    <p className="text-xs text-gray-500 mt-1">First login pending</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tutors */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutors</h3>
              {profile.tutors && profile.tutors.length > 0 ? (
                <div className="space-y-3">
                  {profile.tutors.map((tutor) => (
                    <div key={tutor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900">{tutor.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{tutor.role === 'lead' ? 'Lead Tutor' : 'Assistant Tutor'}</p>
                        {tutor.email && (
                          <p className="text-xs text-gray-500 mt-1">{tutor.email}</p>
                        )}
                        {tutor.phone && (
                          <p className="text-xs text-gray-500">{tutor.phone}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>No tutors assigned to this class</p>
                </div>
              )}
            </div>

            {/* Course Levels */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Levels</h3>
              {profile.course_levels && profile.course_levels.length > 0 ? (
                <div className="space-y-3">
                  {profile.course_levels.map((level) => (
                    <div key={level.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900">{level.name}</p>
                        {level.course_name && (
                          <p className="text-sm text-gray-600">{level.course_name}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        level.enrollment_status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {level.enrollment_status === 'completed' ? 'Completed' : 'Enrolled'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p>No course levels assigned to this class</p>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Username</p>
                  <p className="text-base text-gray-900">@{profile.username}</p>
                </div>
                {profile.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                    <p className="text-base text-gray-900">{profile.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-base text-gray-900">{capitalizeName(`${profile.first_name} ${profile.last_name}`)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




