import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Faculty {
  id: string
  name: string
  description: string | null
  created_at: string
  member_count?: number
}

export function useFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFaculties = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    // Fetch faculties and their member counts
    const { data, error: err } = await supabase
      .from('faculties')
      .select('*, faculty_members(count)')
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      const formatted = data?.map(f => ({
        ...f,
        member_count: f.faculty_members?.[0]?.count ?? 0
      })) || []
      setFaculties(formatted)
    }
    
    setLoading(false)
  }, [])

  const fetchFaculty = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('faculties')
      .select('*')
      .eq('id', id)
      .single()

    if (err) {
      setError(err.message)
      setFaculty(null)
    } else {
      setFaculty(data)
    }
    setLoading(false)
  }, [])

  const createFaculty = async (facultyData: Omit<Faculty, 'id' | 'created_at' | 'member_count'>) => {
    const { error: err } = await supabase.from('faculties').insert([facultyData])
    if (err) return { error: err.message }
    return { error: null }
  }

  const updateFaculty = async (id: string, facultyData: Partial<Omit<Faculty, 'id' | 'created_at' | 'member_count'>>) => {
    const { error: err } = await supabase.from('faculties').update(facultyData).eq('id', id)
    if (err) return { error: err.message }
    return { error: null }
  }

  const deleteFaculty = async (id: string) => {
    const { error: err } = await supabase.from('faculties').delete().eq('id', id)
    if (err) return { error: err.message }
    return { error: null }
  }

  return {
    faculties,
    faculty,
    loading,
    error,
    fetchFaculties,
    fetchFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty
  }
}
