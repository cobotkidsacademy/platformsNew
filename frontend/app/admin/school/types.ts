export interface School {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  email?: string;
  auto_email: string;
  plain_password?: string;
  location?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  class_count?: number;
  student_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level: 'level1' | 'level2' | 'level3' | 'advanced';
  description?: string;
  status: 'active' | 'inactive';
  student_count?: number;
  school?: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  username: string;
  plain_password: string;
  email?: string;
  guardian_name?: string;
  guardian_phone?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'inactive' | 'graduated';
  class?: {
    id: string;
    name: string;
    level: string;
  };
  school?: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

export const LEVEL_LABELS: Record<string, string> = {
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3',
  advanced: 'Advanced',
};

export const LEVEL_COLORS: Record<string, string> = {
  level1: 'bg-blue-100 text-blue-700',
  level2: 'bg-green-100 text-green-700',
  level3: 'bg-purple-100 text-purple-700',
  advanced: 'bg-orange-100 text-orange-700',
};






