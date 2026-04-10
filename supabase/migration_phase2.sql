-- =====================================================
-- Course Enrollment Management — Feature Expansion Migration
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. Update Profiles Role Constraint

-- Drop the existing trigger to prevent issues during migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to allow 'staff'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student') -- default to student
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- We need to drop the check constraint on profiles.
-- To find the constraint name dynamically or just assume it's "profiles_role_check" if we named it that.
-- In our initial migration, we did `role text not null check (role in ('admin', 'student'))`. Postgres names this something like `profiles_role_check`.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student', 'staff'));

-- =====================================================
-- 2. Faculties Setup
-- =====================================================

CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admins can insert faculties" ON faculties FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admins can update faculties" ON faculties FOR UPDATE USING (public.is_admin());
CREATE POLICY "admins can delete faculties" ON faculties FOR DELETE USING (public.is_admin());

-- Everyone can read faculties
CREATE POLICY "authenticated users can read faculties" ON faculties FOR SELECT USING (auth.uid() IS NOT NULL);


-- =====================================================
-- 3. Faculty Members Setup
-- =====================================================

CREATE TABLE IF NOT EXISTS faculty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT, -- e.g. 'Professor', 'IT Staff'
  UNIQUE (faculty_id, profile_id)
);

-- Turn on RLS
ALTER TABLE faculty_members ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admins can insert faculty members" ON faculty_members FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admins can update faculty members" ON faculty_members FOR UPDATE USING (public.is_admin());
CREATE POLICY "admins can delete faculty members" ON faculty_members FOR DELETE USING (public.is_admin());

-- Everyone can read who belongs to what faculty
CREATE POLICY "authenticated users can read faculty members" ON faculty_members FOR SELECT USING (auth.uid() IS NOT NULL);


-- =====================================================
-- 4. Courses Table Updates
-- =====================================================

-- Add the new columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL;


-- We need to allow staff to update their OWN courses.
-- We ALREADY have: "admins can update courses"
DROP POLICY IF EXISTS "staff can update own courses" ON courses;
CREATE POLICY "staff can update own courses" ON courses FOR UPDATE USING (auth.uid() = instructor_id);

-- Depending on your rules, admins might be the ONLY ones allowed to CREATE courses.
-- So we won't add an insert policy for staff here unless requested.


-- =====================================================
-- 5. Course Notifications Setup
-- =====================================================

CREATE TABLE IF NOT EXISTS course_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE course_notifications ENABLE ROW LEVEL SECURITY;

-- Staff/Professors can insert notifications for their OWN courses
-- We need to join with courses to check if they are the instructor
CREATE POLICY "instructors can insert notifications" ON course_notifications FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "instructors can delete notifications" ON course_notifications FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM courses c
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "admins can delete notifications" ON course_notifications FOR DELETE USING (public.is_admin());

-- Anyone enrolled in the course, the instructor, or an admin can read the notification
CREATE POLICY "authorized users can read notifications" ON course_notifications FOR SELECT
USING (
  public.is_admin() -- Admin sees all
  OR EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()) -- Instructor sees own
  OR EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = course_notifications.course_id AND e.student_id = auth.uid()) -- Enrolled student sees it
);

-- =====================================================
-- 6. Helper for RLS: is_staff()
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
DECLARE
  is_staff BOOLEAN;
BEGIN
  SELECT (role = 'staff') INTO is_staff FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(is_staff, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
