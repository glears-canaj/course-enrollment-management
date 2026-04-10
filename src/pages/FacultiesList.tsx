import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFaculties } from '../hooks/useFaculties'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'

export default function FacultiesList() {
  const { faculties, loading, error, fetchFaculties, deleteFaculty } = useFaculties()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFaculties()
  }, [fetchFaculties])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the faculty "${name}"? This will remove all associated profile mappings.`)) return
    
    setDeleteError(null)
    const { error: err } = await deleteFaculty(id)
    if (err) {
      setDeleteError(err)
    } else {
      fetchFaculties()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Faculties</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage university faculties and departments.</p>
        </div>
        <Button onClick={() => navigate('/admin/faculties/new')} variant="primary" className="shrink-0">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Faculty
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to load faculties</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {deleteError && (
        <div className="p-4 rounded-md bg-[var(--color-danger-bg)] border border-red-200">
          <h3 className="text-sm font-medium text-[var(--color-danger)]">Failed to delete faculty</h3>
          <p className="mt-1 text-sm text-red-600">{deleteError}</p>
        </div>
      )}

      <Card className="p-0 border border-[var(--color-border)] overflow-hidden bg-white shadow-sm" noPadding>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th scope="col" className="py-3.5 pl-4 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">
                  Name
                </th>
                <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                  Members
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-white">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 pl-4 px-3"><Skeleton className="h-5 w-48" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-full" /></td>
                    <td className="py-4 px-3 flex justify-center"><Skeleton className="h-5 w-8" /></td>
                    <td className="py-4 pl-3 pr-4 sm:pr-6 text-right"><Skeleton className="h-8 w-20 ml-auto rounded" /></td>
                  </tr>
                ))
              ) : faculties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                    No faculties found. Create one to get started.
                  </td>
                </tr>
              ) : (
                faculties.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 pl-4 px-3 text-sm">
                      <div className="font-medium text-[var(--color-text-primary)]">{f.name}</div>
                    </td>
                    <td className="py-4 px-3 text-sm text-[var(--color-text-secondary)] truncate max-w-xs">
                      {f.description || <span className="text-slate-400 italic">No description</span>}
                    </td>
                    <td className="py-4 px-3 text-sm text-center font-medium text-[var(--color-text-secondary)]">
                      {f.member_count}
                    </td>
                    <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => navigate(`/admin/faculties/${f.id}/edit`)}
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900 bg-slate-50 px-2 border border-slate-200"
                          title="Edit Faculty"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => handleDelete(f.id, f.name)}
                          variant="ghost"
                          size="sm"
                          className="text-[#EF4444] hover:text-white hover:bg-[#EF4444] px-2 shadow-sm border border-red-100"
                          title="Delete Faculty"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
