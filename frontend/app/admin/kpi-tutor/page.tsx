"use client";

import PageHeader from "@/components/admin/PageHeader";

const tutorKPIs = [
  { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", students: 45, avgRating: 4.8, classesCompleted: 120, attendance: 98, performance: 95 },
  { id: 2, name: "Prof. Michael Brown", subject: "Physics", students: 38, avgRating: 4.9, classesCompleted: 105, attendance: 96, performance: 92 },
  { id: 3, name: "Ms. Emily Davis", subject: "Chemistry", students: 52, avgRating: 4.7, classesCompleted: 98, attendance: 94, performance: 88 },
];

export default function KPITutorPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tutor KPIs"
        description="Monitor and evaluate tutor performance metrics"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tutorKPIs.map((tutor, index) => (
          <div
            key={tutor.id}
            className="rounded-2xl p-6 animate-fade-in"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {tutor.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{tutor.name}</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{tutor.subject}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--muted-foreground)" }}>Performance</span>
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>{tutor.performance}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-2 rounded-full bg-teal-500" style={{ width: `${tutor.performance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--muted-foreground)" }}>Attendance</span>
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>{tutor.attendance}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "var(--muted)" }}>
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${tutor.attendance}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{tutor.students}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Students</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{tutor.classesCompleted}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Classes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{tutor.avgRating}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Rating</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}






