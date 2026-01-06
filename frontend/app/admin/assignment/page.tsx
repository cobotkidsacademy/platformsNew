"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const assignmentData = [
  { id: 1, title: "Math Quiz #5", course: "Advanced Mathematics", dueDate: "2025-01-10", submissions: 42, total: 45, status: "Active" },
  { id: 2, title: "Physics Lab Report", course: "Physics Fundamentals", dueDate: "2025-01-12", submissions: 35, total: 38, status: "Active" },
  { id: 3, title: "Chemistry Test", course: "Chemistry Basics", dueDate: "2025-01-08", submissions: 52, total: 52, status: "Completed" },
];

const columns = [
  { key: "title", label: "Assignment" },
  { key: "course", label: "Course" },
  { key: "dueDate", label: "Due Date" },
  {
    key: "submissions",
    label: "Submissions",
    render: (value: number, row: any) => (
      <span>{value}/{row.total}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Active" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
      }`}>
        {value}
      </span>
    ),
  },
];

export default function AssignmentPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Assignments"
        description="Create and manage course assignments"
        action={{
          label: "Create Assignment",
          onClick: () => console.log("Create assignment"),
        }}
      />
      <DataTable columns={columns} data={assignmentData} />
    </div>
  );
}






