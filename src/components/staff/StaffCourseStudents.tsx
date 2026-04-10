import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Skeleton } from '../ui/Skeleton'
import { useEnrollments } from '../../hooks/useEnrollments'

export default function StaffCourseStudents({ courseId }: { courseId: string }) {
  const { enrollments, loading, fetchCourseEnrollments, removeStudent } = useEnrollments()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourseEnrollments(courseId)
  }, [courseId, fetchCourseEnrollments])

  async function handleRemove(enrollmentId: string, studentName: string) {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this class?`)) return
    
    setRemovingId(enrollmentId)
    setError(null)
    
    const { error: err } = await removeStudent(enrollmentId)
    if (err) {
      setError(err)
    } else {
      await fetchCourseEnrollments(courseId)
    }
    
    setRemovingId(null)
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Students</h2>
          <p className="text-sm text-slate-500">View and manage the enrolled students roster.</p>
        </div>
        <div className="shrink-0">
          <Badge variant="info" className="text-sm px-3 py-1">
            Total Enrolled: {enrollments.length}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-sm font-medium text-slate-900">No students enrolled</h3>
          <p className="text-sm text-slate-500 mt-1">There are currently no students enrolled in this class.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Institutional ID</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Enrolled Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {enrollments.map((e) => {
                const studentProfile = e.student as any
                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {studentProfile?.full_name || 'Unknown Student'}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {studentProfile?.institutional_id || 'Pending'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {studentProfile?.email || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(e.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={removingId === e.id}
                        disabled={removingId !== null && removingId !== e.id}
                        onClick={() => handleRemove(e.id, studentProfile?.full_name || 'Student')}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
