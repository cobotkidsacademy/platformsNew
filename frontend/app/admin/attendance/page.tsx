"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const attendanceData = [
  { id: 1, date: "2025-01-05", course: "Advanced Mathematics", present: 42, absent: 3, late: 2, rate: "93%" },
  { id: 2, date: "2025-01-05", course: "Physics Fundamentals", present: 35, absent: 2, late: 1, rate: "95%" },
  { id: 3, date: "2025-01-05", course: "Chemistry Basics", present: 48, absent: 4, late: 3, rate: "92%" },
  { id: 4, date: "2025-01-04", course: "Advanced Mathematics", present: 40, absent: 5, late: 2, rate: "89%" },
];

const columns = [
  { key: "date", label: "Date" },
  { key: "course", label: "Course" },
  {
    key: "present",
    label: "Present",
    render: (value: number) => <span className="text-green-600 font-medium">{value}</span>,
  },
  {
    key: "absent",
    label: "Absent",
    render: (value: number) => <span className="text-red-600 font-medium">{value}</span>,
  },
  {
    key: "late",
    label: "Late",
    render: (value: number) => <span className="text-yellow-600 font-medium">{value}</span>,
  },
  {
    key: "rate",
    label: "Rate",
    render: (value: string) => (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
        {value}
      </span>
    ),
  },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Attendance"
        description="Track and manage class attendance records"
        action={{
          label: "Take Attendance",
          onClick: () => console.log("Take attendance"),
        }}
      />
      <DataTable columns={columns} data={attendanceData} />
    </div>
  );
}






