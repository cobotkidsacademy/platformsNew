"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TutorReportsPage() {
  const router = useRouter();

  const reports = [
    {
      id: "school",
      title: "School Performance Report",
      description: "View comprehensive performance metrics and analytics for all schools",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-purple-500 to-purple-600",
      onClick: () => {
        console.log("View School Report");
      },
    },
    {
      id: "class",
      title: "Class Student Performance Progress",
      description: "View students performance progress by class",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-purple-500 to-purple-600",
      onClick: () => {
        router.push("/tutor/reports/class-performance");
      },
    },
    {
      id: "student",
      title: "Student Performance Report",
      description: "View individual student performance, progress, and achievements",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-purple-500 to-purple-600",
      onClick: () => {
        console.log("View Student Report");
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Reports</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Access comprehensive performance reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <div
            key={report.id}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={report.onClick}
          >
            {/* Icon Header */}
            <div className={`h-24 bg-gradient-to-br ${report.gradient} flex items-center justify-center`}>
              <div className="text-white">
                {report.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
                {report.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                {report.description}
              </p>
              {report.id === "class" ? (
                <Link
                  href="/tutor/reports/class-performance"
                  className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r ${report.gradient} text-white hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center text-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  View Report
                </Link>
              ) : (
                <button
                  className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r ${report.gradient} text-white hover:shadow-lg hover:shadow-purple-500/25`}
                  onClick={(e) => {
                    e.stopPropagation();
                    report.onClick();
                  }}
                >
                  View Report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


