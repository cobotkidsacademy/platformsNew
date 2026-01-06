"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useState } from "react";

const messages = [
  { id: 1, from: "Dr. Sarah Johnson", subject: "Question about curriculum", preview: "I wanted to discuss the upcoming changes to the...", time: "10:30 AM", unread: true },
  { id: 2, from: "Parent - Robert Wilson", subject: "Student Progress", preview: "Could you please provide an update on my son's...", time: "9:45 AM", unread: true },
  { id: 3, from: "Student - Alex Johnson", subject: "Assignment Extension", preview: "I would like to request an extension for...", time: "Yesterday", unread: false },
  { id: 4, from: "Prof. Michael Brown", subject: "Lab Equipment", preview: "We need to order new equipment for the...", time: "Yesterday", unread: false },
  { id: 5, from: "Ms. Emily Davis", subject: "Meeting Request", preview: "Can we schedule a meeting to discuss...", time: "2 days ago", unread: false },
];

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Messages"
        description="Communication center"
        action={{
          label: "Compose",
          onClick: () => console.log("Compose message"),
        }}
      />

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message.id)}
              className={`p-4 cursor-pointer transition-colors hover:bg-[var(--muted)] ${
                selectedMessage === message.id ? "bg-[var(--muted)]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: message.unread ? "var(--primary)" : "var(--muted)",
                    color: message.unread ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {message.from.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`text-sm ${message.unread ? "font-semibold" : "font-medium"}`}
                      style={{ color: "var(--foreground)" }}
                    >
                      {message.from}
                    </h3>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {message.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${message.unread ? "font-medium" : ""}`}
                    style={{ color: "var(--foreground)" }}
                  >
                    {message.subject}
                  </p>
                  <p
                    className="text-sm truncate mt-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {message.preview}
                  </p>
                </div>
                {message.unread && (
                  <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}






