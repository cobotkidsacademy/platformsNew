"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import { Course, CourseLevel, UpdateLevelPayload } from "../types";

export default function CourseLevelsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null);
  const [pricingForm, setPricingForm] = useState({
    is_free: true,
    price: 0,
    currency: "KES",
  });
  const [savingPricing, setSavingPricing] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CourseLevel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingLevel, setDeletingLevel] = useState<CourseLevel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, levelsRes] = await Promise.all([
        apiClient.get(`/courses/${courseId}`),
        apiClient.get(`/courses/${courseId}/levels`),
      ]);
      setCourse(courseRes.data);
      setLevels(levelsRes.data);
    } catch (err: any) {
      console.error("Error fetching course:", err);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleLevelClick = (level: CourseLevel) => {
    router.push(`/admin/courses/${courseId}/levels/${level.id}`);
  };

  const openPricingModal = (e: React.MouseEvent, level: CourseLevel) => {
    e.stopPropagation();
    setSelectedLevel(level);
    setPricingForm({
      is_free: level.is_free ?? true,
      price: level.price ?? 0,
      currency: level.currency ?? "KES",
    });
    setShowPricingModal(true);
  };

  const savePricing = async () => {
    if (!selectedLevel) return;
    
    setSavingPricing(true);
    try {
      await apiClient.put(`/courses/levels/${selectedLevel.id}`, {
        is_free: pricingForm.is_free,
        price: pricingForm.is_free ? 0 : pricingForm.price,
        currency: pricingForm.currency,
      });
      setShowPricingModal(false);
      fetchData();
    } catch (err) {
      console.error("Error saving pricing:", err);
    } finally {
      setSavingPricing(false);
    }
  };

  const handleEditLevel = (level: CourseLevel) => {
    setEditingLevel(level);
    setShowEditModal(true);
  };

  const handleDeleteLevel = (level: CourseLevel) => {
    setDeletingLevel(level);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLevel) return;
    try {
      await apiClient.put(`/courses/levels/${editingLevel.id}`, {
        name: editingLevel.name,
        status: editingLevel.status,
      });
      setShowEditModal(false);
      setEditingLevel(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update level");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLevel) return;
    try {
      await apiClient.delete(`/courses/levels/${deletingLevel.id}`);
      setShowDeleteModal(false);
      setDeletingLevel(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete level");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center">
        {error || "Course not found"}
      </div>
    );
  }

  // Calculate pricing stats
  const freeLevels = levels.filter(l => l.is_free).length;
  const paidLevels = levels.filter(l => !l.is_free).length;
  const totalValue = levels.reduce((sum, l) => sum + (l.is_free ? 0 : (l.price || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={() => router.push('/admin/courses')}
          className="text-[var(--muted)] hover:text-violet-500 transition-colors"
        >
          Courses
        </button>
        <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--foreground)] font-medium">{course.name}</span>
      </div>

      <PageHeader 
        title={course.name}
        description={`Course code: ${course.code} • ${course.level_count} levels`}
      />

      {/* Course Info Card */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-6">
          {course.icon_image_url ? (
            <img src={course.icon_image_url} alt={course.name} className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{course.name}</h2>
            {course.description && <p className="text-white/80 mb-4">{course.description}</p>}
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                Code: <span className="font-mono">{course.code}</span>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-lg text-sm">
                {course.level_count} Level{course.level_count > 1 ? 's' : ''}
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-lg text-sm capitalize">
                {course.status}
              </div>
              <div className="px-3 py-1 bg-emerald-400/30 rounded-lg text-sm">
                {freeLevels} Free
              </div>
              <div className="px-3 py-1 bg-amber-400/30 rounded-lg text-sm">
                {paidLevels} Paid
              </div>
              {totalValue > 0 && (
                <div className="px-3 py-1 bg-white/20 rounded-lg text-sm font-semibold">
                  Total: {levels[0]?.currency || 'KES'} {totalValue.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Course Levels</h3>
          <p className="text-sm text-[var(--muted)]">Click the price badge to edit pricing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levels.map((level) => (
            <div
              key={level.id}
              onClick={() => handleLevelClick(level)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {level.level_number}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[var(--foreground)] group-hover:text-violet-500 transition-colors truncate">
                    {level.name}
                  </h4>
                  <p className="text-sm text-[var(--muted)]">
                    Level {level.level_number} of {course.level_count}
                  </p>
                </div>
              </div>

              {/* Pricing Badge */}
              <div className="mt-4">
                <button
                  onClick={(e) => openPricingModal(e, level)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    level.is_free 
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                  }`}
                >
                  {level.is_free ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      FREE
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {level.currency} {level.price?.toLocaleString()}
                    </>
                  )}
                  <svg className="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                  level.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
                }`}>
                  {level.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLevel(level);
                    }}
                    className="p-1.5 hover:bg-green-500/10 rounded-lg transition-colors text-green-600"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H10v-1.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLevel(level);
                    }}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-600"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-violet-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && selectedLevel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border)]">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Set Level Pricing</h2>
              <button onClick={() => setShowPricingModal(false)} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-[var(--accent)] rounded-xl p-4">
                <p className="text-sm text-[var(--muted)]">Setting price for:</p>
                <p className="text-lg font-semibold text-[var(--foreground)]">{selectedLevel.name}</p>
              </div>

              {/* Free/Paid Toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPricingForm({ ...pricingForm, is_free: true, price: 0 })}
                  className={`flex-1 py-4 px-4 rounded-xl font-semibold flex flex-col items-center gap-2 transition-all border-2 ${
                    pricingForm.is_free 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-emerald-500/50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free
                </button>
                <button
                  onClick={() => setPricingForm({ ...pricingForm, is_free: false })}
                  className={`flex-1 py-4 px-4 rounded-xl font-semibold flex flex-col items-center gap-2 transition-all border-2 ${
                    !pricingForm.is_free 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                      : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-amber-500/50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Paid
                </button>
              </div>

              {/* Price Input (only if not free) */}
              {!pricingForm.is_free && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Currency
                    </label>
                    <select
                      value={pricingForm.currency}
                      onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      <option value="KES">KES - Kenya Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="UGX">UGX - Uganda Shilling</option>
                      <option value="TZS">TZS - Tanzania Shilling</option>
                      <option value="RWF">RWF - Rwanda Franc</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-medium">
                        {pricingForm.currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pricingForm.price}
                        onChange={(e) => setPricingForm({ ...pricingForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-16 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  onClick={savePricing}
                  disabled={savingPricing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingPricing ? "Saving..." : "Save Pricing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
