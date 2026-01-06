"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const parentData = [
  { id: 1, name: "Robert Wilson", email: "robert@example.com", phone: "+1 234-567-8901", children: 2, status: "Active" },
  { id: 2, name: "Jennifer Martinez", email: "jennifer@example.com", phone: "+1 234-567-8902", children: 1, status: "Active" },
  { id: 3, name: "David Thompson", email: "david@example.com", phone: "+1 234-567-8903", children: 3, status: "Active" },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "children", label: "Children" },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {value}
      </span>
    ),
  },
];

export default function ParentPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Parents"
        description="Manage parent accounts and their linked students"
        action={{
          label: "Add Parent",
          onClick: () => console.log("Add parent"),
        }}
      />
      <DataTable columns={columns} data={parentData} />
    </div>
  );
}






