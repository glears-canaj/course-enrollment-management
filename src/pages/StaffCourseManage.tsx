import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import StaffCourseInfo from '../components/staff/StaffCourseInfo'
import StaffCourseStudents from '../components/staff/StaffCourseStudents'
import StaffCourseAnnouncements from '../components/staff/StaffCourseAnnouncements'
import type { Course } from '../types'

export default function StaffCourseManage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'students' | 'announcements'>('info')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourse() {
      if (!id || !user) return
      setLoading(true)
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error || !data) {
        setError("Could not load course. It may not exist.")
      } else if (data.instructor_id !== user.id) {
        // Security check: ensure the staff actually teaches this course
        setError("You are not authorized to manage this course.")
      } else {
        setCourse(data as Course)
      }
      
      setLoading(false)
    }
    
    fetchCourse()
  }, [id, user])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/staff/courses')} 
        className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to My Classes
      </button>

      {error ? (
        <Card className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">Access Denied</h3>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </Card>
      ) : loading || !course ? (
        <Card>
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="pt-6"><Skeleton className="h-40 w-full" /></div>
          </div>
        </Card>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 sm:p-8 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-white/20 text-white border-none font-semibold">{course.code}</Badge>
                {course.term && <Badge variant="info" className="bg-blue-500/30 text-blue-50 border-none font-semibold">{course.term}</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{course.name}</h1>
              <p className="text-slate-300">Manage course information, enrolled students, and announcements.</p>
            </div>
            
            <div className="flex overflow-x-auto border-b border-slate-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Course Information
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Manage Students
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`flex-1 shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'announcements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Announcements
              </button>
            </div>
          </div>

          <div className="mt-6">
             {activeTab === 'info' && <StaffCourseInfo course={course} />}
             {activeTab === 'students' && <StaffCourseStudents courseId={course.id} />}
             {activeTab === 'announcements' && <StaffCourseAnnouncements courseId={course.id} />}
          </div>
        </>
      )}
    </div>
  )
}
