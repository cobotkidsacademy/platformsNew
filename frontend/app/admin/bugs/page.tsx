"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const bugData = [
  { id: 1, title: "Login page not loading", reporter: "Student - Alex", priority: "High", status: "Open", date: "2025-01-05" },
  { id: 2, title: "Video playback issues", reporter: "Tutor - Sarah", priority: "Medium", status: "In Progress", date: "2025-01-04" },
  { id: 3, title: "Assignment upload failed", reporter: "Student - Emma", priority: "High", status: "Open", date: "2025-01-04" },
  { id: 4, title: "Notification not showing", reporter: "Parent - Robert", priority: "Low", status: "Resolved", date: "2025-01-02" },
];

const columns = [
  { key: "title", label: "Issue" },
  { key: "reporter", label: "Reporter" },
  {
    key: "priority",
    label: "Priority",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "High" ? "bg-red-100 text-red-700" :
        value === "Medium" ? "bg-yellow-100 text-yellow-700" :
        "bg-green-100 text-green-700"
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Open" ? "bg-red-100 text-red-700" :
        value === "In Progress" ? "bg-blue-100 text-blue-700" :
        "bg-green-100 text-green-700"
      }`}>
        {value}
      </span>
    ),
  },
  { key: "date", label: "Reported" },
];

export default function BugsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bug Reports"
        description="Track and resolve reported issues"
        action={{
          label: "Report Bug",
          onClick: () => console.log("Report bug"),
        }}
      />
      <DataTable columns={columns} data={bugData} />
    </div>
  );
}






