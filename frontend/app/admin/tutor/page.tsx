"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { Tutor, TutorWithCredentials, TUTOR_LEVELS } from "./types";
import AddTutorModal from "./components/AddTutorModal";
import TutorCredentialsModal from "./components/TutorCredentialsModal";
import TutorDetailModal from "./components/TutorDetailModal";
import TutorCard from "./components/TutorCard";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newTutor, setNewTutor] = useState<TutorWithCredentials | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingTutor, setDeletingTutor] = useState<Tutor | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tutors");
      setTutors(response.data);
    } catch (err: any) {
      console.error("Error fetching tutors:", err);
      setError("Failed to load tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleAddSuccess = (data: TutorWithCredentials) => {
    setShowAddModal(false);
    setNewTutor(data);
    setShowCredentialsModal(true);
    fetchTutors();
  };

  const handleTutorClick = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowDetailModal(true);
  };

  const handleDeleteTutor = async () => {
    if (!selectedTutor) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTutor.first_name} ${selectedTutor.last_name}?`)) {
      try {
        await apiClient.delete(`/tutors/${selectedTutor.id}`);
        setShowDetailModal(false);
        setSelectedTutor(null);
        fetchTutors();
      } catch (err) {
        console.error("Error deleting tutor:", err);
        alert("Failed to delete tutor");
      }
    }
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowEditModal(true);
  };

  const handleDeleteTutorDirect = (tutor: Tutor) => {
    setDeletingTutor(tutor);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTutor) return;
    try {
      await apiClient.put(`/tutors/${editingTutor.id}`, {
        first_name: editingTutor.first_name,
        middle_name: editingTutor.middle_name,
        last_name: editingTutor.last_name,
        email: editingTutor.email,
        phone: editingTutor.phone,
        level: editingTutor.level,
        gender: editingTutor.gender,
        location: editingTutor.location,
        status: editingTutor.status,
      });
      setShowEditModal(false);
      setEditingTutor(null);
      fetchTutors();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update tutor");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTutor) return;
    try {
      await apiClient.delete(`/tutors/${deletingTutor.id}`);
      setShowDeleteModal(false);
      setDeletingTutor(null);
      fetchTutors();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete tutor");
    }
  };

  // Filter tutors
  const filteredTutors = tutors.filter(tutor => {
    const matchesLevel = levelFilter === "all" || tutor.level === levelFilter;
    const matchesSearch = searchQuery === "" || 
      `${tutor.first_name} ${tutor.middle_name} ${tutor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.phone.includes(searchQuery);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tutors Management" 
        description="Manage all tutors, their levels, and credentials"
      />

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tutors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          >
            <option value="all">All Levels</option>
            {TUTOR_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 items-center">
          {/* View Toggle */}
          <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "cards" ? "bg-emerald-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-emerald-500 text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Tutor
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{tutors.length}</p>
          <p className="text-sm text-[var(--muted)]">Total</p>
        </div>
        {TUTOR_LEVELS.map(level => {
          const count = tutors.filter(t => t.level === level.value).length;
          return (
            <div key={level.value} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{count}</p>
              <p className="text-sm text-[var(--muted)]">{level.label}</p>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center">
          {error}
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Tutors Found</h3>
          <p className="text-[var(--muted)] mb-6">
            {searchQuery || levelFilter !== "all" ? "Try adjusting your filters" : "Get started by adding your first tutor"}
          </p>
          {!searchQuery && levelFilter === "all" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Add First Tutor
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map(tutor => (
            <TutorCard 
              key={tutor.id} 
              tutor={tutor} 
              onClick={() => handleTutorClick(tutor)}
              onEdit={handleEditTutor}
              onDelete={handleDeleteTutorDirect}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--accent)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Phone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[var(--foreground)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTutors.map(tutor => {
                const levelLabel = TUTOR_LEVELS.find(l => l.value === tutor.level)?.label || tutor.level;
                return (
                  <tr 
                    key={tutor.id} 
                    className="hover:bg-[var(--accent)] cursor-pointer transition-colors"
                    onClick={() => handleTutorClick(tutor)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                          {tutor.first_name[0]}{tutor.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {tutor.first_name} {tutor.middle_name} {tutor.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{tutor.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-500">
                        {levelLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted)]">{tutor.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        tutor.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : tutor.status === "suspended"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-gray-500/10 text-gray-500"
                      }`}>
                        {tutor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleEditTutor(tutor); 
                          }}
                          className="p-2 hover:bg-green-500/10 rounded-lg transition-colors text-green-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteTutorDirect(tutor); 
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTutorClick(tutor); }}
                          className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddTutorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <TutorCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false);
          setNewTutor(null);
        }}
        tutor={newTutor}
      />

      <TutorDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTutor(null);
        }}
        tutor={selectedTutor}
        onDelete={handleDeleteTutor}
      />
    </div>
  );
}
