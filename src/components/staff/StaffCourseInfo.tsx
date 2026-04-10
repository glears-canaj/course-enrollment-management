import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useCourses } from '../../hooks/useCourses'
import type { Course } from '../../types'

export default function StaffCourseInfo({ course }: { course: Course }) {
  const { updateCourse } = useCourses()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    description: course.description || '',
    schedule: course.schedule || '',
    term: course.term || '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Using existing updateCourse - assumes RLS allows instructor to update their own course
    const { error: err } = await updateCourse(course.id, form)
    
    if (err) {
      setError(err)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setLoading(false)
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Course Information</h2>
        <p className="text-sm text-slate-500">Update the schedule, term, or description for {(course as Course).code}. Note: core details like credits and capacity are managed by administrators.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 rounded bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          Course information updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">Term (e.g. Fall 2026)</label>
            <input
              type="text"
              className="input-field"
              value={form.term}
              onChange={e => setForm({ ...form, term: e.target.value })}
              placeholder="Fall 2026"
            />
          </div>
          <div>
            <label className="label">Schedule / Timetable</label>
            <input
              type="text"
              className="input-field"
              value={form.schedule}
              onChange={e => setForm({ ...form, schedule: e.target.value })}
              placeholder="e.g. Mon/Wed 10:00 AM"
            />
          </div>
        </div>

        <div>
          <label className="label">Course Description / Syllabus Outline</label>
          <textarea
            className="input-field resize-y min-h-[120px]"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the course, goals, and outline..."
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  )
}
