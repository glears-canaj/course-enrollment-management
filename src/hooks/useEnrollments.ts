import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Enrollment } from '../types'

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMyEnrollments = useCallback(async (studentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false })

      if (fetchError) throw fetchError
      setEnrollments(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourseEnrollments = useCallback(async (courseId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select('*, student:profiles(*)')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false })

      if (fetchError) throw fetchError
      setEnrollments(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments')
    } finally {
      setLoading(false)
    }
  }, [])

  const enroll = useCallback(async (studentId: string, courseId: string) => {
    setError(null)
    try {
      const { error: insertError } = await supabase
        .from('enrollments')
        .insert({ student_id: studentId, course_id: courseId })
      if (insertError) throw insertError
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to enroll'
      setError(msg)
      return { error: msg }
    }
  }, [])

  const unenroll = useCallback(async (enrollmentId: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)
      if (deleteError) throw deleteError
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to unenroll'
      setError(msg)
      return { error: msg }
    }
  }, [])

  const removeStudent = useCallback(async (enrollmentId: string) => {
    return unenroll(enrollmentId)
  }, [unenroll])

  return {
    enrollments, loading, error,
    fetchMyEnrollments, fetchCourseEnrollments,
    enroll, unenroll, removeStudent,
  }
}
