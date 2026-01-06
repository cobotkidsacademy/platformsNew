"use client";

import { useState } from "react";
import { CreateCoursePayload } from "../types";
import apiClient from "@/lib/api/client";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function AddCourseModal({ isOpen, onClose, onSuccess }: AddCourseModalProps) {
  const [formData, setFormData] = useState<CreateCoursePayload>({
    name: "",
    description: "",
    icon_image_url: "",
    level_count: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'level_count' ? parseInt(value) : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        icon_image_url: formData.icon_image_url || undefined,
        level_count: formData.level_count,
      };

      console.log("Creating course:", payload);
      const response = await apiClient.post("/courses", payload);
      console.log("Course created:", response.data);
      
      setFormData({ name: "", description: "", icon_image_url: "", level_count: 1 });
      onSuccess(response.data);
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  // Preview generated levels
  const previewLevels = Array.from({ length: formData.level_count }, (_, i) => 
    `${formData.name || "Course"} - Level ${i + 1}`
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[var(--card)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--card)] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Add New Course</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Python Programming"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Course description..."
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Number of Levels <span className="text-red-500">*</span>
            </label>
            <select
              name="level_count"
              value={formData.level_count}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num} Level{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Course Photo/Icon URL
            </label>
            <input
              type="url"
              name="icon_image_url"
              value={formData.icon_image_url}
              onChange={handleChange}
              placeholder="https://example.com/icon.png"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            {formData.icon_image_url && (
              <div className="mt-2">
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Preview:</p>
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center border" style={{ borderColor: "var(--border)" }}>
                  <img 
                    src={formData.icon_image_url} 
                    alt="Course icon preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (errorDiv) errorDiv.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-xs text-center p-2" style={{ color: "var(--muted-foreground)" }}>Invalid URL</div>
                </div>
              </div>
            )}
          </div>

          {/* Preview of auto-generated levels */}
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl p-4 border border-violet-500/20">
            <h3 className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-3">
              Auto-Generated Levels Preview
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {previewLevels.map((level, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[var(--foreground)]">{level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--foreground)] rounded-xl font-semibold hover:opacity-80 transition-opacity"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



