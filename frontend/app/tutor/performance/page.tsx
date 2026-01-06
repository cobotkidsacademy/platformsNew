"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";

interface TopicResult {
  topic_id: string;
  topic_name: string;
  quizzes: Array<{
    quiz_id: string;
    passed: boolean;
    percentage: number;
    category: 'BE' | 'AP' | 'ME' | 'EE' | null;
  }>;
}

interface StudentPerformance {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  topics: TopicResult[];
}

interface ClassGroup {
  school: {
    id: string;
    name: string;
    code: string;
  } | null;
  class: {
    id: string;
    name: string;
    level: string;
  } | null;
  students: StudentPerformance[];
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

interface CourseLevel {
  id: string;
  name: string;
  level_number: number;
  course_id: string;
  course_name: string;
}

export default function TutorPerformancePage() {
  const [performanceData, setPerformanceData] = useState<ClassGroup[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCourseLevelId, setSelectedCourseLevelId] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");

  useEffect(() => {
    fetchSchools();
    fetchPerformanceData();
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
    if (selectedClassId) {
      fetchCourseLevels(selectedClassId);
    } else {
      setCourseLevels([]);
      setSelectedCourseLevelId("");
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedSchoolId, selectedClassId, selectedCourseLevelId, nameFilter]);

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

  const fetchCourseLevels = async (classId: string) => {
    try {
      // Get course levels from the class's enrolled course levels
      // We'll need to get this from the performance data or create a separate endpoint
      // For now, we'll fetch it from the exam data of the first student
      const studentsResponse = await apiClient.get(`/allocations/tutor/me/students?class_id=${classId}`);
      const students = studentsResponse.data || [];
      if (students.length > 0) {
        const examResponse = await apiClient.get(`/allocations/tutor/me/students/${students[0].id}/exam`);
        const examData = examResponse.data || [];
        const levels = examData.map((level: any) => ({
          id: level.course_level_id,
          name: level.course_level_name,
          level_number: level.level_number,
          course_id: level.course_id,
          course_name: level.course_name,
        }));
        setCourseLevels(levels);
      }
    } catch (err: any) {
      console.error("Error fetching course levels:", err);
      setCourseLevels([]);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSchoolId) params.append("school_id", selectedSchoolId);
      if (selectedClassId) params.append("class_id", selectedClassId);
      if (selectedCourseLevelId) params.append("course_level_id", selectedCourseLevelId);
      if (nameFilter) params.append("name", nameFilter);

      const url = `/allocations/tutor/me/performance${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiClient.get(url);
      setPerformanceData(response.data || []);
    } catch (err: any) {
      console.error("Error fetching performance data:", err);
      setError(err.response?.data?.message || "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  // Get all unique topics across all students
  const getAllTopics = (): string[] => {
    const topicSet = new Set<string>();
    performanceData.forEach((group) => {
      group.students.forEach((student) => {
        student.topics.forEach((topic) => {
          topicSet.add(topic.topic_id);
        });
      });
    });
    return Array.from(topicSet);
  };

  // Get topic name by ID
  const getTopicName = (topicId: string): string => {
    for (const group of performanceData) {
      for (const student of group.students) {
        const topic = student.topics.find((t) => t.topic_id === topicId);
        if (topic) return topic.topic_name;
      }
    }
    return "Unknown Topic";
  };

  // Get topic results for a student
  const getTopicResults = (student: StudentPerformance, topicId: string): TopicResult | null => {
    return student.topics.find((t) => t.topic_id === topicId) || null;
  };

  // Render cell content for a topic
  const renderTopicCell = (student: StudentPerformance, topicId: string) => {
    const topicResult = getTopicResults(student, topicId);
    if (!topicResult || topicResult.quizzes.length === 0) {
      return <span className="text-gray-400">—</span>;
    }

    // Get the best result (highest category)
    const bestResult = topicResult.quizzes.reduce((best, quiz) => {
      if (!best) return quiz;
      if (!quiz.category) return best;
      if (!best.category) return quiz;
      
      const order = { EE: 4, ME: 3, AP: 2, BE: 1 };
      return order[quiz.category] > order[best.category] ? quiz : best;
    }, topicResult.quizzes[0]);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {bestResult.category && (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              bestResult.category === 'EE'
                ? 'bg-green-100 text-green-700'
                : bestResult.category === 'ME'
                ? 'bg-blue-100 text-blue-700'
                : bestResult.category === 'AP'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {bestResult.category}
          </span>
        )}
        <div className="flex gap-0.5">
          {topicResult.quizzes.map((quiz, idx) => (
            <span key={quiz.quiz_id || idx} className="text-sm">
              {quiz.passed ? (
                <span className="text-green-500">✓</span>
              ) : quiz.percentage > 0 ? (
                <span className="text-red-500">✗</span>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading && performanceData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const allTopics = getAllTopics();
  const hasFilters = selectedSchoolId || selectedClassId || selectedCourseLevelId || nameFilter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Performance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          View student performance by topic and quiz results
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                setSelectedClassId("");
                setSelectedCourseLevelId("");
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
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedCourseLevelId("");
              }}
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

          {/* Course Level Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Level</label>
            <select
              value={selectedCourseLevelId}
              onChange={(e) => setSelectedCourseLevelId(e.target.value)}
              disabled={!selectedClassId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Course Levels</option>
              {courseLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.course_name} - {level.name}
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

      {/* Performance Tables */}
      {performanceData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-600">
            {hasFilters ? "Try adjusting your filters" : "No students or course data available."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {performanceData.map((group, groupIndex) => (
            <div key={`${group.school?.id || 'no-school'}_${group.class?.id || 'no-class'}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {group.class?.name || "Unknown Class"}
                    </h2>
                    {group.school && (
                      <p className="text-sm text-gray-600 mt-1">
                        {group.school.name} ({group.school.code})
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-medium">
                    {group.students.length} {group.students.length === 1 ? 'Student' : 'Students'}
                  </span>
                </div>
              </div>

              {/* Performance Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                        Username
                      </th>
                      {allTopics.map((topicId) => (
                        <th
                          key={topicId}
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                        >
                          {getTopicName(topicId)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.students.map((student, studentIndex) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                          <div>
                            <div className="text-sm font-medium text-gray-900 font-mono">
                              {student.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.first_name} {student.last_name}
                            </div>
                          </div>
                        </td>
                        {allTopics.map((topicId) => (
                          <td key={topicId} className="px-4 py-4 text-center">
                            {renderTopicCell(student, topicId)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Legend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Performance Categories:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">EE</span>
                  <span className="text-sm text-gray-600">Exceeding Expectations (76-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700">ME</span>
                  <span className="text-sm text-gray-600">Meeting Expectations (51-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700">AP</span>
                  <span className="text-sm text-gray-600">Approaching (26-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">BE</span>
                  <span className="text-sm text-gray-600">Below Expectation (0-25%)</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Quiz Indicators:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">✓</span>
                  <span className="text-sm text-gray-600">Passed quiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-sm">✗</span>
                  <span className="text-sm text-gray-600">Failed quiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm">—</span>
                  <span className="text-sm text-gray-600">Not attempted</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Multiple indicators show multiple quizzes in the topic
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
