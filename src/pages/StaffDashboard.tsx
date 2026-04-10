import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

type FacultyMember = {
  faculty: { id: string; name: string }
  title: string
}

type InstructorCourse = {
  id: string
  name: string
  code: string
  term: string
  _count: { enrollments: number }
}

export default function StaffDashboard() {
  const { user, profile } = useAuth()
  const [faculties, setFaculties] = useState<FacultyMember[]>([])
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [totalUniqueStudents, setTotalUniqueStudents] = useState(0)
  const [loading, setLoading] = useState(true)

  // Quick Announcement State
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({ courseId: '', title: '', content: '' })
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)
  const [announcementSuccess, setAnnouncementSuccess] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Fetch Faculties
    const { data: facultyData } = await supabase
      .from('faculty_members')
      .select('title, faculty:faculties(id, name)')
      .eq('profile_id', user.id)

    if (facultyData) {
      setFaculties(facultyData as unknown as FacultyMember[])
    }

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

      const courseIds = courseData.map(c => c.id)
      if (courseIds.length > 0) {
        const { data: uniqueStudents } = await supabase
          .from('enrollments')
          .select('student_id')
          .in('course_id', courseIds)

        if (uniqueStudents) {
          setTotalUniqueStudents(new Set(uniqueStudents.map(s => s.student_id)).size)
        }
      } else {
        setTotalUniqueStudents(0)
      }
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  async function handlePostAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !announcementForm.courseId) return

    setPostingAnnouncement(true)
    const { error } = await supabase.from('course_notifications').insert({
      course_id: announcementForm.courseId,
      author_id: user.id,
      title: announcementForm.title,
      content: announcementForm.content
    })

    if (!error) {
      setAnnouncementSuccess(true)
      setTimeout(() => {
        setShowAnnouncementModal(false)
        setAnnouncementSuccess(false)
        setAnnouncementForm({ courseId: '', title: '', content: '' })
      }, 1500)
    } else {
      alert("Failed to post announcement: " + error.message)
    }
    setPostingAnnouncement(false)
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Staff Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Welcome back, {profile?.full_name}. Here's an overview of your teaching responsibilities.</p>
        </div>
        <Button onClick={() => setShowAnnouncementModal(true)} variant="primary" className="shrink-0">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Quick Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Taught Courses</p>
              <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-8 w-12" /> : courses.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-green-50 text-green-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-8 w-12" /> : totalUniqueStudents}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden" noPadding>
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">My Assigned Classes</h2>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <div className="p-6 space-y-4">
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
                      className="shrink-0 px-4 py-2 bg-white text-sm font-medium text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition"
                    >
                      Manage Class
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="md:col-span-1 border-t md:border-t-0 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">My Faculties</h2>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : faculties.length === 0 ? (
              <p className="text-sm text-slate-500">You are not assigned to any faculties.</p>
            ) : (
              <ul className="space-y-3">
                {faculties.map((fm, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-md border border-slate-100 flex flex-col">
                    <span className="font-medium text-slate-800">{fm.faculty.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{fm.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-xl relative overflow-hidden">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Post Quick Announcement</h2>
              <p className="text-sm text-slate-500">Send an immediate notification to enrolled students.</p>
            </div>

            {announcementSuccess ? (
              <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Announcement Posted!</h3>
              </div>
            ) : (
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="label">Select Course</label>
                  <select
                    required
                    className="input-field"
                    value={announcementForm.courseId}
                    onChange={e => setAnnouncementForm({ ...announcementForm, courseId: e.target.value })}
                  >
                    <option value="" disabled>-- Choose a course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subject / Title</label>
                  <input
                    required type="text" className="input-field" placeholder="e.g. Schedule Change for Week 4"
                    value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Message Content</label>
                  <textarea
                    required rows={4} className="input-field" placeholder="Type your message here..."
                    value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setShowAnnouncementModal(false)} disabled={postingAnnouncement}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={postingAnnouncement}>Post Now</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
