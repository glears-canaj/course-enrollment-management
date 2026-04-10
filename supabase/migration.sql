-- =====================================================
-- Course Enrollment Management — Supabase Migration
-- Run this in the Supabase SQL Editor
-- =====================================================

-- profiles table (linked to auth.users)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null,
  role       text not null check (role in ('admin', 'student')),
  created_at timestamptz default now()
);

-- courses table
create table if not exists courses (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  name         text not null,
  description  text,
  instructor   text not null,
  credits      int not null check (credits >= 1 and credits <= 6),
  schedule     text not null,
  max_capacity int not null check (max_capacity >= 1),
  created_at   timestamptz default now()
);

-- enrollments table
create table if not exists enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references profiles(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete restrict,
  enrolled_at timestamptz default now(),
  unique (student_id, course_id)
);

-- prevent deletion of courses that have active enrollments
-- (enforced by on delete restrict above)

-- =====================================================
-- Trigger for automatic profile creation
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- RLS Helper Functions
-- =====================================================
create or replace function public.is_admin()
returns boolean as $$
declare
  is_admin boolean;
begin
  select (role = 'admin') into is_admin from profiles where id = auth.uid();
  return coalesce(is_admin, false);
end;
$$ language plpgsql security definer;

-- =====================================================
-- Row Level Security
-- =====================================================

alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;

-- profiles policies
drop policy if exists "users can read own profile" on profiles;
create policy "users can read own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "admins can read all profiles" on profiles;
create policy "admins can read all profiles"
  on profiles for select
  using (public.is_admin());

drop policy if exists "users can insert own profile" on profiles;
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- courses policies
drop policy if exists "authenticated users can read courses" on courses;
create policy "authenticated users can read courses"
  on courses for select
  using (auth.uid() is not null);

drop policy if exists "admins can insert courses" on courses;
create policy "admins can insert courses"
  on courses for insert
  with check (public.is_admin());

drop policy if exists "admins can update courses" on courses;
create policy "admins can update courses"
  on courses for update
  using (public.is_admin());

drop policy if exists "admins can delete courses" on courses;
create policy "admins can delete courses"
  on courses for delete
  using (public.is_admin());

-- enrollments policies
drop policy if exists "students can read own enrollments" on enrollments;
create policy "students can read own enrollments"
  on enrollments for select
  using (auth.uid() = student_id);

drop policy if exists "admins can read all enrollments" on enrollments;
create policy "admins can read all enrollments"
  on enrollments for select
  using (public.is_admin());

drop policy if exists "students can enroll themselves" on enrollments;
create policy "students can enroll themselves"
  on enrollments for insert
  with check (auth.uid() = student_id);

drop policy if exists "students can unenroll themselves" on enrollments;
create policy "students can unenroll themselves"
  on enrollments for delete
  using (auth.uid() = student_id);

drop policy if exists "admins can remove any enrollment" on enrollments;
create policy "admins can remove any enrollment"
  on enrollments for delete
  using (public.is_admin());
