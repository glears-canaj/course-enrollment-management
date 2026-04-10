import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminCourseList from './pages/AdminCourseList'
import AdminCourseForm from './pages/AdminCourseForm'
import AdminEnrollments from './pages/AdminEnrollments'
import FacultiesList from './pages/FacultiesList'
import FacultyForm from './pages/FacultyForm'
import UserManagement from './pages/UserManagement'
import StaffDashboard from './pages/StaffDashboard'
import StaffCourseList from './pages/StaffCourseList'
import StaffCourseManage from './pages/StaffCourseManage'

function RootRedirect() {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return (
    <div className="mx-auto max-w-xl p-8 text-center mt-10 border border-red-200 bg-red-50">
      <h2 className="mb-2 text-lg font-semibold text-red-800">Profile Not Found</h2>
      <p className="text-sm text-red-700 mb-4">Please recreate your user through the register page or manually add a profile row in Supabase.</p>
      <button 
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
      >
        Sign Out & Restart
      </button>
    </div>
  )
  if (profile.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/courses" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute requiredRole="student"><CourseList /></ProtectedRoute>
          } />
          <Route path="/courses/:id" element={
            <ProtectedRoute requiredRole="student"><CourseDetail /></ProtectedRoute>
          } />
          {/* just mapping dashboard routes */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>
          } />
          
          {/* keeping this because some old emails still link to it and react router was crashing */}
          <Route path="/my-enrollments" element={<Navigate to="/student" replace />} />

          <Route path="/staff" element={
            <ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>
          } />
          <Route path="/staff/courses" element={
            <ProtectedRoute requiredRole="staff"><StaffCourseList /></ProtectedRoute>
          } />
          <Route path="/staff/courses/:id" element={
            <ProtectedRoute requiredRole="staff"><StaffCourseManage /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute requiredRole="admin"><AdminCourseList /></ProtectedRoute>
          } />
          <Route path="/admin/courses/new" element={
            <ProtectedRoute requiredRole="admin"><AdminCourseForm /></ProtectedRoute>
          } />
          <Route path="/admin/courses/:id/edit" element={
            <ProtectedRoute requiredRole="admin"><AdminCourseForm /></ProtectedRoute>
          } />
          <Route path="/admin/courses/:id/enrollments" element={
            <ProtectedRoute requiredRole="admin"><AdminEnrollments /></ProtectedRoute>
          } />
          <Route path="/admin/faculties" element={
            <ProtectedRoute requiredRole="admin"><FacultiesList /></ProtectedRoute>
          } />
          <Route path="/admin/faculties/new" element={
            <ProtectedRoute requiredRole="admin"><FacultyForm /></ProtectedRoute>
          } />
          <Route path="/admin/faculties/:id/edit" element={
            <ProtectedRoute requiredRole="admin"><FacultyForm /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
