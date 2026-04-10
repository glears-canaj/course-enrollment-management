# Process Reflection

## 1. Software Process
The Course Enrollment Management application was developed using an Agile-inspired, incremental approach. Rather than attempting a massive "big bang" release, we constructed the system phase-by-phase:

1. **Foundation**: Establishing Vite, React, and Tailwind, and wiring them to the Supabase client.
2. **Authentication**: Building the Login and Register flows, establishing the `AuthContext`, and securing routes via `ProtectedRoute`.
3. **Core API Layers**: Constructing specialized React Hooks (`useCourses`, `useEnrollments`) to encapsulate all Supabase database calls.
4. **Student Experience**: Building the catalog, live search, and enrollment workflows.
5. **Admin Experience**: Building course CRUD operations, a dashboard, and roster management.

This incremental approach suits a university-style project because it ensures that core functionality (authentication, databasing) is absolutely solid before layering on complex UI logic (live search, capacity bars).

---

## 2. Development Phases

* **Planning & Scaffolding**: Initialting the Git project, Vite boilerplate cleanup, installing `@supabase/supabase-js`, `react-router-dom`, and configuring Tailwind CSS v4.
* **Database Design**: Drafting the `courses`, `profiles`, and `enrollments` tables inside Supabase. Strict PostgreSQL `CHECK` constraints (e.g., `max_capacity >= 1`) and foreign keys (`on delete cascade`/`restrict`) were established early.
* **Security Implementation**: Writing meticulous Row-Level Security (RLS) policies to ensure students could only read and interact with their own data, while admins possessed global scope.
* **Implementation**: Coding the React frontend in TypeScript. Separating concerns strictly between presentational components (`CourseCard`, `Navbar`) and business-logic hooks (`useCourses`).
* **Testing & Documentation**: Compiling all code rigorously with `tsc --noEmit` to catch silent type errors, followed by drafting this comprehensive academic documentation suite.

---

## 3. Challenges Encountered

### Challenge 1: Complex Enrollment State
**The Problem**: Displaying the correct state of the `EnrollButton` required knowing three things simultaneously: (1) if the course was full, (2) if the specific student was currently enrolled, and (3) if a network request was currently in-flight.
**The Solution**: We abstracted all logic into a custom `useEnrollments` hook that fetched the student's enrollments concurrently with the course data. We passed boolean flags (`enrolled`, `courseFull`) into a distinct `EnrollButton` component, which handled its own loading `busy` state.

### Challenge 2: Aggregating Enrollment Counts
**The Problem**: We needed to display how many students were enrolled in a course without fetching every single enrollment record, which would scale poorly.
**The Solution**: We utilized Supabase's `count` aggregation feature within the Javascript client (`enrollments(count)`). This pushed the counting logic down to the PostgreSQL database level, returning a single integer to the frontend, vastly improving performance.

### Challenge 3: Protecting Admin Actions via RLS
**The Problem**: We needed to ensure that malicious actors could not invoke the Supabase client directly in the browser console to delete courses or unenroll other students.
**The Solution**: We enabled Row-Level Security on all tables. We wrote SQL definitions using `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`. If a student attempted a `delete` operation on a course, the PostgreSQL database firmly rejected the transaction, fulfilling NFR2.

---

## 4. Lessons Learned

1. **Type Safety Prevents Bugs**: Strict TypeScript interfaces meant that changes in database schema design were immediately caught in the frontend components at compile-time, saving hours of runtime debugging.
2. **Backend-as-a-Service Accelerates Development**: Using Supabase drastically reduced the time needed to stand up a project. We didn't need to write a custom Express.js REST API; we queried the database directly from React, secured by RLS.
3. **Decoupling Logic**: Moving database calls out of the page components and into custom hooks (`useCourses`) made the UI code significantly cleaner and easier to reason about. The pages only care about rendering data and handling user clicks.

---

## 5. Team Member Roles

* **Glears Canaj** — *Lead Architect & Security Officer*
  Handled Vite project setup, Supabase authentication flows, PostgreSQL table design, Row-Level Security policies, and the core routing architecture.

* **Albi Parllaku** — *Frontend Developer (Staff & Catalog)*
  Developed the interactive Course Catalog with live search/filters, the Staff dashboard, Course Management capabilities, and the custom Enrollment hooks.

* **Rudei Bulko** — *Frontend Developer (Admin & UX)*
  Developed the Administrator dashboard, advanced User Management (changing roles, assigning IDs), form validation, Faculty integrations, and overall application styling (Tailwind).
