export type CourseStatus = 'active' | 'inactive' | 'draft';

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon_image_url?: string;
  level_count: number;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
  course_levels?: CourseLevel[];
}

export interface CourseLevel {
  id: string;
  course_id: string;
  level_number: number;
  name: string;
  description?: string;
  order_index: number;
  // Pricing
  is_free: boolean;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  topics?: Topic[];
}

export interface UpdateLevelPayload {
  name?: string;
  description?: string;
  is_free?: boolean;
  price?: number;
  currency?: string;
}

export interface Topic {
  id: string;
  level_id: string;
  name: string;
  description?: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  level?: CourseLevel;
  notes?: Note[];
}

export interface Note {
  id: string;
  topic_id: string;
  title: string;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  topic?: Topic;
  note_elements?: NoteElement[];
}

export type ElementType = 'text' | 'image';

export interface NoteElement {
  id: string;
  note_id: string;
  element_type: ElementType;
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  font_size?: number;
  font_weight?: string;
  font_family?: string;
  font_color?: string;
  text_align?: string;
  background_color?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCoursePayload {
  name: string;
  description?: string;
  icon_image_url?: string;
  level_count: number;
}

export interface CreateTopicPayload {
  level_id: string;
  name: string;
  description?: string;
}

export interface CreateNotePayload {
  topic_id: string;
  title?: string;
}

export interface CreateNoteElementPayload {
  note_id: string;
  element_type: ElementType;
  content?: string;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
}

export interface UpdateElementPositionPayload {
  id: string;
  position_x: number;
  position_y: number;
  z_index?: number;
}

