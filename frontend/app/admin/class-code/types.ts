export type ClassCodeStatus = 'active' | 'expired' | 'used';
export type ClassStatus = 'unassigned' | 'assigned' | 'upcoming' | 'today' | 'tomorrow' | 'past';

export interface ClassCode {
  id: string;
  class_id: string;
  schedule_id: string;
  code: string;
  valid_from: string;
  valid_until: string;
  generated_by_tutor_id: string | null;
  generated_at: string;
  status: ClassCodeStatus;
  created_at: string;
  updated_at: string;
  generated_by?: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
  } | null;
}

export interface ClassWithAllocation {
  id: string;
  name: string;
  level: string;
  description?: string;
  status: string;
  school: {
    id: string;
    name: string;
    code: string;
  };
  schedule: {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  } | null;
  lead_tutor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
  } | null;
  assistant_tutor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
  } | null;
  student_count: number;
  current_code: ClassCode | null;
  class_status: ClassStatus;
  can_generate_code: boolean;
  next_class_datetime: string | null;
  time_window: {
    starts_at: string | null;
    ends_at: string | null;
    is_within_window: boolean;
  };
}

export const CLASS_STATUS_OPTIONS: { value: ClassStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Classes' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'upcoming', label: 'Upcoming Today' },
  { value: 'today', label: 'In Progress' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'past', label: 'Past' },
];

export const CLASS_LEVELS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'level1', label: 'Level 1' },
  { value: 'level2', label: 'Level 2' },
  { value: 'level3', label: 'Level 3' },
  { value: 'advanced', label: 'Advanced' },
];

export const STATUS_COLORS: Record<ClassStatus, string> = {
  unassigned: 'bg-gray-100 text-gray-700 border-gray-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  upcoming: 'bg-amber-100 text-amber-700 border-amber-200',
  today: 'bg-green-100 text-green-700 border-green-200',
  tomorrow: 'bg-purple-100 text-purple-700 border-purple-200',
  past: 'bg-red-100 text-red-700 border-red-200',
};

export const STATUS_LABELS: Record<ClassStatus, string> = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  upcoming: 'Upcoming',
  today: 'In Progress',
  tomorrow: 'Tomorrow',
  past: 'Past',
};

