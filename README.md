## 🛠️ Technology Stack

* **Frontend**: React (Vite) + TypeScript
* **Routing**: react-router-dom
* **Styling**: Tailwind CSS v4
* **Backend**: Supabase (PostgreSQL + Auth)
* **Hosting-Ready**: Standard build output, deployable instantly to Vercel/Netlify.

## 🗺️ Application Routes

### Public

* `/login` - Existing user sign-in
* `/register` - Account creation and role selection

### Student Routes

* `/courses` - The main catalog (browse, search, filter)
* `/courses/:id` - Detailed view of a specific course + Enroll button
* `/my-enrollments` - Personal timetable and unenrollment list

### Admin Routes

* `/admin` - Dashboard with high-level statistics
* `/admin/courses` - Paginated table of all courses
* `/admin/courses/new` - Create a new course offering
* `/admin/courses/:id/edit` - Modify an existing course
* `/admin/courses/:id/enrollments` - View roster and manually remove students

---

## 👥 Team

* **Glears Canaj**
* **Albi Parllaku**
* **Rudei Bulko**
