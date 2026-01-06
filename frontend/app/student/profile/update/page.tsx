"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface StudentInfo {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
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

interface School {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  school_id: string;
  status: string;
}

export default function UpdateProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Dropdown data
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("student_token");
      if (!token) {
        router.push("/student/login");
        return;
      }

      try {
        setLoading(true);
        // Fetch student info
        const studentResponse = await apiClient.get("/auth/student/me");
        const studentData = studentResponse.data;
        setStudent(studentData);

        // Set form values
        setUsername(studentData.username || "");
        setFirstName(studentData.first_name || "");
        setLastName(studentData.last_name || "");
        setSelectedSchoolId(studentData.school?.id || "");
        setSelectedClassId(studentData.class?.id || "");

        // Fetch schools
        const schoolsResponse = await apiClient.get("/schools");
        const activeSchools = schoolsResponse.data.filter(
          (s: School) => s.status === "active"
        );
        setSchools(activeSchools);

        // Fetch classes for selected school if school is already set
        if (studentData.school?.id) {
          await fetchClassesForSchool(studentData.school.id);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchClassesForSchool = async (schoolId: string) => {
    if (!schoolId) {
      setClasses([]);
      setSelectedClassId("");
      return;
    }

    try {
      setLoadingClasses(true);
      const response = await apiClient.get(`/schools/${schoolId}/classes`);
      const activeClasses = response.data.filter(
        (c: Class) => c.status === "active"
      );
      setClasses(activeClasses);

      // If the previously selected class is not in the new list, clear it
      if (selectedClassId && !activeClasses.find((c: Class) => c.id === selectedClassId)) {
        setSelectedClassId("");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes");
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (selectedSchoolId) {
      fetchClassesForSchool(selectedSchoolId);
    } else {
      setClasses([]);
      setSelectedClassId("");
    }
  }, [selectedSchoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    if (!username || !firstName || !lastName || !selectedSchoolId || !selectedClassId) {
      setError("Please fill in all fields");
      setSaving(false);
      return;
    }

    try {
      await apiClient.put("/auth/student/profile/full", {
        username,
        first_name: firstName,
        last_name: lastName,
        school_id: selectedSchoolId,
        class_id: selectedClassId,
      });

      setSuccess("Profile updated successfully!");
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/student/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Update Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                placeholder="Enter username"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
                placeholder="Enter last name"
              />
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                School
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={!selectedSchoolId || loadingClasses}
              >
                <option value="">
                  {loadingClasses
                    ? "Loading classes..."
                    : !selectedSchoolId
                    ? "Please select a school first"
                    : "Select a class"}
                </option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} ({classItem.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/student/dashboard")}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}




