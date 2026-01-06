// ==================== Quiz Types ====================

export interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  total_points: number;
  questions_count: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  allow_retake: boolean;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  topic?: Topic;
  questions?: QuizQuestion[];
}

export interface Topic {
  id: string;
  name: string;
  level?: {
    id: string;
    name: string;
    course?: {
      id: string;
      name: string;
    };
  };
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'multi_select';
  points: number;
  order_position: number;
  explanation?: string;
  image_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_position: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentQuizAttempt {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  quiz?: Quiz;
  answers?: StudentQuizAnswer[];
}

export interface StudentQuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
  question?: QuizQuestion;
  selected_option?: QuizOption;
}

export interface StudentQuizBestScore {
  id: string;
  student_id: string;
  quiz_id: string;
  best_score: number;
  best_percentage: number;
  attempts_count: number;
  first_attempt_at: string;
  last_attempt_at: string;
  created_at: string;
  updated_at: string;
  quiz?: Quiz;
}

export interface StudentTotalPoints {
  id: string;
  student_id: string;
  total_points: number;
  quizzes_completed: number;
  quizzes_passed: number;
  average_score: number;
  last_quiz_at?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
}

export interface AttemptResult {
  attempt: StudentQuizAttempt;
  correct_answers: number;
  total_questions: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  is_new_high_score: boolean;
  points_earned: number;
  total_points: number;
  answers: {
    question: QuizQuestion;
    selected_option?: QuizOption;
    correct_option: QuizOption;
    is_correct: boolean;
    points_earned: number;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  total_points: number;
  quizzes_completed: number;
  quizzes_passed: number;
  average_score: number;
}

export interface StudentQuizProgress {
  quiz: Quiz;
  best_score?: StudentQuizBestScore;
  last_attempt?: StudentQuizAttempt;
  can_retake: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'passed';
}

// ==================== Form Types ====================

export interface CreateQuizForm {
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_correct_answers?: boolean;
  allow_retake?: boolean;
  status?: 'active' | 'inactive' | 'draft';
}

export interface CreateQuestionForm {
  question_text: string;
  question_type?: 'multiple_choice' | 'true_false' | 'multi_select';
  points?: number;
  explanation?: string;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

// ==================== Constants ====================

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'multi_select', label: 'Multi Select' },
];

export const QUIZ_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-700 border-red-200' },
];

export const getStatusColor = (status: string): string => {
  const statusOption = QUIZ_STATUS_OPTIONS.find(s => s.value === status);
  return statusOption?.color || 'bg-gray-100 text-gray-700 border-gray-200';
};

