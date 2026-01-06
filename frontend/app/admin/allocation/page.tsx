"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";
import {
  AllocationDetail,
  CreateSchedulePayload,
  UpdateSchedulePayload,
  AssignTutorPayload,
  AssignCourseLevelPayload,
  UpdateCourseLevelStatusPayload,
  ClassCourseLevelAssignment,
  DAYS_OF_WEEK,
  TUTOR_ROLES,
} from "./types";
import { Tutor } from "../tutor/types";
import { School, Class } from "../school/types";
import { Course, CourseLevel } from "../courses/types";

type ViewMode = "selection" | "schools" | "classes" | "tutors" | "tutor-detail" | "course-editor";

export default function AllocationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("selection");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allocations, setAllocations] = useState<AllocationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal states
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCourseLevelModal, setShowCourseLevelModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<AllocationDetail | null>(null);
  
  // Form states
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"lead" | "assistant">("lead");
  const [scheduleDay, setScheduleDay] = useState<"monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday">("monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  
  // Course level states
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [selectedCourseLevelId, setSelectedCourseLevelId] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<"enrolled" | "completed">("enrolled");
  
  // Tutor detail states
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [tutorDetails, setTutorDetails] = useState<any>(null);

  // Course editor assignment states
  const [courseEditorAssignments, setCourseEditorAssignments] = useState<any[]>([]);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editorType, setEditorType] = useState<"inter" | "exter">("inter");
  const [editorLink, setEditorLink] = useState("");

  useEffect(() => {
    if (viewMode === "schools") {
      fetchSchools();
    } else if (viewMode === "classes" && selectedSchool) {
      fetchClasses();
      fetchAllocations();
    } else if (viewMode === "tutors") {
      fetchTutors();
    } else if (viewMode === "course-editor") {
      fetchCourses();
      fetchCourseEditorAssignments();
    }
    if (viewMode !== "tutor-detail" && viewMode !== "course-editor") {
      fetchTutors();
      fetchCourses();
    }
  }, [viewMode, selectedSchool]);

  useEffect(() => {
    if (viewMode === "tutor-detail" && selectedTutor) {
      fetchTutorDetails(selectedTutor.id);
    }
  }, [viewMode, selectedTutor]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseLevels(selectedCourseId);
    } else {
      setCourseLevels([]);
    }
  }, [selectedCourseId]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/schools");
      setSchools(response.data.filter((s: School) => s.status === "active"));
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      setError(err.response?.data?.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!selectedSchool) return;
    try {
      const response = await apiClient.get(`/schools/${selectedSchool.id}/classes`);
      setClasses(response.data.filter((c: Class) => c.status === "active"));
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || "Failed to load classes");
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await apiClient.get("/allocations");
      setAllocations(response.data);
    } catch (err: any) {
      console.error("Error fetching allocations:", err);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiClient.get("/tutors");
      setTutors(response.data.filter((t: Tutor) => t.status === "active"));
    } catch (err) {
      console.error("Error fetching tutors:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get("/courses");
      setCourses(response.data.filter((c: Course) => c.status === "active"));
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchCourseLevels = async (courseId: string) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/levels`);
      setCourseLevels(response.data.filter((l: CourseLevel) => l.status === "active"));
    } catch (err) {
      console.error("Error fetching course levels:", err);
      setCourseLevels([]);
    }
  };

  const fetchCourseEditorAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/allocations/course-editors");
      setCourseEditorAssignments(response.data || []);
    } catch (err: any) {
      console.error("Error fetching course editor assignments:", err);
      setError(err.response?.data?.message || "Failed to load course editor assignments");
      setCourseEditorAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorDetails = async (tutorId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/allocations/tutor/${tutorId}`);
      setTutorDetails(response.data);
    } catch (err: any) {
      console.error("Error fetching tutor details:", err);
      setError(err.response?.data?.message || "Failed to load tutor details");
      setTutorDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourseEditor = async (courseId: string) => {
    if (!editorLink.trim()) {
      alert("Please enter an editor link");
      return;
    }

    try {
      await apiClient.post("/allocations/course-editors", {
        course_id: courseId,
        editor_type: editorType,
        editor_link: editorLink,
      });
      
      setEditingCourseId(null);
      setEditorLink("");
      setEditorType("inter");
      fetchCourseEditorAssignments();
      alert("Course editor assigned successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign course editor");
    }
  };

  const handleUpdateCourseEditor = async (assignmentId: string) => {
    if (!editorLink.trim()) {
      alert("Please enter an editor link");
      return;
    }

    try {
      await apiClient.put(`/allocations/course-editors/${assignmentId}`, {
        editor_type: editorType,
        editor_link: editorLink,
      });
      
      setEditingCourseId(null);
      setEditorLink("");
      setEditorType("inter");
      fetchCourseEditorAssignments();
      alert("Course editor updated successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update course editor");
    }
  };

  const handleDeleteCourseEditor = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this editor assignment?")) return;

    try {
      await apiClient.delete(`/allocations/course-editors/${assignmentId}`);
      fetchCourseEditorAssignments();
      alert("Course editor assignment removed successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove course editor assignment");
    }
  };

  const openCourseEditorModal = (course: Course, assignment?: any) => {
    setEditingCourseId(course.id);
    if (assignment) {
      setEditorType(assignment.editor_type);
      setEditorLink(assignment.editor_link);
    } else {
      setEditorType("inter");
      setEditorLink("");
    }
  };

  const handleSchoolClick = (school: School) => {
    setSelectedSchool(school);
    setViewMode("classes");
  };

  const getClassAllocation = (classId: string): AllocationDetail | null => {
    return allocations.find(a => a.class.id === classId) || null;
  };

  const handleAssignTutor = async () => {
    if (!selectedClass || !selectedTutorId) return;

    try {
      await apiClient.post("/allocations/assignments", {
        tutor_id: selectedTutorId,
        class_id: selectedClass.class.id,
        role: selectedRole,
      } as AssignTutorPayload);
      
      setShowAssignTutorModal(false);
      setSelectedTutorId("");
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign tutor");
    }
  };

  const handleUnassignTutor = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to unassign this tutor?")) return;

    try {
      await apiClient.delete(`/allocations/assignments/${assignmentId}`);
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unassign tutor");
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedClass) return;

    try {
      await apiClient.post("/allocations/schedules", {
        class_id: selectedClass.class.id,
        day_of_week: scheduleDay,
        start_time: startTime,
        end_time: endTime,
      } as CreateSchedulePayload);
      
      setShowScheduleModal(false);
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async (scheduleId: string) => {
    if (!selectedClass) return;

    try {
      await apiClient.put(`/allocations/schedules/${scheduleId}`, {
        day_of_week: scheduleDay,
        start_time: startTime,
        end_time: endTime,
      } as UpdateSchedulePayload);
      
      setShowScheduleModal(false);
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await apiClient.delete(`/allocations/schedules/${scheduleId}`);
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const openAssignTutorModal = async (classItem: Class | AllocationDetail['class']) => {
    const classId = 'id' in classItem ? classItem.id : classItem.id;
    const className = 'name' in classItem ? classItem.name : classItem.name;
    const classLevel = 'level' in classItem ? classItem.level : classItem.level;
    const studentCount = 'student_count' in classItem ? (classItem.student_count || 0) : 0;

    try {
      const response = await apiClient.get(`/allocations/class/${classId}`);
      setSelectedClass(response.data);
      setSelectedTutorId("");
      setSelectedRole("lead");
      setShowAssignTutorModal(true);
    } catch (err) {
      // If no allocation exists, create a basic one
      setSelectedClass({
        class: {
          id: classId,
          name: className,
          level: classLevel,
          school: selectedSchool!,
        },
        schedule: null,
        lead_tutor: null,
        assistant_tutor: null,
        student_count: studentCount,
      });
      setSelectedTutorId("");
      setSelectedRole("lead");
      setShowAssignTutorModal(true);
    }
  };

  const openScheduleModal = async (classItem: Class | AllocationDetail['class']) => {
    const classId = 'id' in classItem ? classItem.id : classItem.id;
    const className = 'name' in classItem ? classItem.name : classItem.name;
    const classLevel = 'level' in classItem ? classItem.level : classItem.level;
    const studentCount = 'student_count' in classItem ? (classItem.student_count || 0) : 0;

    try {
      const response = await apiClient.get(`/allocations/class/${classId}`);
      const allocation = response.data;
      setSelectedClass(allocation);
      if (allocation.schedule) {
        setScheduleDay(allocation.schedule.day_of_week);
        setStartTime(allocation.schedule.start_time.substring(0, 5));
        setEndTime(allocation.schedule.end_time.substring(0, 5));
      } else {
        setScheduleDay("monday");
        setStartTime("09:00");
        setEndTime("10:00");
      }
      setShowScheduleModal(true);
    } catch (err) {
      // If no allocation exists, create a basic one
      setSelectedClass({
        class: {
          id: classId,
          name: className,
          level: classLevel,
          school: selectedSchool!,
        },
        schedule: null,
        lead_tutor: null,
        assistant_tutor: null,
        student_count: studentCount,
      });
      setScheduleDay("monday");
      setStartTime("09:00");
      setEndTime("10:00");
      setShowScheduleModal(true);
    }
  };

  const openDetailModal = async (classItem: Class | AllocationDetail['class']) => {
    const classId = 'id' in classItem ? classItem.id : classItem.id;
    const className = 'name' in classItem ? classItem.name : classItem.name;
    const classLevel = 'level' in classItem ? classItem.level : classItem.level;
    const studentCount = 'student_count' in classItem ? (classItem.student_count || 0) : 0;

    try {
      const response = await apiClient.get(`/allocations/class/${classId}`);
      setSelectedClass(response.data);
      setShowDetailModal(true);
    } catch (err) {
      // If no allocation exists, create a basic one
      setSelectedClass({
        class: {
          id: classId,
          name: className,
          level: classLevel,
          school: selectedSchool!,
        },
        schedule: null,
        lead_tutor: null,
        assistant_tutor: null,
        course_levels: [],
        student_count: studentCount,
      });
      setShowDetailModal(true);
    }
  };

  const openCourseLevelModal = async (classItem: Class | AllocationDetail['class']) => {
    const classId = 'id' in classItem ? classItem.id : classItem.id;
    const className = 'name' in classItem ? classItem.name : classItem.name;
    const classLevel = 'level' in classItem ? classItem.level : classItem.level;
    const studentCount = 'student_count' in classItem ? (classItem.student_count || 0) : 0;

    try {
      const response = await apiClient.get(`/allocations/class/${classId}`);
      setSelectedClass(response.data);
    } catch (err) {
      setSelectedClass({
        class: {
          id: classId,
          name: className,
          level: classLevel,
          school: selectedSchool!,
        },
        schedule: null,
        lead_tutor: null,
        assistant_tutor: null,
        course_levels: [],
        student_count: studentCount,
      });
    }
    setSelectedCourseId("");
    setSelectedCourseLevelId("");
    setEnrollmentStatus("enrolled");
    setShowCourseLevelModal(true);
  };

  const handleAssignCourseLevel = async () => {
    if (!selectedClass || !selectedCourseLevelId) return;

    try {
      await apiClient.post("/allocations/course-levels", {
        class_id: selectedClass.class.id,
        course_level_id: selectedCourseLevelId,
        enrollment_status: enrollmentStatus,
      } as AssignCourseLevelPayload);
      
      setShowCourseLevelModal(false);
      setSelectedCourseId("");
      setSelectedCourseLevelId("");
      setEnrollmentStatus("enrolled");
      
      // Refresh allocations and selected class
      await fetchAllocations();
      
      // Refresh the selected class data
      try {
        const response = await apiClient.get(`/allocations/class/${selectedClass.class.id}`);
        setSelectedClass(response.data);
      } catch (err) {
        console.error("Error refreshing class data:", err);
      }
      
      alert("Course level assigned successfully!");
    } catch (err: any) {
      console.error("Error assigning course level:", err);
      alert(err.response?.data?.message || "Failed to assign course level");
    }
  };

  const handleUpdateCourseLevelStatus = async (assignmentId: string, status: "enrolled" | "completed") => {
    try {
      await apiClient.put(`/allocations/course-levels/${assignmentId}`, {
        enrollment_status: status,
      } as UpdateCourseLevelStatusPayload);
      
      fetchAllocations();
      if (selectedClass) {
        const response = await apiClient.get(`/allocations/class/${selectedClass.class.id}`);
        setSelectedClass(response.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update course level status");
    }
  };

  const handleDeleteCourseLevel = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this course level assignment?")) return;

    try {
      await apiClient.delete(`/allocations/course-levels/${assignmentId}`);
      fetchAllocations();
      if (selectedClass) {
        const response = await apiClient.get(`/allocations/class/${selectedClass.class.id}`);
        setSelectedClass(response.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove course level assignment");
    }
  };

  // Selection View
  if (viewMode === "selection") {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Allocation Management"
          description="Assign tutors to classes and manage schedules"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
          <button
            onClick={() => setViewMode("schools")}
            className="group relative bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">School</h3>
              <p className="text-white/90 text-sm">Assign tutors to classes by school</p>
            </div>
          </button>

          <button
            onClick={() => setViewMode("tutors")}
            className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Tutor</h3>
              <p className="text-white/90 text-sm">View and manage tutor assignments</p>
            </div>
          </button>

          <button
            onClick={() => setViewMode("course-editor")}
            className="group relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Course Editor</h3>
              <p className="text-white/90 text-sm">Assign internal or external editors to courses</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Schools View
  if (viewMode === "schools") {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setViewMode("selection")}
              className="flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-2 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Selection
            </button>
            <PageHeader
              title="Select a School"
              description="Choose a school to manage class allocations"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {schools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">No active schools found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                onClick={() => handleSchoolClick(school)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg hover:border-violet-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-violet-500 transition-colors">
                      {school.name}
                    </h3>
                    <p className="text-sm text-[var(--foreground)] opacity-80 mt-1">
                      Code: {school.code}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-[var(--foreground)] opacity-80">
                  {school.location && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{school.location}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{school.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--foreground)] opacity-70">
                    {school.class_count || 0} classes
                  </span>
                  <svg className="w-5 h-5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Classes View (after selecting a school)
  if (viewMode === "classes" && selectedSchool) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setViewMode("schools");
                setSelectedSchool(null);
              }}
              className="flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-2 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Schools
            </button>
            <PageHeader
              title={`${selectedSchool.name} - Classes`}
              description="Assign tutors and manage schedules for classes"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--foreground)] opacity-70">No active classes found for this school</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((classItem) => {
              const allocation = getClassAllocation(classItem.id);
              return (
                <div
                  key={classItem.id}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-[var(--foreground)] opacity-80">
                        {classItem.level} • {classItem.student_count || 0} students
                      </p>
                    </div>
                    <button
                      onClick={() => openDetailModal(classItem)}
                      className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 rounded-lg transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Schedule */}
                    <div className="bg-[var(--background)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[var(--foreground)]">Schedule</h4>
                        <button
                          onClick={() => openScheduleModal(classItem)}
                          className="text-xs text-violet-500 hover:text-violet-600"
                        >
                          {allocation?.schedule ? "Edit" : "Set"}
                        </button>
                      </div>
                      {allocation?.schedule ? (
                        <div className="text-sm text-[var(--foreground)]">
                          <p className="capitalize font-medium">{allocation.schedule.day_of_week}</p>
                          <p className="text-[var(--foreground)] opacity-90">
                            {allocation.schedule.start_time.substring(0, 5)} - {allocation.schedule.end_time.substring(0, 5)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--foreground)] opacity-70 italic">No schedule set</p>
                      )}
                    </div>

                    {/* Tutors */}
                    <div className="bg-[var(--background)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[var(--foreground)]">Tutors</h4>
                        <button
                          onClick={() => openAssignTutorModal(classItem)}
                          className="text-xs text-violet-500 hover:text-violet-600"
                          disabled={
                            allocation?.lead_tutor && allocation?.assistant_tutor
                          }
                        >
                          Assign
                        </button>
                      </div>
                      <div className="space-y-2">
                        {allocation?.lead_tutor ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground)]">
                              <span className="font-medium">Lead:</span> {allocation.lead_tutor.tutor?.first_name} {allocation.lead_tutor.tutor?.last_name}
                            </span>
                            <button
                              onClick={() => handleUnassignTutor(allocation.lead_tutor!.id)}
                              className="text-red-500 hover:text-red-600 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--foreground)] opacity-70 italic">No lead tutor</p>
                        )}
                        {allocation?.assistant_tutor ? (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--foreground)]">
                              <span className="font-medium">Assistant:</span> {allocation.assistant_tutor.tutor?.first_name} {allocation.assistant_tutor.tutor?.last_name}
                            </span>
                            <button
                              onClick={() => handleUnassignTutor(allocation.assistant_tutor!.id)}
                              className="text-red-500 hover:text-red-600 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--foreground)] opacity-70 italic">No assistant tutor</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Levels */}
                  <div className="bg-[var(--background)] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[var(--foreground)]">Course Levels</h4>
                      <button
                        onClick={() => openCourseLevelModal(classItem)}
                        className="text-xs text-violet-500 hover:text-violet-600"
                      >
                        + Assign
                      </button>
                    </div>
                    {allocation?.course_levels && allocation.course_levels.length > 0 ? (
                      <div className="space-y-2">
                        {allocation.course_levels.slice(0, 3).map((assignment) => (
                          <div key={assignment.id} className="text-sm text-[var(--foreground)]">
                            <p className="font-medium truncate">
                              {assignment.course_level?.course?.name} - {assignment.course_level?.name}
                            </p>
                            <p className={`text-xs ${
                              assignment.enrollment_status === 'completed' 
                                ? 'text-green-600' 
                                : 'text-blue-600'
                            }`}>
                              {assignment.enrollment_status === 'completed' ? '✓ Completed' : 'Enrolled'}
                            </p>
                          </div>
                        ))}
                        {allocation.course_levels.length > 3 && (
                          <p className="text-xs text-[var(--foreground)] opacity-70">
                            +{allocation.course_levels.length - 3} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--foreground)] opacity-70 italic">No course levels assigned</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals - Same as before */}
        {showAssignTutorModal && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Assign Tutor to {selectedClass.class.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Select Tutor
                  </label>
                  <select
                    value={selectedTutorId}
                    onChange={(e) => setSelectedTutorId(e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="" className="bg-[var(--background)] text-[var(--foreground)]">Choose a tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id} className="bg-[var(--background)] text-[var(--foreground)]">
                        {tutor.first_name} {tutor.middle_name} {tutor.last_name} ({tutor.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as "lead" | "assistant")}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      (selectedRole === "lead" && selectedClass.lead_tutor !== null) ||
                      (selectedRole === "assistant" && selectedClass.assistant_tutor !== null)
                    }
                  >
                    {TUTOR_ROLES.map((role) => (
                      <option key={role.value} value={role.value} className="bg-[var(--background)] text-[var(--foreground)]">
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {(selectedRole === "lead" && selectedClass.lead_tutor) ||
                  (selectedRole === "assistant" && selectedClass.assistant_tutor) ? (
                    <p className="text-xs text-red-500 mt-1">This role is already assigned</p>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAssignTutorModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTutor}
                  disabled={!selectedTutorId}
                  className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {showScheduleModal && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                {selectedClass.schedule ? "Update" : "Set"} Schedule for {selectedClass.class.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Day of Week
                  </label>
                  <select
                    value={scheduleDay}
                    onChange={(e) => setScheduleDay(e.target.value as any)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value} className="bg-[var(--background)] text-[var(--foreground)]">
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {selectedClass.schedule && (
                  <button
                    onClick={() => handleDeleteSchedule(selectedClass.schedule!.id)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    selectedClass.schedule
                      ? handleUpdateSchedule(selectedClass.schedule.id)
                      : handleCreateSchedule()
                  }
                  className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  {selectedClass.schedule ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Allocation Details - {selectedClass.class.name}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-[var(--foreground)] opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Class Information</h3>
                  <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                    <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Name:</span> <span className="ml-2">{selectedClass.class.name}</span></p>
                    <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Level:</span> <span className="ml-2">{selectedClass.class.level}</span></p>
                    <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">School:</span> <span className="ml-2">{selectedClass.class.school.name} ({selectedClass.class.school.code})</span></p>
                    <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Students:</span> <span className="ml-2">{selectedClass.student_count}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Schedule</h3>
                  {selectedClass.schedule ? (
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Day:</span> <span className="ml-2 capitalize">{selectedClass.schedule.day_of_week}</span></p>
                      <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Time:</span> <span className="ml-2">{selectedClass.schedule.start_time.substring(0, 5)} - {selectedClass.schedule.end_time.substring(0, 5)}</span></p>
                    </div>
                  ) : (
                    <div className="bg-[var(--background)] rounded-lg p-4 text-[var(--foreground)] opacity-70 italic">
                      No schedule set
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Assigned Tutors</h3>
                  <div className="space-y-3">
                    {selectedClass.lead_tutor ? (
                      <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                        <p className="font-medium text-[var(--foreground)] mb-2">Lead Tutor</p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Name:</span> <span className="ml-2">{selectedClass.lead_tutor.tutor?.first_name} {selectedClass.lead_tutor.tutor?.middle_name} {selectedClass.lead_tutor.tutor?.last_name}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Email:</span> <span className="ml-2">{selectedClass.lead_tutor.tutor?.email}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Phone:</span> <span className="ml-2">{selectedClass.lead_tutor.tutor?.phone}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Level:</span> <span className="ml-2">{selectedClass.lead_tutor.tutor?.level}</span></p>
                      </div>
                    ) : (
                      <div className="bg-[var(--background)] rounded-lg p-4 text-[var(--foreground)] opacity-70 italic">
                        No lead tutor assigned
                      </div>
                    )}

                    {selectedClass.assistant_tutor ? (
                      <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                        <p className="font-medium text-[var(--foreground)] mb-2">Assistant Tutor</p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Name:</span> <span className="ml-2">{selectedClass.assistant_tutor.tutor?.first_name} {selectedClass.assistant_tutor.tutor?.middle_name} {selectedClass.assistant_tutor.tutor?.last_name}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Email:</span> <span className="ml-2">{selectedClass.assistant_tutor.tutor?.email}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Phone:</span> <span className="ml-2">{selectedClass.assistant_tutor.tutor?.phone}</span></p>
                        <p className="text-[var(--foreground)]"><span className="font-medium opacity-80">Level:</span> <span className="ml-2">{selectedClass.assistant_tutor.tutor?.level}</span></p>
                      </div>
                    ) : (
                      <div className="bg-[var(--background)] rounded-lg p-4 text-[var(--foreground)] opacity-70 italic">
                        No assistant tutor assigned
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[var(--foreground)]">Course Levels</h3>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openCourseLevelModal(selectedClass.class);
                      }}
                      className="text-xs text-violet-500 hover:text-violet-600 font-medium"
                    >
                      + Assign Course Level
                    </button>
                  </div>
                  {selectedClass.course_levels && Array.isArray(selectedClass.course_levels) && selectedClass.course_levels.length > 0 ? (
                    <div className="space-y-2">
                      {selectedClass.course_levels.map((assignment: any) => (
                        <div key={assignment.id} className="bg-[var(--background)] rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[var(--foreground)] font-medium">
                              {assignment.course_level?.course?.name || 'Unknown Course'} - {assignment.course_level?.name || 'Unknown Level'}
                            </p>
                            <p className="text-xs text-[var(--foreground)] opacity-70">
                              {assignment.course_level?.course?.code || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={assignment.enrollment_status}
                              onChange={(e) => handleUpdateCourseLevelStatus(assignment.id, e.target.value as "enrolled" | "completed")}
                              className="px-3 py-1 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              <option value="enrolled">Enrolled</option>
                              <option value="completed">Completed</option>
                            </select>
                            <button
                              onClick={() => handleDeleteCourseLevel(assignment.id)}
                              className="px-2 py-1 text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[var(--background)] rounded-lg p-4 text-[var(--foreground)] opacity-70 italic">
                      No course levels assigned
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openAssignTutorModal(selectedClass.class);
                  }}
                  className="flex-1 px-4 py-2 bg-violet-500/10 text-violet-500 rounded-lg hover:bg-violet-500/20 transition-colors"
                  disabled={selectedClass.lead_tutor && selectedClass.assistant_tutor}
                >
                  Assign Tutor
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openScheduleModal(selectedClass.class);
                  }}
                  className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  {selectedClass.schedule ? "Update Schedule" : "Set Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Level Assignment Modal */}
        {showCourseLevelModal && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Assign Course Level to {selectedClass.class.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedCourseLevelId("");
                    }}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="" className="bg-[var(--background)] text-[var(--foreground)]">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="bg-[var(--background)] text-[var(--foreground)]">
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourseId && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Select Course Level
                    </label>
                    <select
                      value={selectedCourseLevelId}
                      onChange={(e) => setSelectedCourseLevelId(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="" className="bg-[var(--background)] text-[var(--foreground)]">Choose a level...</option>
                      {courseLevels.map((level) => (
                        <option key={level.id} value={level.id} className="bg-[var(--background)] text-[var(--foreground)]">
                          {level.name} (Level {level.level_number})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Enrollment Status
                  </label>
                  <select
                    value={enrollmentStatus}
                    onChange={(e) => setEnrollmentStatus(e.target.value as "enrolled" | "completed")}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={!selectedCourseLevelId}
                  >
                    <option value="enrolled" className="bg-[var(--background)] text-[var(--foreground)]">Enrolled</option>
                    <option value="completed" className="bg-[var(--background)] text-[var(--foreground)]">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCourseLevelModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignCourseLevel}
                  disabled={!selectedCourseLevelId}
                  className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tutors View
  if (viewMode === "tutors") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setViewMode("selection")}
              className="flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-2 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Selection
            </button>
            <PageHeader
              title="Tutor Allocations"
              description="View and manage tutor assignments"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutors.filter(t => t.status === "active").map((tutor) => (
              <div
                key={tutor.id}
                onClick={() => {
                  setSelectedTutor(tutor);
                  setViewMode("tutor-detail");
                }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer hover:border-violet-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                      {tutor.first_name} {tutor.middle_name} {tutor.last_name}
                    </h3>
                    <p className="text-sm text-[var(--foreground)] opacity-70">{tutor.email}</p>
                    <p className="text-xs text-[var(--foreground)] opacity-60 mt-1">Level: {tutor.level}</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Click to view details</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Course Editor Assignment View
  if (viewMode === "course-editor") {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setViewMode("selection")}
              className="flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-2 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Selection
            </button>
            <PageHeader
              title="Course Editor Assignment"
              description="Assign internal or external editors to courses via links"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Courses List */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">All Courses</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Click on a course to assign or update its editor
            </p>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {courses.length === 0 ? (
              <div className="p-8 text-center text-[var(--muted-foreground)]">
                No courses found
              </div>
            ) : (
              courses.map((course) => {
                const assignment = courseEditorAssignments.find(
                  (a: any) => a.course_id === course.id
                );

                return (
                  <div
                    key={course.id}
                    className="p-6 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {course.icon_image_url ? (
                            <img
                              src={course.icon_image_url}
                              alt={course.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {course.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-semibold text-[var(--foreground)]">
                              {course.name}
                            </h4>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Code: {course.code}
                            </p>
                          </div>
                        </div>

                        {assignment && (
                          <div className="mt-3 ml-15 flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                assignment.editor_type === "inter"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              }`}
                            >
                              {assignment.editor_type === "inter" ? "Internal" : "External"}
                            </span>
                            <a
                              href={assignment.editor_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Editor
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCourseEditorModal(course, assignment)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          {assignment ? "Update" : "Assign"}
                        </button>
                        {assignment && (
                          <button
                            onClick={() => handleDeleteCourseEditor(assignment.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {editingCourseId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {courseEditorAssignments.find((a: any) => a.course_id === editingCourseId)
                    ? "Update Course Editor"
                    : "Assign Course Editor"}
                </h3>
                <button
                  onClick={() => {
                    setEditingCourseId(null);
                    setEditorLink("");
                    setEditorType("inter");
                  }}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    value={courses.find((c) => c.id === editingCourseId)?.name || ""}
                    disabled
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Editor Type
                  </label>
                  <select
                    value={editorType}
                    onChange={(e) => setEditorType(e.target.value as "inter" | "exter")}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  >
                    <option value="inter">Internal</option>
                    <option value="exter">External</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Editor Link
                  </label>
                  <input
                    type="url"
                    value={editorLink}
                    onChange={(e) => setEditorLink(e.target.value)}
                    placeholder="https://example.com/editor"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Enter the URL link to the editor (internal or external)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditingCourseId(null);
                      setEditorLink("");
                      setEditorType("inter");
                    }}
                    className="flex-1 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--border)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const assignment = courseEditorAssignments.find(
                        (a: any) => a.course_id === editingCourseId
                      );
                      if (assignment) {
                        handleUpdateCourseEditor(assignment.id);
                      } else {
                        handleAssignCourseEditor(editingCourseId);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {courseEditorAssignments.find((a: any) => a.course_id === editingCourseId)
                      ? "Update"
                      : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tutor Detail View
  if (viewMode === "tutor-detail" && selectedTutor && tutorDetails) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setViewMode("tutors");
                setSelectedTutor(null);
                setTutorDetails(null);
              }}
              className="flex items-center gap-2 text-[var(--foreground)] opacity-70 hover:opacity-100 mb-2 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tutors
            </button>
            <PageHeader
              title={`${tutorDetails.tutor.first_name} ${tutorDetails.tutor.middle_name} ${tutorDetails.tutor.last_name}`}
              description={`${tutorDetails.tutor.email} • Level: ${tutorDetails.tutor.level}`}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Schools</h3>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{tutorDetails.summary.total_schools}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Classes</h3>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{tutorDetails.summary.total_classes}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Students</h3>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{tutorDetails.summary.total_students}</p>
          </div>
        </div>

        {/* Schools and Classes */}
        <div className="space-y-6">
          {tutorDetails.schools.map((school: any) => (
            <div key={school.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">{school.name}</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Code: {school.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--foreground)] opacity-70">Classes: {school.classes.length}</p>
                  <p className="text-sm text-[var(--foreground)] opacity-70">
                    Students: {school.classes.reduce((sum: number, cls: any) => sum + cls.student_count, 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {school.classes.map((classItem: any) => (
                  <div
                    key={classItem.id}
                    className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:border-violet-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--foreground)] mb-1">{classItem.name}</h4>
                        <p className="text-xs text-[var(--foreground)] opacity-70">Level: {classItem.level}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        classItem.role === 'lead'
                          ? 'bg-violet-500/10 text-violet-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {classItem.role === 'lead' ? 'Lead' : 'Assistant'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                      <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">{classItem.student_count}</span>
                      <span className="opacity-70">students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {tutorDetails.schools.length === 0 && (
            <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
              <p className="text-[var(--foreground)] opacity-70">No schools or classes assigned to this tutor</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
