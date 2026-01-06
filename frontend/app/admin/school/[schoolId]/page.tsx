"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import AddClassModal from "../components/AddClassModal";
import CredentialsModal from "../components/CredentialsModal";
import { School, Class, LEVEL_LABELS, LEVEL_COLORS } from "../types";

export default function SchoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const fetchSchoolData = async () => {
    try {
      const [schoolRes, classesRes] = await Promise.all([
        apiClient.get(`/schools/${schoolId}`),
        apiClient.get(`/schools/${schoolId}/classes`),
      ]);
      setSchool(schoolRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error("Failed to fetch school data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassCreated = () => {
    setShowAddModal(false);
    fetchSchoolData();
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setShowEditModal(true);
  };

  const handleDeleteClass = (cls: Class) => {
    setDeletingClass(cls);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClass) return;
    try {
      await apiClient.put(`/schools/classes/${editingClass.id}`, {
        name: editingClass.name,
        level: editingClass.level,
        description: editingClass.description,
      });
      setShowEditModal(false);
      setEditingClass(null);
      fetchSchoolData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update class");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingClass) return;
    try {
      await apiClient.delete(`/schools/classes/${deletingClass.id}`);
      setShowDeleteModal(false);
      setDeletingClass(null);
      fetchSchoolData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete class");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
          School not found
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <button onClick={() => router.push("/admin/school")} className="hover:text-teal-500 transition-colors">
          Schools
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span style={{ color: "var(--foreground)" }}>{school.name}</span>
      </div>

      {/* School Header */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="h-32 bg-gradient-to-r from-teal-500 to-teal-600 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              {school.logo_url ? (
                <img src={school.logo_url} alt={school.name} className="h-14 w-14 object-contain" />
              ) : (
                <span className="text-teal-500 font-bold text-3xl">{school.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="pt-14 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{school.name}</h1>
                <span className="px-3 py-1 rounded-lg text-sm font-mono font-medium bg-teal-500/10 text-teal-600">
                  {school.code}
                </span>
              </div>
              {school.location && (
                <p className="mt-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {school.location}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowCredentials(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            >
              View Credentials
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{classes.length}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Classes</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {classes.reduce((sum, c) => sum + (c.student_count || 0), 0)}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Students</p>
            </div>
            {school.email && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{school.email}</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Email</p>
              </div>
            )}
            {school.phone && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{school.phone}</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Phone</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classes Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Classes</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--muted-foreground)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            No Classes Yet
          </h3>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
            Add your first class to start enrolling students
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white"
          >
            Add First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, index) => (
            <div
              key={cls.id}
              onClick={() => router.push(`/admin/school/${schoolId}/class/${cls.id}`)}
              className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{cls.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${LEVEL_COLORS[cls.level]}`}>
                    {LEVEL_LABELS[cls.level]}
                  </span>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  <svg className="w-5 h-5" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              {cls.description && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                  {cls.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  <strong style={{ color: "var(--foreground)" }}>{cls.student_count || 0}</strong> students
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClass(cls);
                    }}
                    className="text-sm font-medium transition-colors hover:text-green-600"
                    style={{ color: "var(--primary)" }}
                  >
                    Edit
                  </button>
                  <span style={{ color: "var(--border)" }}>|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(cls);
                    }}
                    className="text-sm font-medium transition-colors hover:text-red-600"
                    style={{ color: "var(--primary)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleClassCreated}
        schoolId={schoolId}
        schoolName={school.name}
      />

      <CredentialsModal
        isOpen={showCredentials}
        onClose={() => setShowCredentials(false)}
        type="school"
        data={{
          name: school.name,
          email: school.auto_email,
          password: school.plain_password || "N/A",
        }}
      />

      {/* Edit Class Modal */}
      {editingClass && showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={editingClass.level}
                  onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingClass.description || ""}
                  onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
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
                  setEditingClass(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Class Modal */}
      {deletingClass && showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Class</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deletingClass.name}</strong>? This will also delete all students in this class. This action cannot be undone.
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
                  setDeletingClass(null);
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



