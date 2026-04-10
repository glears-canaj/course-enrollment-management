import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Course } from '../types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchCourses = useCallback(async (page = 0, pageSize = 10) => {
    setLoading(true)
    setError(null)
    try {
      const from = page * pageSize
      const to = from + pageSize - 1

      const { data, error: fetchError, count } = await supabase
        .from('courses')
        .select('*, enrollments(count)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const mapped = (data ?? []).map((c) => ({
        ...c,
        enrollment_count: c.enrollments?.[0]?.count ?? 0,
      }))
      setCourses(mapped)
      setTotalCount(count ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*, enrollments(count)')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      const mapped = (data ?? []).map((c) => ({
        ...c,
        enrollment_count: c.enrollments?.[0]?.count ?? 0,
      }))
      setCourses(mapped)
      setTotalCount(mapped.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCourse = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*, enrollments(count)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      setCourse({
        ...data,
        enrollment_count: data.enrollments?.[0]?.count ?? 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCourse = useCallback(async (courseData: Omit<Course, 'id' | 'created_at' | 'enrollment_count'>) => {
    setError(null)
    try {
      const { error: insertError } = await supabase.from('courses').insert(courseData)
      if (insertError) throw insertError
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create course'
      return { error: msg }
    }
  }, [])

  const updateCourse = useCallback(async (id: string, courseData: Partial<Course>) => {
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
      if (updateError) throw updateError
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update course'
      return { error: msg }
    }
  }, [])

  const deleteCourse = useCallback(async (id: string) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase.from('courses').delete().eq('id', id)
      if (deleteError) throw deleteError
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete course'
      return { error: msg }
    }
  }, [])

  return {
    courses, course, loading, error, totalCount,
    fetchCourses, fetchAllCourses, fetchCourse,
    createCourse, updateCourse, deleteCourse,
  }
}
