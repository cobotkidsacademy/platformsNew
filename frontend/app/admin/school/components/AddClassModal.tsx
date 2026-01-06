"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { LEVEL_LABELS } from "../types";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cls: any) => void;
  schoolId: string;
  schoolName: string;
}

export default function AddClassModal({ isOpen, onClose, onSuccess, schoolId, schoolName }: AddClassModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "level1",
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/schools/classes", {
        school_id: schoolId,
        name: formData.name,
        level: formData.level,
        description: formData.description || undefined,
      });

      onSuccess(response.data);
      setFormData({ name: "", level: "level1", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create class");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 animate-fade-in"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Add New Class
            </h3>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <svg className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="e.g., Class A, Morning Batch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, level: value })}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    formData.level === value
                      ? "ring-2 ring-teal-500 bg-teal-500/10"
                      : ""
                  }`}
                  style={{
                    backgroundColor: formData.level === value ? "var(--secondary)" : "var(--muted)",
                    color: formData.level === value ? "var(--primary)" : "var(--foreground)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Description <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl resize-none"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="Add a description for this class..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






