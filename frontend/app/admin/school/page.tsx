"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import PageHeader from "@/components/admin/PageHeader";
import AddSchoolModal from "./components/AddSchoolModal";
import CredentialsModal from "./components/CredentialsModal";
import { School } from "./types";

export default function SchoolPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState<any>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get("/schools");
      setSchools(response.data);
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolCreated = (school: any) => {
    setShowAddModal(false);
    setNewSchoolData(school);
    setShowCredentials(true);
    fetchSchools();
  };

  const handleViewCredentials = (school: School) => {
    setNewSchoolData({
      name: school.name,
      auto_email: school.auto_email,
      generated_password: school.plain_password,
    });
    setShowCredentials(true);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setShowEditModal(true);
  };

  const handleDeleteSchool = (school: School) => {
    setDeletingSchool(school);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSchool) return;
    try {
      await apiClient.put(`/schools/${editingSchool.id}`, {
        name: editingSchool.name,
        email: editingSchool.email,
        location: editingSchool.location,
        phone: editingSchool.phone,
        logo_url: editingSchool.logo_url,
        status: editingSchool.status,
      });
      setShowEditModal(false);
      setEditingSchool(null);
      fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update school");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSchool) return;
    try {
      await apiClient.delete(`/schools/${deletingSchool.id}`);
      setShowDeleteModal(false);
      setDeletingSchool(null);
      fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete school");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Schools"
          description="Manage registered schools and their credentials"
        />
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl p-1" style={{ backgroundColor: "var(--muted)" }}>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "cards" ? "bg-white shadow-sm" : ""}`}
              style={{ color: viewMode === "cards" ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
              style={{ color: viewMode === "table" ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add School
          </button>
        </div>
      </div>

      {schools.length === 0 ? (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            No Schools Yet
          </h3>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
            Get started by adding your first school
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white"
          >
            Add Your First School
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school, index) => (
            <div
              key={school.id}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                animationDelay: `${index * 0.05}s`,
              }}
              onClick={() => router.push(`/admin/school/${school.id}`)}
            >
              <div className="h-24 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center relative">
                {school.logo_url ? (
                  <img src={school.logo_url} alt={school.name} className="h-16 w-16 object-contain" />
                ) : (
                  <span className="text-white font-bold text-3xl">{school.name.charAt(0)}</span>
                )}
                <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium bg-white/20 text-white">
                  {school.code}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--foreground)" }}>
                  {school.name}
                </h3>
                {school.location && (
                  <p className="text-sm mb-3 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {school.location}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>
                      <strong style={{ color: "var(--foreground)" }}>{school.class_count || 0}</strong> classes
                    </span>
                    <span style={{ color: "var(--muted-foreground)" }}>
                      <strong style={{ color: "var(--foreground)" }}>{school.student_count || 0}</strong> students
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    school.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {school.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSchool(school);
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
                        handleDeleteSchool(school);
                      }}
                      className="text-sm font-medium transition-colors hover:text-red-600"
                      style={{ color: "var(--primary)" }}
                    >
                      Delete
                    </button>
                    <span style={{ color: "var(--border)" }}>|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCredentials(school);
                      }}
                      className="text-sm font-medium transition-colors hover:text-teal-600"
                      style={{ color: "var(--primary)" }}
                    >
                      Credentials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--muted)" }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>School</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Classes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Students</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {schools.map((school) => (
                  <tr
                    key={school.id}
                    className="cursor-pointer transition-colors hover:bg-[var(--muted)]"
                    onClick={() => router.push(`/admin/school/${school.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                          {school.logo_url ? (
                            <img src={school.logo_url} alt={school.name} className="h-8 w-8 object-contain" />
                          ) : (
                            <span className="text-white font-bold">{school.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium" style={{ color: "var(--foreground)" }}>{school.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchool(school);
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
                            handleDeleteSchool(school);
                          }}
                          className="text-sm font-medium transition-colors hover:text-red-600"
                          style={{ color: "var(--primary)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm" style={{ color: "var(--primary)" }}>{school.code}</span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {school.location || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)" }}>
                      {school.class_count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--foreground)" }}>
                      {school.student_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        school.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCredentials(school);
                        }}
                        className="text-sm font-medium transition-colors hover:text-teal-600"
                        style={{ color: "var(--primary)" }}
                      >
                        Credentials
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddSchoolModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSchoolCreated}
      />

      {newSchoolData && (
        <CredentialsModal
          isOpen={showCredentials}
          onClose={() => {
            setShowCredentials(false);
            setNewSchoolData(null);
          }}
          type="school"
          data={{
            name: newSchoolData.name,
            email: newSchoolData.auto_email,
            password: newSchoolData.generated_password || newSchoolData.plain_password || "N/A",
          }}
        />
      )}

      {/* Edit School Modal */}
      {editingSchool && showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit School</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Photo URL</label>
                <input
                  type="url"
                  value={editingSchool.logo_url || ""}
                  onChange={(e) => setEditingSchool({ ...editingSchool, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {editingSchool.logo_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img 
                        src={editingSchool.logo_url} 
                        alt="Logo preview" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-gray-400 text-center p-2">Invalid URL</div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingSchool.name}
                  onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingSchool.email || ""}
                  onChange={(e) => setEditingSchool({ ...editingSchool, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingSchool.location || ""}
                  onChange={(e) => setEditingSchool({ ...editingSchool, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingSchool.phone || ""}
                  onChange={(e) => setEditingSchool({ ...editingSchool, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingSchool.status}
                  onChange={(e) => setEditingSchool({ ...editingSchool, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="active">Active</option>
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
                  setEditingSchool(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete School Modal */}
      {deletingSchool && showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete School</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deletingSchool.name}</strong>? This will also delete all classes and students associated with this school. This action cannot be undone.
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
                  setDeletingSchool(null);
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
