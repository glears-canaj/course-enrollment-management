import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  // Fallback if rendered outside of proper auth state (caught by ProtectedRoute)
  if (!profile) return <>{children}</>

  const navLinks = profile.role === 'admin' 
    ? [
        { name: 'Dashboard', path: '/admin', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )},
        { name: 'Courses', path: '/admin/courses', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )},
        { name: 'Faculties', path: '/admin/faculties', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )},
        { name: 'Users', path: '/admin/users', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )},
      ]
    : profile.role === 'staff'
    ? [
        { name: 'Dashboard', path: '/staff', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )},
        { name: 'My Classes', path: '/staff/courses', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )},
      ]
    : [
        { name: 'Student Dashboard', path: '/student', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )},
        { name: 'Browse Courses', path: '/courses', icon: (
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )},
      ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col bg-[#0F172A] text-slate-300 md:flex shadow-xl z-20">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img src="/unyt.svg" alt="UNYT Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
            <span className="text-sm font-bold text-white tracking-tight leading-tight">UNYT - Course<br/>Enrollment Management</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
            Navigation
          </div>
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isExactOnly = ['/admin', '/staff', '/student', '/courses'].includes(link.path)
              const isActive = location.pathname === link.path || (!isExactOnly && location.pathname.startsWith(link.path))
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-700'
                        : 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400'} group-hover:text-white`}>
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <Link 
          to="/profile"
          className="block border-t border-slate-800 p-4 bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#334155] font-medium text-white shadow-inner">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{profile.role}</p>
            </div>
          </div>
        </Link>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 shadow-sm z-10 w-full">
          <div className="flex flex-1 items-center md:hidden pr-4">
            <span className="text-base font-bold text-slate-900 truncate">UNYT - Course Enrollment Management</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-sm text-slate-600 hidden sm:block">
              Welcome back, <span className="font-semibold text-slate-900">{profile.full_name.split(' ')[0]}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] relative">
          <div 
            className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-center bg-no-repeat bg-[length:50%_auto] bg-fixed"
            style={{ backgroundImage: "url('/unyt.svg')" }}
          />
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
