"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

interface DashboardStats {
  students: { total: number; change: string; changeType: string };
  tutors: { total: number; change: string; changeType: string };
  courses: { total: number; change: string; changeType: string };
  schools: { total: number; change: string; changeType: string };
  classes: { total: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/dashboard/stats");
      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      // Set default stats on error
      setStats({
        students: { total: 0, change: "0.0", changeType: "neutral" },
        tutors: { total: 0, change: "0.0", changeType: "neutral" },
        courses: { total: 0, change: "0.0", changeType: "neutral" },
        schools: { total: 0, change: "0.0", changeType: "neutral" },
        classes: { total: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const statCards: StatCard[] = stats
    ? [
        {
          title: "Total Students",
          value: formatNumber(stats.students.total),
          change: `+${stats.students.change}%`,
          changeType: stats.students.changeType as "positive" | "negative" | "neutral",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
        {
          title: "Active Tutors",
          value: formatNumber(stats.tutors.total),
          change: `+${stats.tutors.change}%`,
          changeType: stats.tutors.changeType as "positive" | "negative" | "neutral",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          title: "Total Courses",
          value: formatNumber(stats.courses.total),
          change: `+${stats.courses.change}%`,
          changeType: stats.courses.changeType as "positive" | "negative" | "neutral",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
        },
        {
          title: "Active Schools",
          value: formatNumber(stats.schools.total),
          change: stats.schools.change === "0.0" ? "—" : `+${stats.schools.change}%`,
          changeType: stats.schools.changeType as "positive" | "negative" | "neutral",
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div
        className="rounded-2xl p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white animate-fade-in"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Admin! 👋</h2>
            <p className="mt-1 text-teal-100">
              Here&apos;s what&apos;s happening with your LMS today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-teal-100">Today&apos;s Date</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 animate-pulse"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="h-20 bg-[var(--muted)] rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="rounded-2xl p-6 animate-fade-in"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  <span style={{ color: "var(--primary)" }}>{stat.icon}</span>
                </div>
                {stat.change !== "—" && (
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-600"
                        : stat.changeType === "negative"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {stat.value}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-fade-in"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            animationDelay: "0.2s",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              System Overview
            </h3>
            <button
              onClick={() => router.push("/admin/allocation")}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm"
            >
              View Allocations
            </button>
          </div>
          {/* Placeholder Chart */}
          <div className="h-64 flex items-center justify-center rounded-xl" style={{ backgroundColor: "var(--muted)" }}>
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: "var(--muted-foreground)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p style={{ color: "var(--muted-foreground)" }}>
                {stats ? (
                  <>
                    <span className="font-semibold text-[var(--foreground)]">{stats.classes.total}</span> Active Classes
                  </>
                ) : (
                  "Loading..."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            animationDelay: "0.3s",
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--foreground)" }}>
            Quick Links
          </h3>
          <div className="space-y-3">
            {[
              { name: "Manage Schools", href: "/admin/school", icon: "🏫" },
              { name: "Manage Tutors", href: "/admin/tutor", icon: "👨‍🏫" },
              { name: "View Courses", href: "/admin/courses", icon: "📚" },
              { name: "Allocations", href: "/admin/allocation", icon: "📋" },
            ].map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 animate-slide-in opacity-0"
                style={{
                  backgroundColor: "var(--muted)",
                  animationDelay: `${0.3 + index * 0.05}s`,
                }}
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {link.name}
                </span>
                <svg
                  className="w-4 h-4 ml-auto"
                  style={{ color: "var(--muted-foreground)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl p-6 animate-fade-in"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          animationDelay: "0.4s",
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Add Student", icon: "👨‍🎓", href: "/admin/school" },
            { name: "Add Tutor", icon: "👨‍🏫", href: "/admin/tutor" },
            { name: "New Course", icon: "📚", href: "/admin/courses" },
            { name: "Allocations", icon: "📋", href: "/admin/allocation" },
            { name: "View Reports", icon: "📊", href: "/admin/performance" },
            { name: "Settings", icon: "⚙️", href: "/admin/settings" },
          ].map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                {action.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
