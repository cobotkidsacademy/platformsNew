"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import apiClient from "@/lib/api/client";

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

interface Topic {
  id: string;
  name: string;
  order_index: number;
  level_id: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface QuizPerformance {
  quiz_id: string;
  topic_id: string;
  percentage: number;
  category: 'EE' | 'ME' | 'AP' | 'BE' | null;
  passed: boolean;
}

interface StudentPerformance {
  student_id: string;
  student_name: string;
  performances: Map<string, QuizPerformance>; // key: topic_id, value: best performance
}

interface ClassInfo {
  name: string;
  school_name: string;
  lead_tutor?: string;
  assistant_tutor?: string;
}

export default function ClassPerformanceReportPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSchools();
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
      fetchReportData();
    } else {
      resetReportData();
    }
  }, [selectedClassId]);

  const fetchSchools = async () => {
    try {
      const response = await apiClient.get("/schools");
      setSchools(response.data.filter((s: School) => s.status === "active"));
    } catch (err: any) {
      console.error("Error fetching schools:", err);
      setError("Failed to load schools");
    }
  };

  const fetchClasses = async (schoolId: string) => {
    try {
      const response = await apiClient.get(`/schools/${schoolId}/classes`);
      setClasses(response.data);
      if (response.data.length === 0) {
        setSelectedClassId("");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes");
      setClasses([]);
    }
  };

  const fetchReportData = async () => {
    if (!selectedClassId) return;

    try {
      setLoading(true);
      setError("");

      // Fetch class info
      const classResponse = await apiClient.get(`/schools/classes/${selectedClassId}`);
      const classData = classResponse.data;
      
      // Fetch school info
      const schoolResponse = await apiClient.get(`/schools/${classData.school_id}`);
      const schoolData = schoolResponse.data;

      // Fetch allocation info for tutors
      let leadTutor = "";
      let assistantTutor = "";
      try {
        const allocationResponse = await apiClient.get(`/allocations/class/${selectedClassId}`);
        const allocation = allocationResponse.data;
        if (allocation.lead_tutor) {
          leadTutor = `${allocation.lead_tutor.first_name} ${allocation.lead_tutor.last_name}`;
        }
        if (allocation.assistant_tutor) {
          assistantTutor = `${allocation.assistant_tutor.first_name} ${allocation.assistant_tutor.last_name}`;
        }
      } catch (err) {
        console.log("No allocation found");
      }

      setClassInfo({
        name: classData.name,
        school_name: schoolData.name,
        lead_tutor: leadTutor,
        assistant_tutor: assistantTutor,
      });

      // Fetch enrolled course levels for this class
      const courseLevelsResponse = await apiClient.get(`/allocations/class/${selectedClassId}`);
      const allocation = courseLevelsResponse.data;
      const enrolledLevels = (allocation.course_levels || []).filter(
        (cl: any) => cl.enrollment_status === 'enrolled'
      );
      
      const levels: CourseLevel[] = enrolledLevels.map((cl: any) => ({
        id: cl.course_level_id || cl.id,
        name: cl.course_level?.name || cl.name,
        level_number: cl.course_level?.level_number || cl.level_number || 1,
        course_id: cl.course_level?.course_id || cl.course_id,
        course_name: cl.course_level?.course?.name || cl.course_name,
      }));
      setCourseLevels(levels);

      // Fetch all topics for enrolled course levels
      const levelIds = levels.map(l => l.id);
      let allTopics: Topic[] = [];
      if (levelIds.length > 0) {
        for (const levelId of levelIds) {
          try {
            const topicsResponse = await apiClient.get(`/courses/levels/${levelId}/topics`);
            const levelTopics = (topicsResponse.data || []).map((t: any) => ({
              id: t.id,
              name: t.name,
              order_index: t.order_index || 0,
              level_id: levelId,
            }));
            allTopics = [...allTopics, ...levelTopics];
          } catch (err) {
            console.error(`Error fetching topics for level ${levelId}:`, err);
          }
        }
        allTopics.sort((a, b) => a.order_index - b.order_index);
      }
      setTopics(allTopics);

      // Fetch students for this class
      const studentsResponse = await apiClient.get(`/schools/classes/${selectedClassId}/students`);
      const studentsData = (studentsResponse.data || []).map((s: any) => ({
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        username: s.username,
      }));
      setStudents(studentsData);

      // Fetch quiz performance data
      await fetchQuizPerformance(studentsData, allTopics);

    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizPerformance = async (studentsData: Student[], topicsData: Topic[]) => {
    try {
      const studentIds = studentsData.map(s => s.id);
      const topicIds = topicsData.map(t => t.id);
      const topicMap = new Map(topicsData.map(t => [t.id, t]));

      // Fetch quiz performance for all students
      const performanceMap = new Map<string, StudentPerformance>();

      // Initialize performance map
      studentsData.forEach(student => {
        performanceMap.set(student.id, {
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          performances: new Map(),
        });
      });

      // Fetch performance data using the quiz performance endpoint
      const params = new URLSearchParams();
      params.append("class_id", selectedClassId);
      params.append("status", "all"); // Get all attempts

      const performanceResponse = await apiClient.get(`/quizzes/performance?${params.toString()}`);
      const performanceData = performanceResponse.data;

      // Process quiz_data to get topic-level performance
      // Group quiz_data by topic_name and find best performance per topic per student
      if (performanceData.quiz_data) {
        // Create a map of topic_name -> topic_id
        const topicNameToId = new Map<string, string>();
        topicsData.forEach(topic => {
          topicNameToId.set(topic.name.toLowerCase(), topic.id);
        });

        // For each quiz, we need to get student attempts
        // We'll need to fetch individual quiz attempts or use the quiz_data structure
        // Since quiz_data has aggregated data, we need to get individual attempts
        
        // Fetch all quiz attempts for students in this class
        const attemptsParams = new URLSearchParams();
        attemptsParams.append("class_id", selectedClassId);
        
        // Get all quiz IDs from quiz_data
        const quizIds = performanceData.quiz_data.map((q: any) => q.quiz_id);
        
        // For each quiz, fetch student attempts
        const studentTopicPerformance = new Map<string, Map<string, QuizPerformance>>();
        
        // Initialize maps
        studentsData.forEach(student => {
          studentTopicPerformance.set(student.id, new Map());
        });

        // Process quiz_data to extract topic information
        performanceData.quiz_data.forEach((quiz: any) => {
          const topicName = quiz.topic_name;
          if (!topicName) return;
          
          // Find topic ID by name (case-insensitive)
          let topicId: string | undefined;
          for (const [name, id] of topicNameToId.entries()) {
            if (name === topicName.toLowerCase()) {
              topicId = id;
              break;
            }
          }
          
          // Also try exact match
          if (!topicId) {
            const foundTopic = topicsData.find(t => t.name.toLowerCase() === topicName.toLowerCase());
            topicId = foundTopic?.id;
          }
          
          if (!topicId || !topicIds.includes(topicId)) return;

          // For each student, we need to get their best performance for this quiz
          // Since we don't have per-student data in quiz_data, we'll need to fetch it
          // For now, we'll use a placeholder approach - we'll fetch attempts separately
        });

        // Fetch student quiz attempts from the performance endpoint's student_data
        // But we need topic-level data, so we'll need to match quizzes to topics
        // Let's fetch all quizzes for the topics and then get student attempts
        
        // Alternative: Use the student_data and match with quiz_data to get topic info
        if (performanceData.student_data && performanceData.quiz_data) {
          // Create a quiz_id -> topic_id mapping
          const quizToTopic = new Map<string, string>();
          performanceData.quiz_data.forEach((quiz: any) => {
            const topicName = quiz.topic_name;
            if (topicName) {
              const foundTopic = topicsData.find(t => 
                t.name.toLowerCase() === topicName.toLowerCase()
              );
              if (foundTopic) {
                quizToTopic.set(quiz.quiz_id, foundTopic.id);
              }
            }
          });

          // Now we need to get per-student, per-quiz performance
          // Since the API doesn't provide this directly, we'll need to make individual calls
          // or use a different approach
          
          // For now, let's use a simplified approach: fetch attempts for each student
          for (const student of studentsData) {
            try {
              // Fetch student's quiz attempts
              const studentAttemptsResponse = await apiClient.get(
                `/quizzes/performance?class_id=${selectedClassId}&status=all`
              );
              
              // We'll process this in a batch approach instead
              // Let's use the allocation performance endpoint which has better structure
              break; // Exit loop, we'll use a different approach
            } catch (err) {
              console.error(`Error fetching attempts for student ${student.id}:`, err);
            }
          }
        }
      }

      // Use allocation performance endpoint which has better structure
      try {
        const allocationPerfResponse = await apiClient.get(
          `/allocations/tutor/me/performance?class_id=${selectedClassId}`
        );
        const allocationData = allocationPerfResponse.data || [];
        
        // Process allocation performance data
        allocationData.forEach((classGroup: any) => {
          if (classGroup.students) {
            classGroup.students.forEach((student: any) => {
              const studentId = student.id;
              const perf = performanceMap.get(studentId);
              
              if (perf && student.topics) {
                student.topics.forEach((topicResult: any) => {
                  const topicId = topicResult.topic_id;
                  if (topicIds.includes(topicId)) {
                    // Get best performance from quizzes in this topic
                    let bestPercentage = 0;
                    let bestCategory: 'EE' | 'ME' | 'AP' | 'BE' | null = null;
                    
                    if (topicResult.quizzes && topicResult.quizzes.length > 0) {
                      topicResult.quizzes.forEach((quiz: any) => {
                        if (quiz.percentage > bestPercentage) {
                          bestPercentage = quiz.percentage;
                          bestCategory = categorizeScore(quiz.percentage);
                        }
                      });
                    }
                    
                    if (bestPercentage > 0 || bestCategory !== null) {
                      perf.performances.set(topicId, {
                        quiz_id: topicResult.quizzes?.[0]?.quiz_id || '',
                        topic_id: topicId,
                        percentage: bestPercentage,
                        category: bestCategory,
                        passed: bestPercentage >= 50, // Assuming 50% is passing
                      });
                    }
                  }
                });
              }
            });
          }
        });
      } catch (err) {
        console.error("Error fetching allocation performance:", err);
        // Fallback: set empty performances
      }

      setStudentPerformances(Array.from(performanceMap.values()));
    } catch (err: any) {
      console.error("Error fetching quiz performance:", err);
      // Set empty performances if error
      setStudentPerformances(
        studentsData.map(student => ({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          performances: new Map(),
        }))
      );
    }
  };

  const categorizeScore = (percentage: number): 'EE' | 'ME' | 'AP' | 'BE' | null => {
    if (percentage === 0) return null; // No attempt
    if (percentage <= 25) return 'BE';
    if (percentage <= 50) return 'AP';
    if (percentage <= 75) return 'ME';
    return 'EE';
  };

  const resetReportData = () => {
    setClassInfo(null);
    setCourseLevels([]);
    setTopics([]);
    setStudents([]);
    setStudentPerformances([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPerformanceDisplay = (topicId: string, studentId: string) => {
    const studentPerf = studentPerformances.find(sp => sp.student_id === studentId);
    if (!studentPerf) return { display: "X", color: "text-red-600", bgColor: "bg-red-50" };

    const perf = studentPerf.performances.get(topicId);
    if (!perf || perf.category === null) {
      return { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
    }

    const categoryMap: Record<string, { display: string; color: string; bgColor: string }> = {
      'EE': { display: "✓ EE", color: "text-green-700", bgColor: "bg-green-50" },
      'ME': { display: "✓ ME", color: "text-green-600", bgColor: "bg-green-50" },
      'AP': { display: "AP", color: "text-yellow-600", bgColor: "bg-yellow-50" },
      'BE': { display: "BE", color: "text-red-600", bgColor: "bg-red-50" },
    };

    return categoryMap[perf.category] || { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Class Student Performance Progress"
        description="View students performance progress by class"
      />

      {/* Filters */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select School</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!selectedSchoolId}
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && selectedClassId && classInfo && (
        <>
          {/* Class Info Header */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">School:</span> {classInfo.school_name}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">Class:</span> {classInfo.name}
                  </p>
                </div>
                {(classInfo.lead_tutor || classInfo.assistant_tutor) && (
                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    {classInfo.lead_tutor && (
                      <p>
                        <span className="font-medium text-[var(--foreground)]">Lead Tutor:</span> {classInfo.lead_tutor}
                      </p>
                    )}
                    {classInfo.assistant_tutor && (
                      <p>
                        <span className="font-medium text-[var(--foreground)]">Assistant Tutor:</span> {classInfo.assistant_tutor}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors font-medium"
              >
                Print Report
              </button>
            </div>
          </div>

          {/* Report Table */}
          {courseLevels.length > 0 ? (
            courseLevels.map((level) => {
              const levelTopics = topics.filter(t => {
                // Find which course level this topic belongs to
                return level.id === t.level_id;
              });

              if (levelTopics.length === 0) return null;

              return (
                <div key={level.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3">
                    <h3 className="text-lg font-bold text-white">{level.course_name} - {level.name}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[var(--muted)]">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--foreground)] sticky left-0 z-10 bg-[var(--muted)]">
                            Student
                          </th>
                          {levelTopics.map((topic) => (
                            <th
                              key={topic.id}
                              className="px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] min-w-[120px]"
                            >
                              {topic.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-[var(--muted)]/50">
                            <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)] sticky left-0 z-10 bg-[var(--card)]">
                              {student.first_name} {student.last_name}
                            </td>
                            {levelTopics.map((topic) => {
                              const perf = getPerformanceDisplay(topic.id, student.id);
                              return (
                                <td
                                  key={topic.id}
                                  className={`px-4 py-3 text-center text-sm font-medium ${perf.color} ${perf.bgColor}`}
                                >
                                  {perf.display}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
              <p className="text-[var(--muted-foreground)]">No enrolled course levels found for this class.</p>
            </div>
          )}
        </>
      )}

      {!loading && !selectedClassId && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <p className="text-[var(--muted-foreground)]">Please select a school and class to view the report.</p>
        </div>
      )}
    </div>
  );
}

