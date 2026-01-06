"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { Topic, Note } from "../../../../../types";

export default function TopicNotesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const levelId = params.levelId as string;
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicRes, notesRes] = await Promise.all([
        apiClient.get(`/courses/topics/${topicId}`),
        apiClient.get(`/courses/topics/${topicId}/notes`),
      ]);
      setTopic(topicRes.data);
      setNotes(notesRes.data);
    } catch (err: any) {
      console.error("Error fetching topic:", err);
      setError("Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const handleAddNote = async () => {
    setAdding(true);
    try {
      const response = await apiClient.post("/courses/notes", {
        topic_id: topicId,
        title: `Note ${notes.length + 1}`,
      });
      router.push(`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}/notes/${response.data.id}`);
    } catch (err) {
      console.error("Error creating note:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleNoteClick = (note: Note) => {
    router.push(`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}/notes/${note.id}`);
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await apiClient.delete(`/courses/notes/${noteId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center">
        {error || "Topic not found"}
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
          {topic.level?.course?.name || "Course"}
        </button>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button 
          onClick={() => router.push(`/admin/courses/${courseId}/levels/${levelId}`)}
          className="text-[var(--muted)] hover:text-violet-500 transition-colors"
        >
          {topic.level?.name || "Level"}
        </button>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--foreground)] font-medium">{topic.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader 
          title={topic.name}
          description={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}/quizzes`)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="text-lg">🎯</span>
            Quizzes
          </button>
          <button
            onClick={handleAddNote}
            disabled={adding}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {adding ? "Creating..." : "Add Note"}
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No Notes Yet</h3>
          <p className="text-[var(--muted)] mb-6">Create notes with text and images using drag & drop</p>
          <button
            onClick={handleAddNote}
            disabled={adding}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {adding ? "Creating..." : "Create First Note"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-violet-500/30 transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] group-hover:text-violet-500 transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-xs text-[var(--muted)]">
                      Created {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                  note.status === "active" 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : note.status === "draft"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-gray-500/10 text-gray-500"
                }`}>
                  {note.status}
                </span>
                <span className="text-sm text-[var(--muted)] group-hover:text-violet-500 flex items-center gap-1">
                  Edit Note
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



