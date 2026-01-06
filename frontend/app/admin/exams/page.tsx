"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const examData = [
  { id: 1, title: "Mid-Term Mathematics", course: "Advanced Mathematics", date: "2025-01-15", duration: "2 hours", students: 45, status: "Scheduled" },
  { id: 2, title: "Physics Final", course: "Physics Fundamentals", date: "2025-01-20", duration: "3 hours", students: 38, status: "Scheduled" },
  { id: 3, title: "Chemistry Quiz", course: "Chemistry Basics", date: "2025-01-05", duration: "1 hour", students: 52, status: "Completed" },
];

const columns = [
  { key: "title", label: "Exam" },
  { key: "course", label: "Course" },
  { key: "date", label: "Date" },
  { key: "duration", label: "Duration" },
  { key: "students", label: "Students" },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Scheduled" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
      }`}>
        {value}
      </span>
    ),
  },
];

export default function ExamsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Exams"
        description="Schedule and manage examinations"
        action={{
          label: "Schedule Exam",
          onClick: () => console.log("Schedule exam"),
        }}
      />
      <DataTable columns={columns} data={examData} />
    </div>
  );
}






