
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1000;

-- =====================================================
-- 2. Core Tables
-- =====================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institutional_id VARCHAR(20) UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculties
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty Members (Mapping)
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  UNIQUE (faculty_id, profile_id)
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  instructor   TEXT NOT NULL, -- Legacy display name
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Real relational mapping
  faculty_id   UUID REFERENCES public.faculties(id) ON DELETE SET NULL,
  credits      INT NOT NULL CHECK (credits >= 1 AND credits <= 6),
  schedule     TEXT NOT NULL,
  term         VARCHAR(50),
  max_capacity INT NOT NULL CHECK (max_capacity >= 1),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);

-- Course Notifications
CREATE TABLE IF NOT EXISTS public.course_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. Database Functions & Triggers
-- =====================================================

-- Auto-create profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-generate Institutional ID (e.g. STU-1000)
CREATE OR REPLACE FUNCTION generate_institutional_id()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(4);
    next_num INT;
BEGIN
    IF NEW.institutional_id IS NULL THEN
        IF NEW.role = 'student' THEN prefix := 'STU-';
        ELSIF NEW.role = 'staff' THEN prefix := 'PRF-';
        ELSIF NEW.role = 'admin' THEN prefix := 'ADM-';
        ELSE prefix := 'USR-';
        END IF;
        
        next_num := nextval('user_id_seq');
        NEW.institutional_id := prefix || next_num::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_institutional_id ON public.profiles;
CREATE TRIGGER trigger_generate_institutional_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE generate_institutional_id();

-- Security Helpers
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
DECLARE is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure User Deletion (RPC)
CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID) RETURNS VOID AS $$
BEGIN
  IF public.is_admin() THEN
    DELETE FROM auth.users WHERE id = target_user_id;
  ELSE RAISE EXCEPTION 'Not authorized to delete users';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admins can read all profiles" ON profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "authenticated users can read profiles" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins can update profiles" ON profiles FOR UPDATE USING (public.is_admin());

-- Courses
CREATE POLICY "authenticated users can read courses" ON courses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admins can insert courses" ON courses FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admins can update courses" ON courses FOR UPDATE USING (public.is_admin());
CREATE POLICY "staff can update own courses" ON courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "admins can delete courses" ON courses FOR DELETE USING (public.is_admin());

-- Enrollments
CREATE POLICY "students can read own enrollments" ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "admins can read all enrollments" ON enrollments FOR SELECT USING (public.is_admin());
CREATE POLICY "instructors can read enrollments" ON enrollments FOR SELECT USING (auth.uid() IN (SELECT instructor_id FROM courses WHERE id = course_id));
CREATE POLICY "students can enroll themselves" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "students can unenroll themselves" ON enrollments FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "admins can remove any enrollment" ON enrollments FOR DELETE USING (public.is_admin());
CREATE POLICY "instructors can delete enrollments" ON enrollments FOR DELETE USING (auth.uid() IN (SELECT instructor_id FROM courses WHERE id = course_id));

-- Faculties & Members
CREATE POLICY "authenticated users can read faculties" ON faculties FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admins can all faculties" ON faculties FOR ALL USING (public.is_admin());
CREATE POLICY "authenticated users can read faculty members" ON faculty_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admins can all faculty members" ON faculty_members FOR ALL USING (public.is_admin());

-- Notifications
CREATE POLICY "authorized users can read notifications" ON course_notifications FOR SELECT USING (
  public.is_admin() OR 
  EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()) OR 
  EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = course_notifications.course_id AND e.student_id = auth.uid())
);
CREATE POLICY "instructors can insert notifications" ON course_notifications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()));
CREATE POLICY "instructors can update notifications" ON course_notifications FOR UPDATE USING (auth.uid() = author_id OR auth.uid() IN (SELECT instructor_id FROM courses WHERE id = course_id));
CREATE POLICY "instructors can delete notifications" ON course_notifications FOR DELETE USING (EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()));
CREATE POLICY "admins can delete notifications" ON course_notifications FOR DELETE USING (public.is_admin());
