"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

interface Student {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  profile_image_url?: string;
  last_login?: string;
  login_count: number;
  status: string;
  class: {
    id: string;
    name: string;
    level: string;
  } | null;
  school: {
    id: string;
    name: string;
    code: string;
  } | null;
  quiz_progress: {
    total_points: number;
    quizzes_completed: number;
    average_score: number;
  };
}

interface School {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  school_id: string;
}

export default function TutorStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");

  useEffect(() => {
    fetchSchools();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchClasses(selectedSchoolId);
    } else {
      setClasses([]);
      setSelectedClassId("");
    }
  }, [selectedSchoolId]);

  useEffect(() => {
    fetchStudents();
  }, [selectedSchoolId, selectedClassId, nameFilter]);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get("/allocations/tutor/me/schools");
      setSchools(response.data || []);
    } catch (err: any) {
      console.error("Error fetching schools:", err);
    }
  };

  const fetchClasses = async (schoolId: string) => {
    try {
      const response = await apiClient.get(`/allocations/tutor/me/schools/${schoolId}`);
      setClasses(response.data.classes || []);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSchoolId) params.append("school_id", selectedSchoolId);
      if (selectedClassId) params.append("class_id", selectedClassId);
      if (nameFilter) params.append("name", nameFilter);

      const url = `/allocations/tutor/me/students${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiClient.get(url);
      setStudents(response.data || []);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 76) return "Exceeds Expectation";
    if (percentage >= 51) return "Meets Expectation";
    if (percentage >= 26) return "Approaching Expectation";
    return "Below Expectation";
  };

  const getPerformanceBadgeColor = (percentage: number) => {
    if (percentage >= 76) return "background-color:#16a34a;color:#ffffff;"; // green
    if (percentage >= 51) return "background-color:#2563eb;color:#ffffff;"; // blue
    if (percentage >= 26) return "background-color:#eab308;color:#ffffff;"; // yellow
    return "background-color:#dc2626;color:#ffffff;"; // red
  };

  const handleDownloadReport = async (student: Student) => {
    try {
      // Fetch exam data
      const examResponse = await apiClient.get(`/allocations/tutor/me/students/${student.id}/exam`);
      const levels = examResponse.data || [];

      // Fetch school info with logo
      let schoolInfo: any = null;
      let leadTutor = "";
      let assistantTutor = "";

      try {
        if (student.school?.id) {
          const schoolResponse = await apiClient.get(`/schools/${student.school.id}`);
          schoolInfo = schoolResponse.data;
        }
      } catch (err) {
        console.error("Error fetching school info:", err);
      }

      // Fetch class allocation info for tutors
      try {
        if (student.class?.id) {
          const allocationResponse = await apiClient.get(`/allocations/class/${student.class.id}`);
          const allocation = allocationResponse.data;
          if (allocation.lead_tutor) {
            leadTutor = `${allocation.lead_tutor.first_name || ''} ${allocation.lead_tutor.last_name || ''}`.trim();
          }
          if (allocation.assistant_tutor) {
            assistantTutor = `${allocation.assistant_tutor.first_name || ''} ${allocation.assistant_tutor.last_name || ''}`.trim();
          }
        }
      } catch (err) {
        console.error("Error fetching allocation info:", err);
      }

      // Get data from fetched info and student props
      const fullName = `${student.first_name} ${student.last_name}`;
      const schoolName = schoolInfo?.name || student.school?.name || "";
      const schoolLogo = schoolInfo?.logo_url || "";
      const className = student.class?.name || "";
      const studentProfileImage = student.profile_image_url || "";
      const studentInitials = getInitials(student.first_name, student.last_name);

      // Calculate overall performance
      let overallPercentage = 0;
      let totalTopics = 0;
      levels.forEach((level: any) => {
        (level.topics || []).forEach((topic: any) => {
          const quizResults = topic.quiz_results || [];
          let bestPercentage = 0;
          quizResults.forEach((q: any) => {
            if (typeof q.percentage === "number" && q.percentage > bestPercentage) {
              bestPercentage = q.percentage;
            }
          });
          if (bestPercentage > 0) {
            overallPercentage += bestPercentage;
            totalTopics++;
          }
        });
      });
      const avgPerformance = totalTopics > 0 ? overallPercentage / totalTopics : 0;
      const overallLabel = avgPerformance > 0 ? getPerformanceLabel(avgPerformance) : "No Data";
      const overallBadgeColor = avgPerformance > 0 ? getPerformanceBadgeColor(avgPerformance) : "background-color:#9ca3af;color:#ffffff;";

      // Get emoji for performance
      const getPerformanceEmoji = (percentage: number) => {
        if (percentage >= 76) return "🌟"; // Exceeds
        if (percentage >= 51) return "⭐"; // Meets
        if (percentage >= 26) return "✨"; // Approaching
        if (percentage > 0) return "💪"; // Below
        return "📝"; // No Attempt
      };

      const title = `${fullName} - Student Coding Progress Report`;

      // Company logo SVG (COBOT)
      const companyLogo = `
        <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="companyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="8" fill="url(#companyGrad)"/>
          <text x="20" y="28" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">C</text>
          <text x="50" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f766e">COBOT</text>
          <text x="50" y="38" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">KIDS KENYA</text>
        </svg>
      `;

      let conceptsRows = "";
      let courseBadge = "";
      levels.forEach((level: any, levelIndex: number) => {
        const courseName = level.course_name || level.course_level_name || "Course";
        
        // Course badge (show first course)
        if (levelIndex === 0) {
          courseBadge = `
            <div style="text-align:center;margin:20px 0;">
              <span style="display:inline-block;padding:8px 20px;background:linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);border-radius:20px;font-weight:700;font-size:14px;color:#1f2937;box-shadow:0 4px 6px rgba(251,191,36,0.3);">
                🎓 COURSE: ${courseName.toUpperCase()}
              </span>
            </div>
          `;
        }

        conceptsRows += `
          <tr>
            <td colspan="2" style="padding:14px 16px;background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);font-weight:700;font-size:15px;border-top:2px solid #0ea5e9;color:#0c4a6e;">
              📚 ${courseName}
            </td>
          </tr>
        `;

        (level.topics || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)).forEach((topic: any) => {
          const quizResults = topic.quiz_results || [];
          let bestPercentage = 0;
          quizResults.forEach((q: any) => {
            if (typeof q.percentage === "number" && q.percentage > bestPercentage) {
              bestPercentage = q.percentage;
            }
          });

          const hasAttempt = bestPercentage > 0;
          const label = hasAttempt ? getPerformanceLabel(bestPercentage) : "No Attempt";
          const badgeStyle = hasAttempt
            ? getPerformanceBadgeColor(bestPercentage)
            : "background-color:#9ca3af;color:#ffffff;";
          const emoji = getPerformanceEmoji(bestPercentage);

          conceptsRows += `
            <tr style="background:${hasAttempt ? '#fafafa' : '#fef2f2'};">
              <td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-size:15px;font-weight:500;color:#374151;">
                ${emoji} ${topic.topic_name}
              </td>
              <td style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:right;">
                <span style="display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;${badgeStyle};box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                  ${label}
                </span>
              </td>
            </tr>
          `;
        });
      });

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
              body { 
                font-family: 'Poppins', system-ui, -apple-system, sans-serif; 
                margin: 0;
                padding: 30px 40px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 50%, #f0fdf4 100%);
                color: #111827;
              }
              .header-container {
                background: white;
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 25px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border: 3px solid #0ea5e9;
              }
              .logo-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px dashed #cbd5e1;
              }
              .company-logo { 
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .school-logo {
                width: 80px;
                height: 80px;
                border-radius: 15px;
                object-fit: contain;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                padding: 8px;
                border: 3px solid #0ea5e9;
              }
              .partnership-text {
                text-align: center;
                font-style: italic;
                color: #0c4a6e;
                font-size: 13px;
                font-weight: 600;
                margin: 15px 0;
              }
              h1 { 
                font-size: 32px; 
                margin: 0;
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 800;
                text-align: center;
                letter-spacing: -0.5px;
              }
              .info-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-top: 25px;
                gap: 30px;
              }
              .info-left {
                flex: 1;
              }
              .info-right {
                text-align: center;
                flex: 0 0 200px;
              }
              .student-avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                margin: 0 auto 15px;
                border: 5px solid #0ea5e9;
                box-shadow: 0 8px 16px rgba(14,165,233,0.3);
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                font-weight: 800;
                color: white;
                object-fit: cover;
              }
              .student-name {
                font-size: 22px;
                font-weight: 700;
                color: #0c4a6e;
                margin-bottom: 5px;
              }
              .summary-row { 
                margin-bottom: 8px;
                font-size: 14px;
                padding: 6px 0;
                border-bottom: 1px dotted #cbd5e1;
              }
              .summary-label { 
                font-weight: 700;
                color: #0c4a6e;
                margin-right: 8px;
                display: inline-block;
                min-width: 100px;
              }
              .summary-value {
                color: #1e293b;
                font-weight: 500;
              }
              .performance-badge {
                display: inline-block;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: 700;
                font-size: 14px;
                margin-top: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
              }
              .table-container {
                background: white;
                border-radius: 20px;
                padding: 25px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border: 3px solid #0ea5e9;
                margin-top: 25px;
              }
              .table-header { 
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: white;
                padding: 14px 20px;
                font-weight: 700;
                font-size: 15px;
                border-radius: 12px 12px 0 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              th {
                text-align: left;
              }
              th:last-child {
                text-align: right;
              }
              @media print {
                body {
                  background: white;
                  padding: 20px;
                }
                .header-container, .table-container {
                  box-shadow: none;
                  border: 2px solid #0ea5e9;
                }
              }
            </style>
          </head>
          <body>
            <div class="header-container">
              <!-- Logo Section -->
              <div class="logo-section">
                <div class="company-logo">
                  ${companyLogo}
                </div>
                ${schoolLogo ? `<img src="${schoolLogo}" alt="${schoolName}" class="school-logo" onerror="this.style.display='none'" />` : `
                  <div class="school-logo" style="display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#0ea5e9;">
                    ${schoolName.charAt(0).toUpperCase()}
                  </div>
                `}
              </div>

              <div class="partnership-text">In Partnership With</div>
              
              <h1>🎮 Student Coding Progress Report 🎮</h1>

              <!-- Info Section -->
              <div class="info-section">
                <div class="info-left">
                  <div class="summary-row">
                    <span class="summary-label">🏫 School:</span>
                    <span class="summary-value">${schoolName}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">📚 Class:</span>
                    <span class="summary-value">${className}</span>
                  </div>
                  ${leadTutor ? `
                  <div class="summary-row">
                    <span class="summary-label">👨‍🏫 Lead Tutor:</span>
                    <span class="summary-value">${leadTutor}</span>
                  </div>
                  ` : ''}
                  ${assistantTutor ? `
                  <div class="summary-row">
                    <span class="summary-label">👩‍🏫 Asst. Tutor:</span>
                    <span class="summary-value">${assistantTutor}</span>
                  </div>
                  ` : ''}
                  <div class="summary-row">
                    <span class="summary-label">⭐ Performance:</span>
                    <span class="performance-badge" style="${overallBadgeColor}">
                      ${overallLabel}
                    </span>
                  </div>
                </div>
                <div class="info-right">
                  ${studentProfileImage ? `
                    <img src="${studentProfileImage}" alt="${fullName}" class="student-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div class="student-avatar" style="display:none;">${studentInitials}</div>
                  ` : `
                    <div class="student-avatar">${studentInitials}</div>
                  `}
                  <div class="student-name">${fullName}</div>
                </div>
              </div>
            </div>

            ${courseBadge}

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th class="table-header">Concept</th>
                    <th class="table-header" style="text-align:right;">Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${conceptsRows || `<tr><td colspan="2" style="padding:20px;text-align:center;font-size:15px;color:#6b7280;">📝 No quiz data available yet. Keep learning!</td></tr>`}
                </tbody>
              </table>
            </div>

            <div style="text-align:center;margin-top:30px;padding:20px;background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-radius:15px;border:2px solid #fbbf24;">
              <div style="font-size:16px;font-weight:700;color:#92400e;margin-bottom:8px;">
                🎉 Keep Coding, Keep Learning! 🎉
              </div>
              <div style="font-size:12px;color:#78350f;">
                Every concept mastered is a step closer to becoming a coding champion!
              </div>
            </div>
          </body>
        </html>
      `;

      const win = window.open("", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 500);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Students
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          View and manage students in your assigned classes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                setSelectedClassId("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!selectedSchoolId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
            Students ({students.length})
          </h2>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {nameFilter || selectedSchoolId || selectedClassId
                ? "Try adjusting your filters"
                : "No students assigned to your classes yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    {/* Name & Profile Photo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.profile_image_url ? (
                          <img
                            src={student.profile_image_url}
                            alt={`${student.first_name} ${student.last_name}`}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium mr-3';
                                fallback.textContent = getInitials(student.first_name, student.last_name);
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium mr-3">
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                          {student.email && (
                            <div className="text-sm text-gray-500">{student.email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-purple-600 font-medium">
                        {student.username}
                      </span>
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.class ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.class.name}</div>
                          <div className="text-sm text-gray-500">{student.class.level}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    {/* Quiz Progress */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {student.quiz_progress.quizzes_completed} quizzes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Points:</span>
                          <span className="text-xs font-semibold text-purple-600">
                            {student.quiz_progress.total_points}
                          </span>
                        </div>
                        {student.quiz_progress.average_score > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Avg:</span>
                            <span className="text-xs font-semibold text-blue-600">
                              {Math.round(student.quiz_progress.average_score)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(student.last_login)}</div>
                      <div className="text-xs text-gray-500">
                        {student.login_count || 0} logins
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/tutor/students/${student.id}`)}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadReport(student)}
                          className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-xs font-medium"
                        >
                          Download Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
