"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import PageHeader from "@/components/admin/PageHeader";
import EditStudentModal from "./edit-modal";
import DeleteStudentModal from "./delete-modal";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'graduated';
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
  created_at: string;
}

interface School {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  school_id: string;
}

export default function StudentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Filter states
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [loginStatusFilter, setLoginStatusFilter] = useState<string>("all"); // all, never, recent
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchClasses(selectedSchoolId);
    } else {
      setClasses([]);
      setSelectedClassId("");
    }
  }, [selectedSchoolId]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.get("/schools/students");
      console.log("Students response:", response.data);
      setStudents(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch students:", err);
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

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
      setClasses([]);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/schools/students/${deletingStudent.id}`);
      setShowDeleteModal(false);
      setDeletingStudent(null);
      fetchStudents();
    } catch (err: any) {
      console.error("Failed to delete student:", err);
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never logged in";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Never logged in";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return "Never logged in";
    }
  };

  const capitalizeName = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const filteredStudents = students.filter((student) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    // School filter
    const matchesSchool = !selectedSchoolId || student.school?.id === selectedSchoolId;

    // Class filter
    const matchesClass = !selectedClassId || student.class?.id === selectedClassId;

    // Login status filter
    let matchesLoginStatus = true;
    if (loginStatusFilter === "never") {
      matchesLoginStatus = !student.last_login;
    } else if (loginStatusFilter === "recent") {
      if (!student.last_login) {
        matchesLoginStatus = false;
      } else {
        const lastLogin = new Date(student.last_login);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        matchesLoginStatus = daysDiff <= 7; // Recent = last 7 days
      }
    }

    // Date range filter
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      if (!student.last_login) {
        matchesDateRange = false;
      } else {
        const lastLogin = new Date(student.last_login);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (lastLogin < fromDate) {
            matchesDateRange = false;
          }
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (lastLogin > toDate) {
            matchesDateRange = false;
          }
        }
      }
    }

    return matchesSearch && matchesStatus && matchesSchool && matchesClass && matchesLoginStatus && matchesDateRange;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Students"
          description="Manage student accounts and track their progress"
        />
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Students"
          description="Manage student accounts and track their progress"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchStudents}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Students"
        description="Manage student accounts and track their progress"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search by name, username, email, school, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row 1: School, Class, Status, Login Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setSelectedClassId(""); // Reset class when school changes
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={!selectedSchoolId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Status
              </label>
              <select
                value={loginStatusFilter}
                onChange={(e) => setLoginStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="never">Never Logged In</option>
                <option value="recent">Recent (Last 7 Days)</option>
              </select>
            </div>
          </div>

          {/* Filter Row 2: Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Login Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedSchoolId || selectedClassId || loginStatusFilter !== "all" || dateFrom || dateTo) && (
            <div>
              <button
                onClick={() => {
                  setSelectedSchoolId("");
                  setSelectedClassId("");
                  setLoginStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No students found</p>
                    <p className="text-sm mt-1">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "No students have been added yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/student/${student.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 flex items-center justify-center text-white font-semibold mr-3">
                          {student.first_name.charAt(0)}
                          {student.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {capitalizeName(`${student.first_name} ${student.last_name}`)}
                          </div>
                          {student.gender && (
                            <div className="text-xs text-gray-500 capitalize">
                              {student.gender}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-700">
                        @{student.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.school?.name || "N/A"}
                      </div>
                      {student.school?.code && (
                        <div className="text-xs text-gray-500">
                          {student.school.code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.class?.name || "N/A"}
                      </div>
                      {student.class?.level && (
                        <div className="text-xs text-gray-500">
                          {student.class.level}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {student.email || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {formatDate(student.last_login)}
                      </div>
                      {student.login_count !== undefined && (
                        <div className="text-xs text-gray-500">
                          {student.login_count} {student.login_count === 1 ? 'login' : 'logins'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.status === "active"
                            ? "bg-green-100 text-green-700"
                            : student.status === "inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/student/${student.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStudent(student);
                          }}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStudent(student);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Total Students: </span>
            <span className="font-semibold text-gray-900">{students.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Active: </span>
            <span className="font-semibold text-green-600">
              {students.filter((s) => s.status === "active").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Inactive: </span>
            <span className="font-semibold text-red-600">
              {students.filter((s) => s.status === "inactive").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Graduated: </span>
            <span className="font-semibold text-gray-600">
              {students.filter((s) => s.status === "graduated").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Never Logged In: </span>
            <span className="font-semibold text-orange-600">
              {students.filter((s) => !s.last_login).length}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onSave={() => {
            fetchStudents();
            setShowEditModal(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {deletingStudent && (
        <DeleteStudentModal
          student={deletingStudent}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingStudent(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
 