# System Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to clearly define the functional and non-functional requirements for the Course Enrollment Management web application. This system is designed to facilitate the process of course registration for university students and course management for administrative staff.

### 1.2 Scope
The system provides a responsive, web-based platform with role-based access control. Administrative staff members can manage the university course catalog (create, edit, delete courses) and oversee student enrollments. Students can browse the catalog, view available seats, and enroll or unenroll from courses. All data is persisted securely via a cloud-based PostgreSQL database.

### 1.3 Definitions and Acronyms
* **Administrator/Staff**: A university employee with elevated system privileges to manage courses and view global enrollment data.
* **Student**: A university attendee who uses the system to manage their personal course timetable.
* **RLS**: Row-Level Security, a database feature ensuring users can only access data permitted by their assigned role.

---

## 2. Functional Requirements

### FR1 — Authentication & Authorization
* **Description**: The system shall allow users to register an account using an email and password, selecting their role (student or admin). Upon login, the system shall direct users to role-appropriate interfaces. Unauthenticated users shall be redirected to the login screen.

### FR2 — Course Management
* **Description**: Administrative users shall be able to create new courses by specifying the course code, name, description, instructor, credits, schedule, and maximum capacity. Admins shall be able to edit these details or delete the course entirely, provided no active student enrollments exist for that course.

### FR3 — Student Enrollment
* **Description**: The system shall allow students to browse a complete list of courses, view detailed course information, and enroll in a course with a single click. Students shall also be able to unenroll from courses and view a dedicated list of their current enrollments.

### FR4 — Enrollment Validation
* **Description**: The system must enforce course capacity constraints. If a course reaches its maximum capacity, the enrollment option must be disabled. Furthermore, the system must prevent students from enrolling in the same course more than once. These constraints must be enforced both on the client interface and within the database.

### FR5 — Search & Filter
* **Description**: The system shall provide students with dynamic search capabilities to find courses by name or code without requiring a page reload. Students must also be able to filter the course list by available seats, credit value, and schedule keywords.

### FR6 — Admin Enrollment Management
* **Description**: The system shall provide administrators with a dashboard displaying aggregate statistics (total courses, enrollments, full courses). Admins must be able to view a roster of students enrolled in any specific course and possess the capability to administratively remove a student from a course.

---

## 3. Non-Functional Requirements

### NFR1 — Persistence
* **Criteria**: All data must be persistently stored in a relational database (PostgreSQL) and remain intact across user sessions and system restarts.

### NFR2 — Security
* **Criteria**: The system must implement robust Row-Level Security (RLS) to ensure data isolation. Students must logically be unable to read or modify the enrollment records of other students, while administrators retain global read/write access.

### NFR3 — Usability
* **Criteria**: The user interface must be responsive, adapting cleanly to both standard desktop monitors and mobile device viewports, ensuring usability across environments.

### NFR4 — Performance
* **Criteria**: Under normal operating conditions, all page loads and standard database interactions (e.g., enrolling, filtering) must complete within 3 seconds.

### NFR5 — Scalability
* **Criteria**: The database schema and application architecture must be capable of supporting a university context comprising hundreds of concurrent courses and thousands of student records without architectural modification.
