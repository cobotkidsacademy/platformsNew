"use client";

import { useState } from "react";
import PageHeader from "@/components/admin/PageHeader";

interface Editor {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: "coming_soon" | "available";
}

const editors: Editor[] = [
  {
    id: "scratch",
    name: "Scratch",
    description: "Visual block-based programming editor",
    icon: "🎨",
    color: "from-orange-500 to-orange-600",
    status: "coming_soon",
  },
  {
    id: "python",
    name: "Python",
    description: "Python programming environment",
    icon: "🐍",
    color: "from-blue-500 to-blue-600",
    status: "coming_soon",
  },
  {
    id: "applab",
    name: "AppLab",
    description: "Code.org AppLab programming environment",
    icon: "📱",
    color: "from-purple-500 to-purple-600",
    status: "coming_soon",
  },
  {
    id: "html",
    name: "HTML",
    description: "HTML + CSS editor",
    icon: "🌐",
    color: "from-red-500 to-red-600",
    status: "coming_soon",
  },
  {
    id: "html-css-js",
    name: "HTML + CSS + JS",
    description: "Full-stack web development editor",
    icon: "💻",
    color: "from-green-500 to-green-600",
    status: "coming_soon",
  },
  {
    id: "javascript",
    name: "JavaScript",
    description: "JavaScript programming environment",
    icon: "⚡",
    color: "from-yellow-500 to-yellow-600",
    status: "coming_soon",
  },
  {
    id: "arduino",
    name: "Arduino Simulation",
    description: "Arduino microcontroller simulation",
    icon: "🔌",
    color: "from-teal-500 to-teal-600",
    status: "coming_soon",
  },
  {
    id: "ethical-hacking",
    name: "Ethical Hacking",
    description: "Ethical hacking and cybersecurity tools",
    icon: "🔒",
    color: "from-gray-700 to-gray-800",
    status: "coming_soon",
  },
  {
    id: "vsc-editor",
    name: "VSC Editor",
    description: "Visual Studio Code-like editor",
    icon: "📝",
    color: "from-indigo-500 to-indigo-600",
    status: "coming_soon",
  },
  {
    id: "react",
    name: "React",
    description: "React.js development environment",
    icon: "⚛️",
    color: "from-cyan-500 to-cyan-600",
    status: "coming_soon",
  },
  {
    id: "nodejs",
    name: "Node.js",
    description: "Node.js server-side programming",
    icon: "🟢",
    color: "from-emerald-500 to-emerald-600",
    status: "coming_soon",
  },
];

export default function EditorsPage() {
  const [selectedEditor, setSelectedEditor] = useState<string | null>(null);

  const handleEditorClick = (editorId: string) => {
    setSelectedEditor(editorId);
    // TODO: Navigate to editor or show editor modal
    console.log(`Opening editor: ${editorId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Code Editors"
        description="Manage and configure programming editors for students"
      />

      {/* Editors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {editors.map((editor) => (
          <button
            key={editor.id}
            onClick={() => handleEditorClick(editor.id)}
            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
          >
            {/* Status Badge */}
            {editor.status === "coming_soon" && (
              <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                Coming Soon
              </span>
            )}

            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${editor.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-3xl">{editor.icon}</span>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {editor.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {editor.description}
            </p>

            {/* Hover Effect Indicator */}
            <div className="mt-4 flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Click to configure</span>
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              About Code Editors
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              These programming editors allow students to write, save, and execute code directly in their accounts. 
              Each editor is designed for specific programming languages and frameworks. Students can create projects, 
              save their work securely, and access it anytime. All editors are integrated with the platform's auto-save 
              functionality and secure storage system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




