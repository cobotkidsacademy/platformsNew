"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  school: {
    id: string;
    name: string;
    code: string;
  };
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

interface Quiz {
  id: string;
  title: string;
  topic_id: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface StudentQuizBestScore {
  student_id: string;
  quiz_id: string;
  best_percentage: number;
  attempts: number;
}

interface StudentPerformance {
  student_id: string;
  student_name: string;
  topicPerformances: Map<string, {
    hasQuiz: boolean;
    hasAttempt: boolean;
    percentage: number;
    category: 'EE' | 'ME' | 'AE' | 'BE' | 'X' | null;
  }>;
}

interface ClassInfo {
  name: string;
  school_name: string;
  lead_tutor?: string;
  assistant_tutor?: string;
}

export default function TutorClassPerformanceReportPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [courseLevels, setCourseLevels] = useState<CourseLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTutorClasses();
  }, []);

  useEffect(() => {
    if (selectedSchoolId) {
      const schoolClasses = classes.filter(c => c.school_id === selectedSchoolId);
      if (schoolClasses.length === 0) {
        setSelectedClassId("");
      }
    }
  }, [selectedSchoolId, classes]);

  useEffect(() => {
    if (selectedClassId) {
      fetchReportData();
    } else {
      resetReportData();
    }
  }, [selectedClassId]);

  const fetchTutorClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/class-codes/tutor/me/classes");
      const tutorClasses = response.data.data || response.data || [];
      
      // Extract unique schools
      const uniqueSchools = new Map<string, School>();
      tutorClasses.forEach((cls: any) => {
        const school = cls.school || {};
        if (school.id && !uniqueSchools.has(school.id)) {
          uniqueSchools.set(school.id, {
            id: school.id,
            name: school.name,
            code: school.code,
          });
        }
      });
      
      setSchools(Array.from(uniqueSchools.values()));
      
      // Format classes
      const formattedClasses: Class[] = tutorClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        school_id: cls.school?.id || '',
        school: {
          id: cls.school?.id || '',
          name: cls.school?.name || '',
          code: cls.school?.code || '',
        },
      }));
      
      setClasses(formattedClasses);
    } catch (err: any) {
      console.error("Error fetching tutor classes:", err);
      setError(err.response?.data?.message || "Failed to load classes");
    } finally {
      setLoading(false);
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
      let allQuizzes: Quiz[] = [];
      
      if (levelIds.length > 0) {
        for (const levelId of levelIds) {
          try {
            // Fetch topics
            const topicsResponse = await apiClient.get(`/courses/levels/${levelId}/topics`);
            const levelTopics = (topicsResponse.data || []).map((t: any) => ({
              id: t.id,
              name: t.name,
              order_index: t.order_index || 0,
              level_id: levelId,
            }));
            allTopics = [...allTopics, ...levelTopics];
            
            // Fetch quizzes for each topic
            for (const topic of levelTopics) {
              try {
                const quizzesResponse = await apiClient.get(`/quizzes/topic/${topic.id}`);
                const topicQuizzes = (quizzesResponse.data || []).map((q: any) => ({
                  id: q.id,
                  title: q.title,
                  topic_id: topic.id,
                }));
                allQuizzes = [...allQuizzes, ...topicQuizzes];
              } catch (err) {
                console.error(`Error fetching quizzes for topic ${topic.id}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error fetching topics for level ${levelId}:`, err);
          }
        }
        allTopics.sort((a, b) => a.order_index - b.order_index);
      }
      setTopics(allTopics);
      setQuizzes(allQuizzes);

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
      await fetchQuizPerformance(studentsData, allTopics, allQuizzes);

    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizPerformance = async (studentsData: Student[], topicsData: Topic[], quizzesData: Quiz[]) => {
    try {
      const studentIds = studentsData.map(s => s.id);
      const quizIds = quizzesData.map(q => q.id);
      
      // Create topic to quiz mapping
      const topicToQuizzes = new Map<string, Quiz[]>();
      quizzesData.forEach(quiz => {
        if (!topicToQuizzes.has(quiz.topic_id)) {
          topicToQuizzes.set(quiz.topic_id, []);
        }
        topicToQuizzes.get(quiz.topic_id)!.push(quiz);
      });

      // Fetch student quiz best scores using allocation performance endpoint
      const studentBestScores = new Map<string, Map<string, StudentQuizBestScore>>();
      
      // Initialize maps
      studentsData.forEach(student => {
        studentBestScores.set(student.id, new Map());
      });

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
              const studentScores = studentBestScores.get(studentId);
              
              if (studentScores && student.topics) {
                student.topics.forEach((topicResult: any) => {
                  if (topicResult.quizzes) {
                    topicResult.quizzes.forEach((quiz: any) => {
                      // Treat a non-null category as \"has attempted\" (data comes from best scores)
                      const hasAttempt = quiz.category !== null;
                      if (hasAttempt) {
                        studentScores.set(quiz.quiz_id, {
                          student_id: studentId,
                          quiz_id: quiz.quiz_id,
                          best_percentage: quiz.percentage || 0,
                          // We don't have a real attempts count here; use 1 to indicate \"attempted\"
                          attempts: 1,
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      } catch (err) {
        console.error("Error fetching allocation performance:", err);
      }

      // Build student performance map
      const performanceMap = new Map<string, StudentPerformance>();
      
      studentsData.forEach(student => {
        const topicPerfs = new Map<string, {
          hasQuiz: boolean;
          hasAttempt: boolean;
          percentage: number;
          category: 'EE' | 'ME' | 'AE' | 'BE' | 'X' | null;
        }>();
        
        const studentScores = studentBestScores.get(student.id) || new Map();
        
        topicsData.forEach(topic => {
          const topicQuizzes = topicToQuizzes.get(topic.id) || [];
          const hasQuiz = topicQuizzes.length > 0;
          
          if (!hasQuiz) {
            // No quiz for this topic - mark X
            topicPerfs.set(topic.id, {
              hasQuiz: false,
              hasAttempt: false,
              percentage: 0,
              category: 'X',
            });
          } else {
            // Check if student has attempted any quiz for this topic
            // Look for any quiz in this topic that the student has attempted
            let bestPercentage = 0;
            let hasAttempt = false;
            
            for (const quiz of topicQuizzes) {
              const score = studentScores.get(quiz.id);
              if (score && score.attempts > 0) {
                hasAttempt = true;
                if (score.best_percentage > bestPercentage) {
                  bestPercentage = score.best_percentage;
                }
              }
            }
            
            if (!hasAttempt) {
              // Has quiz but no attempt (attempts = 0) - mark X
              topicPerfs.set(topic.id, {
                hasQuiz: true,
                hasAttempt: false,
                percentage: 0,
                category: 'X',
              });
            } else {
              // Has attempt (attempts > 0) - categorize based on best_percentage
              const category = categorizeScore(bestPercentage);
              topicPerfs.set(topic.id, {
                hasQuiz: true,
                hasAttempt: true,
                percentage: bestPercentage,
                category: category,
              });
            }
          }
        });
        
        performanceMap.set(student.id, {
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          topicPerformances: topicPerfs,
        });
      });

      setStudentPerformances(Array.from(performanceMap.values()));
    } catch (err: any) {
      console.error("Error fetching quiz performance:", err);
      // Set empty performances if error
      setStudentPerformances(
        studentsData.map(student => ({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          topicPerformances: new Map(),
        }))
      );
    }
  };

  const categorizeScore = (percentage: number): 'EE' | 'ME' | 'AE' | 'BE' => {
    if (percentage >= 76) return 'EE'; // Exceeding Expectation (76-100%)
    if (percentage >= 51) return 'ME'; // Meeting Expectation (51-75%)
    if (percentage >= 26) return 'AE'; // Approaching Expectation (26-50%)
    return 'BE'; // Below Expectation (0-25%)
  };

  const resetReportData = () => {
    setClassInfo(null);
    setCourseLevels([]);
    setTopics([]);
    setQuizzes([]);
    setStudents([]);
    setStudentPerformances([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPerformanceDisplay = (topicId: string, studentId: string) => {
    const studentPerf = studentPerformances.find(sp => sp.student_id === studentId);
    if (!studentPerf) {
      return { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
    }

    const perf = studentPerf.topicPerformances.get(topicId);
    if (!perf) {
      return { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
    }

    if (perf.category === 'X') {
      return { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
    }

    const categoryMap: Record<string, { display: string; color: string; bgColor: string }> = {
      'EE': { display: "✓ EE", color: "text-green-700", bgColor: "bg-green-50" },
      'ME': { display: "✓ ME", color: "text-green-600", bgColor: "bg-green-50" },
      'AE': { display: "AE", color: "text-yellow-600", bgColor: "bg-yellow-50" },
      'BE': { display: "BE", color: "text-red-600", bgColor: "bg-red-50" },
    };

    return categoryMap[perf.category] || { display: "X", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const filteredClasses = selectedSchoolId 
    ? classes.filter(c => c.school_id === selectedSchoolId)
    : classes;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Class Student Performance Progress
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          View students performance progress by class
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!selectedSchoolId && schools.length > 0}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Class</option>
              {filteredClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.school.name})
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
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && selectedClassId && classInfo && (
        <>
          {/* Class Info Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">School:</span> {classInfo.school_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Class:</span> {classInfo.name}
                  </p>
                </div>
                {(classInfo.lead_tutor || classInfo.assistant_tutor) && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {classInfo.lead_tutor && (
                      <p>
                        <span className="font-medium text-gray-900">Lead Tutor:</span> {classInfo.lead_tutor}
                      </p>
                    )}
                    {classInfo.assistant_tutor && (
                      <p>
                        <span className="font-medium text-gray-900">Assistant Tutor:</span> {classInfo.assistant_tutor}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Print Report
              </button>
            </div>
          </div>

          {/* Report Table */}
          {courseLevels.length > 0 ? (
            courseLevels.map((level) => {
              const levelTopics = topics.filter(t => t.level_id === level.id);

              if (levelTopics.length === 0) return null;

              return (
                <div key={level.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3">
                    <h3 className="text-lg font-bold text-white">{level.course_name} - {level.name}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 z-10 bg-gray-100">
                            Student
                          </th>
                          {levelTopics.map((topic) => (
                            <th
                              key={topic.id}
                              className="px-4 py-3 text-center text-sm font-semibold text-gray-900 min-w-[120px]"
                            >
                              {topic.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 z-10 bg-white">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No enrolled course levels found for this class.</p>
            </div>
          )}
        </>
      )}

      {!loading && !selectedClassId && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Please select a school and class to view the report.</p>
        </div>
      )}
    </div>
  );
}

