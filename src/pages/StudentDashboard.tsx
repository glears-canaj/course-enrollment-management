import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEnrollments } from '../hooks/useEnrollments'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import type { CourseNotification } from '../types'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const { enrollments, loading, error, unenroll, fetchMyEnrollments } = useEnrollments()
  const navigate = useNavigate()
  const [recentAnnouncements, setRecentAnnouncements] = useState<(CourseNotification & { course?: { name: string, code: string } })[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true)

  useEffect(() => {
    if (profile) {
      fetchMyEnrollments(profile.id)
    }
  }, [profile, fetchMyEnrollments])

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!enrollments.length) {
        setLoadingAnnouncements(false)
        return
      }
      
      const courseIds = enrollments.map(e => e.course_id)
      const { data, error } = await supabase
        .from('course_notifications')
        .select('*, course:courses(name, code)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!error && data) {
        setRecentAnnouncements(data as unknown as (CourseNotification & { course?: { name: string, code: string } })[])
      }
      setLoadingAnnouncements(false)
    }
    
    if (!loading && profile) {
      fetchAnnouncements()
    }
  }, [enrollments, loading, profile])

  async function handleUnenroll(enrollmentId: string) {
    if (!profile) return
    const { error: err } = await unenroll(enrollmentId)
    if (!err) fetchMyEnrollments(profile.id)
  }

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.course?.credits || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Student Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Welcome back, {profile?.full_name}.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to load enrollments</h3>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
              <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-8 w-12" /> : enrollments.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-indigo-50 text-indigo-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Credits</p>
              <h3 className="text-2xl font-bold text-slate-900">{loading ? <Skeleton className="h-8 w-12" /> : totalCredits}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-amber-50 text-amber-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New Announcements</p>
              <h3 className="text-2xl font-bold text-slate-900">{loadingAnnouncements ? <Skeleton className="h-8 w-12" /> : recentAnnouncements.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My Schedule</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} className="text-blue-600 text-sm">
              Browse More Courses &rarr;
            </Button>
          </div>
          
          <Card className="bg-white shadow-sm border border-[var(--color-border)] p-0" noPadding>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-border)]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase">Course</th>
                    <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">Schedule</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] bg-white">
                  {loading ? (
                    <tr><td colSpan={3} className="py-8"><Skeleton className="h-8 w-32 mx-auto" /></td></tr>
                  ) : enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-sm text-slate-500">
                        No active enrollments.
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4 sm:pl-6 pr-3">
                          <div 
                            className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer text-sm"
                            onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                          >
                            {enrollment.course?.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{enrollment.course?.code}</div>
                        </td>
                        <td className="py-4 px-3 text-sm text-slate-600">
                          {enrollment.course?.schedule || 'TBA'}
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right">
                          <Button
                            onClick={() => handleUnenroll(enrollment.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Drop
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

        {/* Announcements Sidebar */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Recent Announcements</h2>
          <Card className="bg-white shadow-sm border border-slate-200">
            {loadingAnnouncements ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent announcements from your courses.</p>
            ) : (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {announcement.course?.code}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900">{announcement.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{announcement.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
