# Technologies Used

The Course Enrollment Management application is built utilizing a modern, decoupled tech stack focusing on developer speed, type safety, and a robust Backend-as-a-Service approach.

### Frontend Framework
* **Name**: React
* **Version**: ^19.0.0
* **Purpose**: Component-based UI rendering.
* **Reason for choosing**: React provides an efficient, declarative way to build complex user interfaces. Its massive ecosystem and robust component model make it ideal for data-heavy applications requiring immediate UI updates (like course filtering).

### Build Tool
* **Name**: Vite
* **Version**: ^6.0.0
* **Purpose**: Development server and production bundler.
* **Reason for choosing**: Vite offers significantly faster startup and Hot Module Replacement (HMR) times compared to older bundlers, drastically improving the developer experience.

### Type System
* **Name**: TypeScript
* **Version**: ^5.7.0
* **Purpose**: Static typing for JavaScript.
* **Reason for choosing**: TypeScript catches a large class of errors at compile-time rather than runtime. By defining explicit interfaces for `Profile`, `Course`, and `Enrollment`, it ensures data integrity between the database layer and frontend components.

### CSS Framework
* **Name**: Tailwind CSS
* **Version**: ^4.0.0
* **Purpose**: Utility-first CSS styling.
* **Reason for choosing**: Tailwind allows for rapid, consistent UI development without the need to maintain large, unwieldy custom CSS files. By centralizing design tokens, the application maintains a strict, clean academic aesthetic.

### Routing
* **Name**: React Router DOM
* **Version**: ^7.2.0
* **Purpose**: Client-side navigation mapping.
* **Reason for choosing**: It is the industry standard for React routing, allowing seamless transitions between student and admin dashboards without triggering full page reloads.

### Database & Authentication
* **Name**: Supabase (PostgreSQL & Supabase Auth)
* **Version**: ^2.48.0 (Client)
* **Purpose**: Managed relational database and user identity provider.
* **Reason for choosing**: Supabase replaces the need for a custom Node.js/Python backend. By exposing a secure API directly over PostgreSQL, it lowers maintenance overhead. Supabase Auth seamlessly handles JWT generation, password hashing, and session management.

### Security Implementation
* **Name**: PostgreSQL Row Level Security (RLS)
* **Version**: N/A (Feature of PostgreSQL)
* **Purpose**: Database-level access control.
* **Reason for choosing**: RLS guarantees that security rules (e.g., "students can only see their own enrollments") are fundamentally inescapable, even if the frontend client is compromised or bypassed.

