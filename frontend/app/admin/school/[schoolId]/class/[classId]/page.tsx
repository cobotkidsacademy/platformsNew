"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import AddStudentModal from "../../../components/AddStudentModal";
import CredentialsModal from "../../../components/CredentialsModal";
import { Class, Student, LEVEL_LABELS, LEVEL_COLORS } from "../../../types";

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;

  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudentData, setNewStudentData] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const [classRes, studentsRes] = await Promise.all([
        apiClient.get(`/schools/classes/${classId}`),
        apiClient.get(`/schools/classes/${classId}/students`),
      ]);
      setClassData(classRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Failed to fetch class data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentCreated = (student: any) => {
    setShowAddModal(false);
    setNewStudentData(student);
    setShowCredentials(true);
    fetchClassData();
  };

  const handleViewCredentials = (student: Student) => {
    setSelectedStudent(student);
    setNewStudentData(null);
    setShowCredentials(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/schools/students/${deletingStudent.id}`);
      setShowDeleteModal(false);
      setDeletingStudent(null);
      fetchClassData();
    } catch (err: any) {
      console.error("Failed to delete student:", err);
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
          Class not found
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: "var(--muted-foreground)" }}>
        <button onClick={() => router.push("/admin/school")} className="hover:text-teal-500 transition-colors">
          Schools
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <button onClick={() => router.push(`/admin/school/${schoolId}`)} className="hover:text-teal-500 transition-colors">
          {classData.school?.name}
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span style={{ color: "var(--foreground)" }}>{classData.name}</span>
      </div>

      {/* Class Header */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{classData.name}</h1>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${LEVEL_COLORS[classData.level]}`}>
                  {LEVEL_LABELS[classData.level]}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {classData.school?.name} • {classData.school?.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{students.length}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Students</p>
            </div>
          </div>
        </div>
        {classData.description && (
          <p className="mt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {classData.description}
          </p>
        )}
      </div>

      {/* Students Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Students</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--muted-foreground)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            No Students Yet
          </h3>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
            Add students to this class to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-gradient-to-r from-teal-500 to-teal-600 text-white"
          >
            Add First Student
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "var(--muted)" }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Guardian</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Gender</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-[var(--muted)] animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-medium"
                          style={{
                            backgroundColor: "var(--secondary)",
                            color: "var(--primary)",
                          }}
                        >
                          {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "var(--foreground)" }}>
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm" style={{ color: "var(--primary)" }}>
                        {student.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {student.email || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {student.guardian_name && (
                        <div>
                          <p className="text-sm" style={{ color: "var(--foreground)" }}>{student.guardian_name}</p>
                          {student.guardian_phone && (
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{student.guardian_phone}</p>
                          )}
                        </div>
                      )}
                      {!student.guardian_name && <span style={{ color: "var(--muted-foreground)" }}>-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize" style={{ color: "var(--foreground)" }}>
                      {student.gender || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/student/${student.id}`)}
                          className="text-sm font-medium transition-colors hover:text-blue-600"
                          style={{ color: "var(--primary)" }}
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleViewCredentials(student)}
                          className="text-sm font-medium transition-colors hover:text-teal-600"
                          style={{ color: "var(--primary)" }}
                        >
                          Credentials
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStudent(student);
                          }}
                          className="text-sm font-medium transition-colors hover:text-red-600"
                          style={{ color: "var(--primary)" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleStudentCreated}
        classId={classId}
        schoolId={schoolId}
        schoolCode={classData.school?.code || ""}
        className={classData.name}
      />

      <CredentialsModal
        isOpen={showCredentials}
        onClose={() => {
          setShowCredentials(false);
          setSelectedStudent(null);
          setNewStudentData(null);
        }}
        type="student"
        data={
          newStudentData
            ? {
                name: `${newStudentData.first_name} ${newStudentData.last_name}`,
                username: newStudentData.generated_username || newStudentData.username,
                password: newStudentData.generated_password || newStudentData.plain_password || "1234",
              }
            : selectedStudent
            ? {
                name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
                username: selectedStudent.username,
                password: selectedStudent.plain_password || "1234",
              }
            : { name: "", password: "" }
        }
      />

      {/* Delete Student Modal */}
      {deletingStudent && showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Student</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deletingStudent.first_name} {deletingStudent.last_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingStudent(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



