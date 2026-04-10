import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'
import AppLayout from './AppLayout'

interface Props {
  children: ReactNode
  requiredRole?: 'admin' | 'student' | 'staff'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center mt-10 border border-red-200 bg-red-50">
        <h2 className="mb-2 text-lg font-semibold text-red-800">Profile Not Found</h2>
        <p className="text-sm text-red-700 mb-4">
          Your account was authenticated, but no corresponding profile was found in the database.
        </p>
        <p className="text-xs text-red-600 bg-white p-3 border border-red-100 rounded text-left mb-4">
          <strong>If you created this user directly in the Supabase Dashboard:</strong><br/>
          You must manually execute an INSERT into the <code>profiles</code> table for this user ID, OR you must recreate the user through the app's register page. The database trigger only applies to users created after it was added.
        </p>
        <button 
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
        >
          Sign Out & Restart
        </button>
      </div>
    )
  }

  if (requiredRole && profile.role !== requiredRole) {
    let redirect = '/courses'
    if (profile.role === 'admin') redirect = '/admin'
    if (profile.role === 'staff') redirect = '/staff'
    return <Navigate to={redirect} replace />
  }

  return <AppLayout>{children}</AppLayout>
}
