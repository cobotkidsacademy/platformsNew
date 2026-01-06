export type TutorLevel = 'intern' | 'tutor' | 'manager' | 'edl' | 'operations_manager' | 'curriculum_manager';
export type Gender = 'male' | 'female' | 'other';
export type TutorStatus = 'active' | 'inactive' | 'suspended';

export interface Tutor {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  level: TutorLevel;
  gender: Gender;
  phone: string;
  email: string;
  password_hash?: string;
  plain_password?: string;
  id_number?: string;
  nssf_no?: string;
  kra_pin?: string;
  location?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  status: TutorStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTutorPayload {
  first_name: string;
  middle_name: string;
  last_name: string;
  level: TutorLevel;
  gender: Gender;
  phone: string;
  id_number?: string;
  nssf_no?: string;
  kra_pin?: string;
  location?: string;
  date_of_birth?: string;
  profile_image_url?: string;
}

export interface TutorWithCredentials extends Tutor {
  generated_email: string;
  generated_password: string;
}

export const TUTOR_LEVELS: { value: TutorLevel; label: string }[] = [
  { value: 'intern', label: 'Intern' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'manager', label: 'Manager' },
  { value: 'edl', label: 'EDL' },
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'curriculum_manager', label: 'Curriculum Manager' },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];






