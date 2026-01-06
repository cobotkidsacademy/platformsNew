"use client";

import PageHeader from "@/components/admin/PageHeader";

const liveClasses = [
  { id: 1, title: "Advanced Calculus", tutor: "Dr. Sarah Johnson", students: 28, status: "Live", startTime: "10:00 AM" },
  { id: 2, title: "Physics Lab", tutor: "Prof. Michael Brown", students: 22, status: "Live", startTime: "10:30 AM" },
  { id: 3, title: "Chemistry Review", tutor: "Ms. Emily Davis", students: 0, status: "Scheduled", startTime: "2:00 PM" },
  { id: 4, title: "Biology Session", tutor: "Dr. James Wilson", students: 0, status: "Scheduled", startTime: "3:30 PM" },
];

export default function LiveClassesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Live Classes"
        description="Monitor and manage ongoing live sessions"
        action={{
          label: "Start Class",
          onClick: () => console.log("Start class"),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveClasses.map((cls, index) => (
          <div
            key={cls.id}
            className="rounded-2xl p-6 animate-fade-in"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{cls.title}</h3>
                  {cls.status === "Live" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      LIVE
                    </span>
                  )}
                  {cls.status === "Scheduled" && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      Scheduled
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{cls.tutor}</p>
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>{cls.startTime}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {cls.students} students
                </span>
              </div>

              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  cls.status === "Live"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                }`}
              >
                {cls.status === "Live" ? "Join Now" : "Start"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}






