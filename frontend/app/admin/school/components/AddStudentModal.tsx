"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: any) => void;
  classId: string;
  schoolId: string;
  schoolCode: string;
  className: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
  classId,
  schoolId,
  schoolCode,
  className,
}: AddStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    guardian_name: "",
    guardian_phone: "",
    gender: "",
  });

  if (!isOpen) return null;

  const previewUsername = formData.first_name && formData.last_name
    ? `${schoolCode}-${formData.first_name}${formData.last_name}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
    : '[schoolcode]-[firstname][lastname]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/schools/students", {
        class_id: classId,
        school_id: schoolId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || undefined,
        guardian_name: formData.guardian_name || undefined,
        guardian_phone: formData.guardian_phone || undefined,
        gender: formData.gender || undefined,
      });

      onSuccess(response.data);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        guardian_name: "",
        guardian_phone: "",
        gender: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              Add New Student
            </h3>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {className}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Gender <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: formData.gender === option.value ? "" : option.value })}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.gender === option.value
                      ? "ring-2 ring-teal-500 bg-teal-500/10"
                      : ""
                  }`}
                  style={{
                    backgroundColor: formData.gender === option.value ? "var(--secondary)" : "var(--muted)",
                    color: formData.gender === option.value ? "var(--primary)" : "var(--foreground)",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Email <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="student@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Guardian Name <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
                placeholder="Parent/Guardian"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Guardian Phone <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
                placeholder="+1 234-567-8900"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Auto-generated Credentials:
            </p>
            <div className="space-y-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <p>• Username: <span className="font-mono">{previewUsername}</span></p>
              <p>• Password: <span className="font-mono">1234</span></p>
            </div>
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
              disabled={isLoading || !formData.first_name || !formData.last_name}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






