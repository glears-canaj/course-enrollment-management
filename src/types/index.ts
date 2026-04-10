export interface Profile {
  id: string
  institutional_id?: string
  full_name: string
  email: string
  role: 'student' | 'staff' | 'admin'
  created_at: string
}

export interface Course {
  id: string
  code: string
  name: string
  description: string
  instructor: string
  credits: number
  schedule: string
  max_capacity: number
  created_at: string
  instructor_id?: string
  faculty_id?: string
  term?: string
  enrollment_count?: number
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  course?: Course
  student?: Profile
}

export interface CourseNotification {
  id: string
  course_id: string
  author_id: string
  title: string
  content: string
  created_at: string
  updated_at?: string
  author?: { full_name: string }
}
