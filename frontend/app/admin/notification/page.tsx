"use client";

import PageHeader from "@/components/admin/PageHeader";

const notifications = [
  { id: 1, title: "System Maintenance", message: "Scheduled maintenance on Jan 10, 2025 from 2-4 AM", type: "system", time: "2 hours ago", read: false },
  { id: 2, title: "New Student Registration", message: "15 new students registered this week", type: "info", time: "5 hours ago", read: false },
  { id: 3, title: "Assignment Due", message: "Math Quiz #5 deadline is approaching", type: "warning", time: "1 day ago", read: true },
  { id: 4, title: "Payment Received", message: "Payment of $4,500 received from Greenwood Academy", type: "success", time: "2 days ago", read: true },
];

const getTypeStyles = (type: string) => {
  switch (type) {
    case "system": return "bg-blue-100 text-blue-600 border-blue-200";
    case "info": return "bg-teal-100 text-teal-600 border-teal-200";
    case "warning": return "bg-yellow-100 text-yellow-600 border-yellow-200";
    case "success": return "bg-green-100 text-green-600 border-green-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export default function NotificationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description="System notifications and alerts"
        action={{
          label: "Send Notification",
          onClick: () => console.log("Send notification"),
        }}
      />

      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`rounded-2xl p-5 animate-fade-in ${!notification.read ? "ring-2 ring-teal-500/20" : ""}`}
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl ${getTypeStyles(notification.type)}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {notification.title}
                  </h3>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {notification.time}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}






