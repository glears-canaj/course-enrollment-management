import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

interface Stats {
  totalCourses: number
  totalEnrollments: number
  fullCourses: number
  totalStudents: number
  totalStaff: number
  totalFaculties: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ 
    totalCourses: 0, 
    totalEnrollments: 0, 
    fullCourses: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalFaculties: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { data: courses },
          { count: studentsCount },
          { count: staffCount },
          { count: facultiesCount }
        ] = await Promise.all([
          supabase.from('courses').select('id, max_capacity, enrollments(count)'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
          supabase.from('faculties').select('*', { count: 'exact', head: true })
        ])

        const totalCourses = courses?.length ?? 0
        let totalEnrollments = 0
        let fullCourses = 0

        courses?.forEach((c) => {
          const count = c.enrollments?.[0]?.count ?? 0
          totalEnrollments += count
          if (count >= c.max_capacity) fullCourses++
        })

        setStats({ 
          totalCourses, 
          totalEnrollments, 
          fullCourses,
          totalStudents: studentsCount || 0,
          totalStaff: staffCount || 0,
          totalFaculties: facultiesCount || 0
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Overview of the course enrollment system status.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-10 w-16 mb-2" /><Skeleton className="h-4 w-32" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              Total Students
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto">{stats.totalStudents}</div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              Total Staff / Faculty
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto">{stats.totalStaff}</div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              Academic Faculties
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto">{stats.totalFaculties}</div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              Total Courses
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto">{stats.totalCourses}</div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              Total Enrollments
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto">{stats.totalEnrollments}</div>
          </Card>

          <Card className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-[var(--color-text-secondary)] font-medium">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              Full Courses
            </div>
            <div className="text-3xl font-bold text-[var(--color-text-primary)] mt-auto flex items-baseline gap-2">
              {stats.fullCourses}
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                / {stats.totalCourses}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
