"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { CourseLevel, Topic } from "../../../types";

export default function LevelTopicsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const levelId = params.levelId as string;

  const [level, setLevel] = useState<CourseLevel | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [levelRes, topicsRes] = await Promise.all([
        apiClient.get(`/courses/levels/${levelId}`),
        apiClient.get(`/courses/levels/${levelId}/topics`),
      ]);
      setLevel(levelRes.data);
      setTopics(topicsRes.data);
    } catch (err: any) {
      console.error("Error fetching level:", err);
      setError("Failed to load level");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [levelId]);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    setAdding(true);
    try {
      await apiClient.post("/courses/topics", {
        level_id: levelId,
        name: newTopicName,
      });
      setNewTopicName("");
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error("Error adding topic:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleTopicClick = (topic: Topic) => {
    router.push(`/admin/courses/${courseId}/levels/${levelId}/topics/${topic.id}`);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setShowEditModal(true);
  };

  const handleDeleteTopic = (topic: Topic) => {
    setDeletingTopic(topic);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTopic) return;
    try {
      await apiClient.put(`/courses/topics/${editingTopic.id}`, {
        name: editingTopic.name,
        description: editingTopic.description,
        status: editingTopic.status,
      });
      setShowEditModal(false);
      setEditingTopic(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update topic");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopic) return;
    try {
      await apiClient.delete(`/courses/topics/${deletingTopic.id}`);
      setShowDeleteModal(false);
      setDeletingTopic(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete topic");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center">
        {error || "Level not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <button 
          onClick={() => router.push('/admin/courses')}
          className="text-[var(--muted)] hover:text-violet-500 transition-colors"
        >
          Courses
        </button>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button 
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="text-[var(--muted)] hover:text-violet-500 transition-colors"
        >
          {level.course?.name || "Course"}
        </button>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--foreground)] font-medium">{level.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader 
          title={level.name}
          description={`Level ${level.level_number} • ${topics.length} topic${topics.length !== 1 ? 's' : ''}`}
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Topic
        </button>
      </div>

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Topics Yet</h3>
          <p className="text-[var(--muted)] mb-6">Start by adding your first topic to this level</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Add First Topic
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--foreground)] group-hover:text-violet-500 transition-colors">
                    {topic.name}
                  </h4>
                  {topic.description && (
                    <p className="text-sm text-[var(--muted)] mt-1">{topic.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    topic.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                  }`}>
                    {topic.status}
                  </span>
                  <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-violet-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Add New Topic</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTopic} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  required
                  placeholder="e.g., Introduction to Variables"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newTopicName.trim()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



