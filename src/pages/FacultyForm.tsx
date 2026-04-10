import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFaculties } from '../hooks/useFaculties'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function FacultyForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { faculty, fetchFaculty, createFaculty, updateFaculty } = useFaculties()

  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) fetchFaculty(id)
  }, [isEdit, id, fetchFaculty])

  useEffect(() => {
    if (isEdit && faculty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: faculty.name,
        description: faculty.description ?? '',
      })
    }
  }, [isEdit, faculty])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const result = isEdit && id
      ? await updateFaculty(id, form)
      : await createFaculty(form)

    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      navigate('/admin/faculties')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/faculties')} 
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {isEdit ? 'Edit Faculty' : 'Create New Faculty'}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {isEdit ? 'Update the details for this faculty.' : 'Add a new faculty or department to the university.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to save faculty</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="label">Faculty Name <span className="text-red-500">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Faculty of Science"
                className="input-field max-w-lg"
              />
            </div>

            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Provide a brief overview of this faculty..."
                className="input-field resize-y"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/faculties')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            {isEdit ? 'Save Changes' : 'Create Faculty'}
          </Button>
        </div>
      </form>
    </div>
  )
}
