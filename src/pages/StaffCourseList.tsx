import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'

type InstructorCourse = {
  id: string
  name: string
  code: string
  term: string
  _count: { enrollments: number }
}

export default function StaffCourseList() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Fetch Courses
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, name, code, term, enrollments(count)')
      .eq('instructor_id', user.id)

    if (courseData) {
      const formatted = courseData.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        term: c.term,
        _count: { enrollments: c.enrollments?.[0]?.count ?? 0 }
      }))
      setCourses(formatted)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">My Assigned Classes</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Select a class to manage its details, students, and announcements.</p>
      </div>

      <Card className="p-0 overflow-hidden" noPadding>
        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">You have no assigned classes.</div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{c.code}</span>
                    {c.term && <Badge variant="info">{c.term}</Badge>}
                  </div>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {c._count.enrollments} enrolled students
                  </p>
                </div>
                <Link
                  to={`/staff/courses/${c.id}`}
                  className="shrink-0 px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition shadow-sm"
                >
                  Manage Class
                </Link>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
