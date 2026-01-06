export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TutorRole = 'lead' | 'assistant';

export interface ClassSchedule {
  id: string;
  class_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  class?: {
    id: string;
    name: string;
    level: string;
    school?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface TutorAssignment {
  id: string;
  tutor_id: string;
  class_id: string;
  role: TutorRole;
  status: 'active' | 'inactive';
  assigned_at: string;
  created_at: string;
  updated_at: string;
  tutor?: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    level: string;
  };
  class?: {
    id: string;
    name: string;
    level: string;
    school?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface ClassCourseLevelAssignment {
  id: string;
  class_id: string;
  course_level_id: string;
  enrollment_status: 'enrolled' | 'completed';
  assigned_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  course_level?: {
    id: string;
    course_id: string;
    level_number: number;
    name: string;
    course?: {
      id: string;
      name: string;
      code: string;
    };
  };
  class?: {
    id: string;
    name: string;
    level: string;
  };
}

export interface AllocationDetail {
  class: {
    id: string;
    name: string;
    level: string;
    school: {
      id: string;
      name: string;
      code: string;
    };
  };
  schedule: ClassSchedule | null;
  lead_tutor: TutorAssignment | null;
  assistant_tutor: TutorAssignment | null;
  course_levels?: ClassCourseLevelAssignment[];
  student_count: number;
}

export interface CreateSchedulePayload {
  class_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface UpdateSchedulePayload {
  day_of_week?: DayOfWeek;
  start_time?: string;
  end_time?: string;
  status?: 'active' | 'inactive';
}

export interface AssignTutorPayload {
  tutor_id: string;
  class_id: string;
  role: TutorRole;
}

export interface UpdateAssignmentPayload {
  role?: TutorRole;
  status?: 'active' | 'inactive';
}

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const TUTOR_ROLES: { value: TutorRole; label: string }[] = [
  { value: 'lead', label: 'Lead Tutor' },
  { value: 'assistant', label: 'Assistant Tutor' },
];

export interface AssignCourseLevelPayload {
  class_id: string;
  course_level_id: string;
  enrollment_status: 'enrolled' | 'completed';
}

export interface UpdateCourseLevelStatusPayload {
  enrollment_status: 'enrolled' | 'completed';
}

