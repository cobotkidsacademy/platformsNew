"use client";

import PageHeader from "@/components/admin/PageHeader";
import DataTable from "@/components/admin/DataTable";

const financeStats = [
  { label: "Total Revenue", value: "$124,500", icon: "💰" },
  { label: "Pending Payments", value: "$12,340", icon: "⏳" },
  { label: "This Month", value: "$28,900", icon: "📈" },
  { label: "Expenses", value: "$45,200", icon: "📉" },
];

const transactionData = [
  { id: 1, date: "2025-01-05", description: "Course Fee - Alex Johnson", type: "Income", amount: "$99", status: "Completed" },
  { id: 2, date: "2025-01-04", description: "Subscription - Greenwood Academy", type: "Income", amount: "$2,500", status: "Completed" },
  { id: 3, date: "2025-01-03", description: "Platform Maintenance", type: "Expense", amount: "-$500", status: "Completed" },
  { id: 4, date: "2025-01-02", description: "Course Fee - Emma Williams", type: "Income", amount: "$149", status: "Pending" },
];

const columns = [
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  {
    key: "type",
    label: "Type",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (value: string) => (
      <span className={`font-medium ${value.startsWith("-") ? "text-red-600" : "text-green-600"}`}>
        {value}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        value === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}>
        {value}
      </span>
    ),
  },
];

export default function FinancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Finance"
        description="Financial overview and transactions"
        action={{
          label: "Export Report",
          onClick: () => console.log("Export report"),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeStats.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-2xl p-6 animate-fade-in"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={transactionData} />
    </div>
  );
}






