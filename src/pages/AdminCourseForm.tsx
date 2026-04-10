import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCourses } from '../hooks/useCourses'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function AdminCourseForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { course, fetchCourse, createCourse, updateCourse } = useCourses()

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    instructor: '',
    credits: 3,
    schedule: '',
    max_capacity: 30,
    instructor_id: '',
    faculty_id: '',
    term: 'Spring 2026',
  })
  const [faculties, setFaculties] = useState<{id: string, name: string}[]>([])
  const [staff, setStaff] = useState<{id: string, full_name: string}[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function fetchFaculties() {
    const { data } = await supabase.from('faculties').select('id, name').order('name')
    if (data) setFaculties(data)
  }

  async function fetchStaff() {
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'staff').order('full_name')
    if (data) setStaff(data)
  }

  useEffect(() => {
    if (isEdit && id) fetchCourse(id)
    fetchFaculties()
    fetchStaff()
  }, [isEdit, id, fetchCourse])

  useEffect(() => {
    if (isEdit && course) {
      setForm({
        code: course.code,
        name: course.name,
        description: course.description ?? '',
        instructor: course.instructor,
        credits: course.credits,
        schedule: course.schedule,
        max_capacity: course.max_capacity,
        instructor_id: course.instructor_id || '',
        faculty_id: course.faculty_id || '',
        term: (course as any).term || 'Spring 2026',
      })
    }
  }, [isEdit, course])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    
    setForm((prev) => {
      const updates: Record<string, any> = {
        [name]: name === 'credits' || name === 'max_capacity' ? Number(value) : value,
      }
      
      // auto-fill display name when a staff account is linked
      if (name === 'instructor_id') {
        if (value) {
          const selectedStaff = staff.find(s => s.id === value)
          if (selectedStaff) {
            updates.instructor = `Prof. ${selectedStaff.full_name}`
          }
        } else {
          updates.instructor = ''
        }
      }
      
      return { ...prev, ...updates }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // empty strings break the UUID columns, null them out
    const payload: Record<string, unknown> = { ...form }
    if (payload.instructor_id === '') payload.instructor_id = null
    if (payload.faculty_id === '') payload.faculty_id = null

    const result = isEdit && id
      ? await updateCourse(id, payload as any)
      : await createCourse(payload as any)

    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      navigate('/admin/courses')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/courses')} 
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {isEdit ? 'Update the details for this course.' : 'Add a new course to the university catalog.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to save course</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">General Information</h2>
              <p className="text-sm text-slate-500">Basic details about the course.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="label">Course Code <span className="text-red-500">*</span></label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CS101"
                  className="input-field uppercase"
                />
              </div>
              <div>
                <label htmlFor="name" className="label">Course Title <span className="text-red-500">*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Computer Science"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="instructor" className="label">Display Instructor Name <span className="text-red-500">*</span></label>
                <input
                  id="instructor"
                  name="instructor"
                  type="text"
                  required
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Jane Smith"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="instructor_id" className="label">Linked Staff User (System Account)</label>
                <select
                  id="instructor_id"
                  name="instructor_id"
                  value={form.instructor_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">-- No linked account --</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Allows the staff member to manage this course.</p>
              </div>
            </div>

            <div>
              <label htmlFor="faculty_id" className="label">Associated Faculty</label>
              <select
                id="faculty_id"
                name="faculty_id"
                value={form.faculty_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">-- No faculty --</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="label">Course Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Provide a detailed overview of what students will learn..."
                className="input-field resize-y"
              />
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Logistics & Enrollment</h2>
              <p className="text-sm text-slate-500">Scheduling and capacity limits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="credits" className="label">Credits <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    id="credits"
                    name="credits"
                    required
                    value={form.credits}
                    onChange={handleChange}
                    className="input-field appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Credits</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="max_capacity" className="label">Max Capacity <span className="text-red-500">*</span></label>
                <input
                  id="max_capacity"
                  name="max_capacity"
                  type="number"
                  required
                  min={1}
                  value={form.max_capacity}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="schedule" className="label">Schedule <span className="text-red-500">*</span></label>
                <input
                  id="schedule"
                  name="schedule"
                  type="text"
                  required
                  value={form.schedule}
                  onChange={handleChange}
                  placeholder="e.g. Mon/Wed 10:00 AM"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="term" className="label">Academic Term <span className="text-red-500">*</span></label>
                <input
                  id="term"
                  name="term"
                  type="text"
                  required
                  value={form.term}
                  onChange={handleChange}
                  placeholder="e.g. Spring 2026"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/courses')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            {isEdit ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  )
}
