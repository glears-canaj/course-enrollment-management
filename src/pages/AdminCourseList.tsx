import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'

export default function AdminCourseList() {
  const { courses, loading, error, totalCount, fetchCourses, deleteCourse } = useCourses()
  const [page, setPage] = useState(0)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const pageSize = 10
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses(page, pageSize)
  }, [page, fetchCourses])

  const totalPages = Math.ceil(totalCount / pageSize)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone and will fail if students are enrolled.`)) return
    
    setDeleteError(null)
    const { error: err } = await deleteCourse(id)
    if (err) {
      setDeleteError(err)
    } else {
      fetchCourses(page, pageSize)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Course Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Create, edit, and orchestrate the course catalog.</p>
        </div>
        <Button onClick={() => navigate('/admin/courses/new')} variant="primary" className="shrink-0">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Course
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to load courses</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {deleteError && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to delete course</h3>
          <p className="mt-1 text-sm text-red-600">{deleteError}</p>
        </div>
      )}

      <Card className="p-0 border border-[var(--color-border)] overflow-hidden bg-white shadow-sm" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  Instructor
                </th>
                <th scope="col" className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  Credits
                </th>
                <th scope="col" className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 pl-4 px-3"><Skeleton className="h-5 w-32 mb-1" /><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-3 hidden md:table-cell"><Skeleton className="h-5 w-24" /></td>
                    <td className="py-4 px-3 hidden lg:table-cell flex justify-center"><Skeleton className="h-5 w-8 mx-auto" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-16 mx-auto" /></td>
                    <td className="py-4 pl-3 pr-4 sm:pr-6 text-right w-[150px]"><Skeleton className="h-8 w-full rounded" /></td>
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                    No courses found. Add a new course to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const enrolled = course.enrollment_count ?? 0
                  const isFull = enrolled >= course.max_capacity
                  
                  return (
                    <tr key={course.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 pl-4 px-3 text-sm">
                        <div className="font-medium text-[var(--color-text-primary)]">{course.name}</div>
                        <div className="text-[var(--color-text-secondary)] text-xs font-mono mt-0.5">{course.code}</div>
                      </td>
                      <td className="py-4 px-3 text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
                        {course.instructor}
                      </td>
                      <td className="py-4 px-3 text-sm text-center font-medium text-[var(--color-text-secondary)] hidden lg:table-cell">
                        {course.credits}
                      </td>
                      <td className="py-4 px-3 text-sm text-center">
                        <Badge variant={isFull ? 'danger' : (enrolled > 0 ? 'info' : 'neutral')}>
                          {enrolled} / {course.max_capacity}
                        </Badge>
                      </td>
                      <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => navigate(`/admin/courses/${course.id}/enrollments`)}
                            variant="ghost"
                            size="sm"
                            className="text-[var(--color-primary)] hover:text-[#1D4ED8] hover:bg-blue-50 px-2"
                            title="View Students"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </Button>
                          <Button
                            onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-slate-900 bg-slate-50 px-2 border border-slate-200"
                            title="Edit Course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                          <Button
                            onClick={() => handleDelete(course.id, course.name)}
                            variant="ghost"
                            size="sm"
                            className="text-[#EF4444] hover:text-white hover:bg-[#EF4444] px-2 shadow-sm border border-red-100"
                            title="Delete Course"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing page <span className="font-medium">{page + 1}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    variant="outline"
                    className="rounded-l-md rounded-r-none focus:z-20"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    variant="outline"
                    className="rounded-r-md rounded-l-none focus:z-20 -ml-px"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
