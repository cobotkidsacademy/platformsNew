"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function TutorTopNav() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [tutorInfo, setTutorInfo] = useState<{ first_name?: string; last_name?: string; profile_image_url?: string } | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("tutor_user");
    if (userStr) {
      try {
        setTutorInfo(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing tutor user:", e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname?.split("/").pop() || "dashboard";
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleLogout = () => {
    localStorage.removeItem("tutor_token");
    localStorage.removeItem("tutor_user");
    router.push("/tutor/login");
  };

  const getInitials = () => {
    if (tutorInfo?.first_name && tutorInfo?.last_name) {
      return `${tutorInfo.first_name.charAt(0)}${tutorInfo.last_name.charAt(0)}`.toUpperCase();
    }
    return "TU";
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 h-16 transition-all duration-300"
      style={{
        left: "256px",
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Company Logo & Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                COBOT KIDS KENYA
              </h1>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Tutor Portal
              </p>
            </div>
          </div>
          <div className="h-6 w-px bg-[var(--border)]" />
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Settings */}
          <button
            onClick={() => router.push("/tutor/settings")}
            className="p-2.5 rounded-xl transition-all duration-200 hover:bg-[var(--muted)]"
            style={{ color: "var(--muted-foreground)" }}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all duration-200 hover:bg-[var(--muted)]"
            >
              {tutorInfo?.profile_image_url ? (
                <img
                  src={tutorInfo.profile_image_url}
                  alt="Profile"
                  className="w-9 h-9 rounded-xl object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{getInitials()}</span>
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {tutorInfo?.first_name && tutorInfo?.last_name
                    ? `${tutorInfo.first_name} ${tutorInfo.last_name}`
                    : "Tutor"}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Tutor
                </p>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                style={{ color: "var(--muted-foreground)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 animate-fade-in z-50"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <a
                  href="/tutor/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </a>
                <a
                  href="/tutor/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
                <hr className="my-2" style={{ borderColor: "var(--border)" }} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

