"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (school: any) => void;
}

export default function AddSchoolModal({ isOpen, onClose, onSuccess }: AddSchoolModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    logo_url: "",
    email: "",
    location: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Build payload with only the name (required field)
      const payload: Record<string, string> = { 
        name: formData.name.trim() 
      };
      
      // Add optional fields only if they have values
      if (formData.code && formData.code.trim()) {
        payload.code = formData.code.trim();
      }
      if (formData.logo_url && formData.logo_url.trim()) {
        payload.logo_url = formData.logo_url.trim();
      }
      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }
      if (formData.location && formData.location.trim()) {
        payload.location = formData.location.trim();
      }
      if (formData.phone && formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      console.log("=== CREATE SCHOOL ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Token exists:", !!localStorage.getItem("auth_token"));

      const response = await apiClient.post("/schools", payload);

      console.log("Success response:", response.data);
      onSuccess(response.data);
      setFormData({ name: "", code: "", logo_url: "", email: "", location: "", phone: "" });
    } catch (err: any) {
      console.error("=== CREATE SCHOOL ERROR ===");
      console.error("Status:", err.response?.status);
      console.error("Error data:", JSON.stringify(err.response?.data, null, 2));
      
      let errorMessage = "Failed to create school";
      if (err.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
          <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Add New School
          </h3>
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
              School Name <span className="text-red-500">*</span>
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
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              School Code <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Auto-generated if empty)</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 rounded-xl font-mono"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="e.g., GWA"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Logo/Photo URL <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="https://example.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-2">
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Preview:</p>
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center border" style={{ borderColor: "var(--border)" }}>
                  <img 
                    src={formData.logo_url} 
                    alt="Logo preview" 
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

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="school@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
                Phone <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Location <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              }}
              placeholder="City, Country"
            />
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              <strong>Auto-generated:</strong>
            </p>
            <ul className="mt-2 text-sm space-y-1" style={{ color: "var(--muted-foreground)" }}>
              <li>• Email: {formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@cobotkids.edutech' : '[name]@cobotkids.edutech'}</li>
              <li>• Password: Will be auto-generated (8 characters)</li>
            </ul>
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
              {isLoading ? "Creating..." : "Create School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

