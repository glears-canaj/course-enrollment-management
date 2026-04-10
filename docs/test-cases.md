# Test Cases & Verification

This document catalogs the manual tests verified against the final build of the Course Enrollment Management system. Testing focuses heavily on security boundaries (Row-Level Security), user state, and enrollment constraints.

## 1. Authentication & Access Control

| Test ID | Description | Preconditions | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Student Registration | No active session | 1. Navigate to `/register`<br>2. Fill details and select "Student" role<br>3. Submit | Profile created in DB with 'student' role. Redirected to `/courses`. | ✅ Pass |
| **TC-02** | Protected Route Access | Logged in as 'student' | 1. Attempt to navigate to `/admin`<br>2. Attempt to navigate to `/staff` | User is automatically redirected back to `/courses` (Insufficient privileges). | ✅ Pass |
| **TC-03** | Faculty Assignment Access | Logged in as 'admin' | 1. Navigate to `/admin/users`<br>2. Select edit on a user<br>3. Change role and faculty | Database correctly propagates the new role and `faculty_id`. | ✅ Pass |

## 2. Enrollment System Rules

| Test ID | Description | Preconditions | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-04** | Valid Course Enrollment | Logged in as student. Course has open capacity. | 1. Browse to a course<br>2. Click "Enroll" | Enrollment recorded. Button turns red and states "Unenroll". DB capacity incremented. | ✅ Pass |
| **TC-05** | Course Capacity Limiting | Course is filled to maximum capacity | 1. Browse to full course | "Enroll" button is disabled and reads "Course Full". RLS prevents forceful backend API insertion. | ✅ Pass |
| **TC-06** | Duplicate Enrollment Protection | Student is already enrolled in course X | 1. View course X details again | System verifies duplicate status and restricts secondary enrollment. Database UNIQUE constraint enforced. | ✅ Pass |

## 3. Staff Course Management

| Test ID | Description | Preconditions | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-07** | Viewing Assigned Courses | Logged in as 'staff' | 1. Navigate to "My Classes" (`/staff/courses`) | Only courses directly assigned to the staff's `instructor_id` are displayed. | ✅ Pass |
| **TC-08** | Editing Course Syllabus | Logged in as 'staff' | 1. Open assigned course<br>2. Edit description & term<br>3. Save | Updates persist and appear immediately on the student-facing catalog. | ✅ Pass |
| **TC-09** | Removing Student from Roster | Logged in as 'staff' | 1. Open assigned course<br>2. Go to "Students" tab<br>3. Click "Remove" | Student record deleted from `enrollments`. Capacity counter decrements by 1. | ✅ Pass |

## 4. Administrator Capabilities

| Test ID | Description | Preconditions | Steps | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-10** | Delete Active Course | Logged in as 'admin', Course X has 5 enrolled students | 1. Go to "Manage Courses"<br>2. Click "Delete" on Course X | Success. Cascade deletion removes the 5 student enrollments attached to the course while removing the course itself. | ✅ Pass |
| **TC-11** | Create Course with Staff | Logged in as 'admin' | 1. Create matching details<br>2. Link existing Staff profile<br>3. Save | Instructor name populates automatically. Staff user instantly gains access via `/staff/courses`. | ✅ Pass |
| **TC-12** | Database Deletion Restriction | Malicious student attempts REST API delete | 1. Student executes `supabase.from('courses').delete()` | RLS universally rejects the request with HTTP 403 Forbidden. | ✅ Pass |
