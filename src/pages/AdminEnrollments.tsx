import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEnrollments } from '../hooks/useEnrollments'
import { useCourses } from '../hooks/useCourses'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

export default function AdminEnrollments() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { course, fetchCourse } = useCourses()
  const { enrollments, loading, error, fetchCourseEnrollments, removeStudent } = useEnrollments()
  const [removeError, setRemoveError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchCourse(id)
      fetchCourseEnrollments(id)
    }
  }, [id, fetchCourse, fetchCourseEnrollments])

  async function handleRemove(enrollmentId: string, studentName: string) {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) return
    setRemoveError(null)
    const { error: err } = await removeStudent(enrollmentId)
    if (err) {
      setRemoveError(err)
    } else if (id) {
      fetchCourseEnrollments(id)
      fetchCourse(id)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/admin/courses')} 
        className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Courses
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Class Roster</h1>
          {course ? (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Currently viewing students enrolled in <span className="font-semibold text-slate-700">{course.code}</span> — {course.name}
            </p>
          ) : (
            <Skeleton className="h-4 w-64 mt-2" />
          )}
        </div>
        
        {course && (
          <Badge variant={enrollments.length >= course.max_capacity ? 'danger' : 'info'} className="text-sm px-3 py-1 bg-white shadow-sm">
            Capacity: <span className="font-bold ml-1">{enrollments.length}</span> / {course.max_capacity}
          </Badge>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to load enrollments</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {removeError && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to remove student</h3>
          <p className="mt-1 text-sm text-red-600">{removeError}</p>
        </div>
      )}

      <Card className="p-0 border border-[var(--color-border)] overflow-hidden bg-white shadow-sm" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 pl-4 sm:pl-6 pr-3"><Skeleton className="h-5 w-40" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-48" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-24" /></td>
                    <td className="py-4 pl-3 pr-4 sm:pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                      <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No students enrolled</h3>
                    <p className="mt-1 text-sm text-slate-500">This class currently has zero active enrollments.</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 pl-4 sm:pl-6 pr-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-medium shadow-inner">
                          {enrollment.student?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {enrollment.student?.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-sm text-[var(--color-text-secondary)]">
                      {enrollment.student?.email}
                    </td>
                    <td className="py-4 px-3 text-sm text-slate-500">
                      {new Date(enrollment.enrolled_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 pl-3 pr-4 sm:pr-6 text-right text-sm">
                      <Button
                        onClick={() => handleRemove(enrollment.id, enrollment.student?.full_name ?? 'this student')}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600 transition-all font-medium py-1.5"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
