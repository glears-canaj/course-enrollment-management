import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useEnrollments } from '../hooks/useEnrollments'
import { useAuth } from '../hooks/useAuth'
import EnrollButton from '../components/EnrollButton'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useNotifications } from '../hooks/useNotifications'
import { supabase } from '../lib/supabaseClient'
import type { CourseNotification } from '../types'
import { formatDate, formatTime } from '../utils/helpers'

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { course, loading, error, fetchCourse } = useCourses()
  const { enrollments, enroll, unenroll, fetchMyEnrollments } = useEnrollments()
  const [facultyName, setFacultyName] = useState<string | null>(null)
  const { notifications, loading: loadingNotifs, fetchNotifications, createNotification, deleteNotification } = useNotifications(id)
  const [message, setMessage] = useState<string | null>(null)
  
  // need to toggle form for instructors
  const [showNotifForm, setShowNotifForm] = useState(false)
  const [notifForm, setNotifForm] = useState({ title: '', content: '' })
  const [postingNotif, setPostingNotif] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCourse(id)
      fetchNotifications()
    }
  }, [id, fetchCourse, fetchNotifications])

  useEffect(() => {
    if (course?.faculty_id) {
      supabase.from('faculties').select('name').eq('id', course.faculty_id).single().then(({ data }) => {
        if (data) setFacultyName(data.name)
      })
    }
  }, [course])

  useEffect(() => {
    if (profile) fetchMyEnrollments(profile.id)
  }, [profile, fetchMyEnrollments])

  const myEnrollment = enrollments.find((e) => e.course_id === id)
  const enrolled = !!myEnrollment
  const courseFull = course ? (course.enrollment_count ?? 0) >= course.max_capacity : false

  async function handleEnroll() {
    if (!profile || !id) return
    setMessage(null)
    const { error: err } = await enroll(profile.id, id)
    if (err) {
      setMessage(err)
    } else {
      setMessage('Successfully enrolled in the course.')
      fetchCourse(id)
      fetchMyEnrollments(profile.id)
    }
  }

  async function handleUnenroll() {
    if (!myEnrollment || !profile || !id) return
    setMessage(null)
    const { error: err } = await unenroll(myEnrollment.id)
    if (err) {
      setMessage(err)
    } else {
      setMessage('Successfully unenrolled from the course.')
      fetchCourse(id)
      fetchMyEnrollments(profile.id)
    }
  }

  const isInstructor = profile?.role === 'staff' && course?.instructor_id === profile?.id

  async function handlePostNotification(e: React.FormEvent) {
    e.preventDefault()
    setPostingNotif(true)
    const { error } = await createNotification(notifForm.title, notifForm.content)
    if (error) {
      setMessage(`Failed to post notification: ${error}`)
    } else {
      setMessage('Notification posted successfully.')
      setNotifForm({ title: '', content: '' })
      setShowNotifForm(false)
    }
    setPostingNotif(false)
  }

  async function handleDeleteNotification(notifId: string) {
    if (!confirm('Are you sure you want to delete this notification?')) return
    const { error } = await deleteNotification(notifId)
    if (error) {
      setMessage(`Failed to delete notification: ${error}`)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Courses
      </button>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Error</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-md bg-[var(--color-success-bg)] border border-green-200">
          <h3 className="text-sm font-medium text-[var(--color-success)]">Success</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
      )}

      {loading ? (
        <Card>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <div className="pt-6 grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
      ) : course ? (
        <Card className="overflow-hidden p-0" noPadding>
          <div className="bg-[var(--color-primary)] px-6 py-8 sm:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-none font-semibold">
                    {course.code}
                  </Badge>
                  {facultyName && (
                    <Badge variant="info" className="bg-teal-500/30 text-teal-50 border-none font-semibold">
                      {facultyName}
                    </Badge>
                  )}
                  {course.term && (
                    <Badge variant="info" className="bg-blue-500/30 text-blue-50 border-none font-semibold">
                      {course.term}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  {course.name}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
                  {course.description || 'No detailed description provided for this course.'}
                </p>
              </div>
              
              {profile?.role === 'student' && (
                <div className="shrink-0 bg-white/10 p-1 rounded-lg shadow-inner">
                  <EnrollButton
                    enrolled={enrolled}
                    courseFull={courseFull}
                    onEnroll={handleEnroll}
                    onUnenroll={handleUnenroll}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white px-6 py-6 sm:px-10">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Course Details</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Instructor</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)] font-medium">Prof. {course.instructor}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Credits</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)] font-medium">{course.credits}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Schedule</dt>
                <dd className="mt-1 text-sm text-[var(--color-text-primary)] font-medium">{course.schedule}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Capacity Status</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {course.enrollment_count ?? 0} / {course.max_capacity}
                  </span>
                  {courseFull ? (
                    <Badge variant="danger">Full</Badge>
                  ) : (
                    <Badge variant="success">Available</Badge>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          
          {/* TODO: refactor this component later, it's getting way too big */}
          {(enrolled || isInstructor || profile?.role === 'admin') && (
            <div className="bg-[#F8FAFC] border-t border-[var(--color-border)] px-6 py-8 sm:px-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Class Announcements</h2>
                {isInstructor && !showNotifForm && (
                  <Button onClick={() => setShowNotifForm(true)} variant="primary" size="sm">
                    Post Announcement
                  </Button>
                )}
              </div>

              {isInstructor && showNotifForm && (
                <div className="bg-white p-5 rounded-lg border border-slate-200 mb-6 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4">New Announcement</h3>
                  <form onSubmit={handlePostNotification} className="space-y-4">
                    <div>
                      <label className="label">Title</label>
                      <input 
                        required 
                        type="text" 
                        value={notifForm.title} 
                        onChange={(e) => setNotifForm({...notifForm, title: e.target.value})}
                        className="input-field"
                        placeholder="e.g., Change in schedule"
                      />
                    </div>
                    <div>
                      <label className="label">Content</label>
                      <textarea 
                        required 
                        rows={3} 
                        value={notifForm.content} 
                        onChange={(e) => setNotifForm({...notifForm, content: e.target.value})}
                        className="input-field resize-y"
                        placeholder="Write your announcement here..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setShowNotifForm(false)} disabled={postingNotif}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" isLoading={postingNotif}>
                        Post Now
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {loadingNotifs ? (
                  <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-slate-200 border-dashed">
                    <p className="text-slate-500">No announcements have been posted for this class yet.</p>
                  </div>
                ) : (
                  notifications.map((notif: CourseNotification & { author?: { full_name: string } }) => (
                    <div key={notif.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative group">
                      {isInstructor && (
                        <button 
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete announcement"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <h4 className="font-semibold text-lg text-slate-800 pr-8">{notif.title}</h4>
                      <p className="text-sm text-slate-500 mb-3 block">
                        Posted by {notif.author?.full_name || 'Instructor'} on {formatDate(notif.created_at)} at {formatTime(notif.created_at)}
                      </p>
                      <div className="text-slate-700 whitespace-pre-wrap">{notif.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">Course not found</h3>
          <p className="mt-1 text-sm text-slate-500">The course you are looking for does not exist or has been removed.</p>
        </Card>
      )}
    </div>
  )
}
