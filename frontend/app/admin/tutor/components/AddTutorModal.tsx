"use client";

import { useState } from "react";
import { CreateTutorPayload, TutorLevel, Gender, TUTOR_LEVELS, GENDERS } from "../types";
import apiClient from "@/lib/api/client";

interface AddTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const initialFormState: CreateTutorPayload = {
  first_name: "",
  middle_name: "",
  last_name: "",
  level: "tutor",
  gender: "male",
  phone: "",
  id_number: "",
  nssf_no: "",
  kra_pin: "",
  location: "",
  date_of_birth: "",
  profile_image_url: "",
};

export default function AddTutorModal({ isOpen, onClose, onSuccess }: AddTutorModalProps) {
  const [formData, setFormData] = useState<CreateTutorPayload>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        level: formData.level,
        gender: formData.gender,
        phone: formData.phone,
        id_number: formData.id_number || undefined,
        nssf_no: formData.nssf_no || undefined,
        kra_pin: formData.kra_pin || undefined,
        location: formData.location || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        profile_image_url: formData.profile_image_url || undefined,
      };

      console.log("Creating tutor with payload:", payload);
      const response = await apiClient.post("/tutors", payload);
      console.log("Tutor created:", response.data);
      
      setFormData(initialFormState);
      onSuccess(response.data);
    } catch (err: any) {
      console.error("Error creating tutor:", err);
      setError(err.response?.data?.message || "Failed to create tutor");
    } finally {
      setLoading(false);
    }
  };

  // Calculate what the auto-generated email/password would be
  const previewEmail = formData.first_name && formData.last_name 
    ? `${formData.first_name.toLowerCase()}.${formData.last_name.toLowerCase()}@cobotkids.edutech`.replace(/[^a-z0-9.@]/g, '')
    : "fname.lname@cobotkids.edutech";
  
  const previewPassword = formData.middle_name 
    ? `${formData.middle_name.toLowerCase()}cocobotkids2026`
    : "mnamecocobotkids2026";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[var(--card)] rounded-2xl w-full max-w-2xl shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--card)] px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Add New Tutor</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Name Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Personal Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Middle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Smith"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {TUTOR_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+254 712 345 678"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Official Documents Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Official Documents (Optional)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="12345678"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  NSSF No
                </label>
                <input
                  type="text"
                  name="nssf_no"
                  value={formData.nssf_no}
                  onChange={handleChange}
                  placeholder="NSSF123456"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  KRA PIN
                </label>
                <input
                  type="text"
                  name="kra_pin"
                  value={formData.kra_pin}
                  onChange={handleChange}
                  placeholder="A123456789Z"
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Nairobi, Kenya"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                name="profile_image_url"
                value={formData.profile_image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Auto-generated Preview */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
            <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">Auto-Generated Credentials Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Email:</span>
                <span className="font-mono text-[var(--foreground)]">{previewEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Password:</span>
                <span className="font-mono text-[var(--foreground)]">{previewPassword}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating..." : "Add Tutor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






