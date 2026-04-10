import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { CourseNotification } from '../types'

export function useNotifications(courseId?: string) {
  const [notifications, setNotifications] = useState<CourseNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    
    // join profiles to get author name
    const { data, error: err } = await supabase
      .from('course_notifications')
      .select('*, author:profiles(full_name)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setNotifications(data as unknown as CourseNotification[])
      // TODO: type this properly instead of casting, was getting weird TS errors
    }
    
    setLoading(false)
  }, [courseId])

  const createNotification = async (title: string, content: string) => {
    if (!courseId) return { error: 'No course ID provided' }
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return { error: 'Not authenticated' }

    const { error: err } = await supabase.from('course_notifications').insert([{
      course_id: courseId,
      author_id: userData.user.id,
      title,
      content
    }])

    if (err) return { error: err.message }
    
    await fetchNotifications()
    return { error: null }
  }

  const deleteNotification = async (id: string) => {
    const { error: err } = await supabase.from('course_notifications').delete().eq('id', id)
    if (err) return { error: err.message }
    
    await fetchNotifications()
    return { error: null }
  }

  const updateNotification = async (id: string, title: string, content: string) => {
    const { error: err } = await supabase
      .from('course_notifications')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      
    if (err) return { error: err.message }
    
    await fetchNotifications()
    return { error: null }
  }

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification
  }
}
