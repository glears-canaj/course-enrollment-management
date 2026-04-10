import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { useNotifications } from '../../hooks/useNotifications'
import type { CourseNotification } from '../../types'

export default function StaffCourseAnnouncements({ courseId }: { courseId: string }) {
  const { notifications, loading, error, fetchNotifications, createNotification, updateNotification, deleteNotification } = useNotifications(courseId)
  
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  function handleAddNew() {
    setForm({ title: '', content: '' })
    setEditingId(null)
    setShowForm(true)
    setActionError(null)
  }

  function handleEdit(notif: CourseNotification) {
    setForm({ title: notif.title, content: notif.content })
    setEditingId(notif.id)
    setShowForm(true)
    setActionError(null)
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return
    setActionError(null)
    const { error: err } = await deleteNotification(id)
    if (err) setActionError(err)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setActionError(null)

    let err = null
    if (editingId) {
      const res = await updateNotification(editingId, form.title, form.content)
      err = res.error
    } else {
      const res = await createNotification(form.title, form.content)
      err = res.error
    }

    if (err) {
      setActionError(err)
    } else {
      setShowForm(false)
      setForm({ title: '', content: '' })
      setEditingId(null)
    }
    setSubmitting(false)
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Announcements</h2>
          <p className="text-sm text-slate-500">Post updates and notifications for enrolled students.</p>
        </div>
        {!showForm && (
          <Button onClick={handleAddNew} variant="primary" className="shrink-0">
            Post Announcement
          </Button>
        )}
      </div>

      {(error || actionError) && (
        <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {error || actionError}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 shadow-inner">
          <h3 className="font-semibold text-slate-800 mb-4">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title / Subject</label>
              <input 
                required 
                type="text" 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="input-field bg-white"
                placeholder="e.g., Change in schedule"
              />
            </div>
            <div>
              <label className="label">Message Content</label>
              <textarea 
                required 
                rows={4} 
                value={form.content} 
                onChange={(e) => setForm({...form, content: e.target.value})}
                className="input-field resize-y bg-white"
                placeholder="Write your announcement here..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={submitting}>
                {editingId ? 'Save Changes' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200 border-dashed">
            <p className="text-slate-500">No announcements have been posted for this class yet.</p>
          </div>
        ) : (
          notifications.map((notif: CourseNotification & { author?: { full_name: string } }) => (
            <div key={notif.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <button 
                  onClick={() => handleEdit(notif)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  title="Edit announcement"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(notif.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Delete announcement"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <h4 className="font-semibold text-lg text-slate-800 pr-16">{notif.title}</h4>
              <p className="text-xs text-slate-500 mb-3 block">
                Posted by {notif.author?.full_name || 'Instructor'} on {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {notif.updated_at && <span className="ml-2 italic text-slate-400">(Edited)</span>}
              </p>
              <div className="text-slate-700 whitespace-pre-wrap">{notif.content}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
