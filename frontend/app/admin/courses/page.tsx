"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { Course } from "./types";
import AddCourseModal from "./components/AddCourseModal";
import CourseCard from "./components/CourseCard";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/courses");
      setCourses(response.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchCourses();
  };

  const handleCourseClick = (course: Course) => {
    router.push(`/admin/courses/${course.id}`);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    try {
      await apiClient.put(`/courses/${editingCourse.id}`, {
        name: editingCourse.name,
        code: editingCourse.code,
        description: editingCourse.description,
        status: editingCourse.status,
        icon_image_url: editingCourse.icon_image_url,
      });
      setShowEditModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    try {
      await apiClient.delete(`/courses/${deletingCourse.id}`);
      setShowDeleteModal(false);
      setDeletingCourse(null);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Courses Management" 
        description="Create and manage courses, levels, topics, and notes"
      />

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full lg:w-auto">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* View Toggle */}
          <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-violet-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-violet-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-3xl font-bold text-[var(--foreground)]">{courses.length}</p>
          <p className="text-sm text-[var(--muted)]">Total Courses</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-3xl font-bold text-emerald-500">{courses.filter(c => c.status === 'active').length}</p>
          <p className="text-sm text-[var(--muted)]">Active</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-3xl font-bold text-amber-500">{courses.filter(c => c.status === 'draft').length}</p>
          <p className="text-sm text-[var(--muted)]">Draft</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-3xl font-bold text-violet-500">{courses.reduce((sum, c) => sum + c.level_count, 0)}</p>
          <p className="text-sm text-[var(--muted)]">Total Levels</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center">
          {error}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Courses Found</h3>
          <p className="text-[var(--muted)] mb-6">
            {searchQuery ? "Try adjusting your search" : "Get started by creating your first course"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Create First Course
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => handleCourseClick(course)}
              onEdit={() => handleEditCourse(course)}
              onDelete={() => handleDeleteCourse(course)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--accent)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Course</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Code</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Levels</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredCourses.map(course => (
                <tr 
                  key={course.id} 
                  className="hover:bg-[var(--accent)] cursor-pointer transition-colors"
                  onClick={() => handleCourseClick(course)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{course.name}</p>
                        {course.description && (
                          <p className="text-xs text-[var(--muted)] line-clamp-1">{course.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-[var(--muted)]">{course.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-sm font-medium rounded-lg bg-violet-500/10 text-violet-500">
                      {course.level_count} Level{course.level_count > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                      course.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : course.status === "draft"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-gray-500/10 text-gray-500"
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddCourseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Course Modal */}
      {editingCourse && showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={editingCourse.code}
                  onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingCourse.description || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Photo/Icon URL</label>
                <input
                  type="url"
                  value={editingCourse.icon_image_url || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, icon_image_url: e.target.value })}
                  placeholder="https://example.com/course-icon.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {editingCourse.icon_image_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={editingCourse.icon_image_url} 
                        alt="Course icon preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-gray-400 text-center p-2">Invalid URL</div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingCourse.status}
                  onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCourse(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {deletingCourse && showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Course</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deletingCourse.name}</strong>? This will also delete all levels, topics, and notes associated with this course. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCourse(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
