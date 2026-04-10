import { useState, useEffect, useMemo } from 'react'
import { supabase, adminAuthClient } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useFaculties } from '../hooks/useFaculties'
import type { Profile } from '../types'

interface UserExtended extends Profile {
  assigned_faculty_id?: string
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<UserExtended[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [facultyFilter, setFacultyFilter] = useState('all')

  // Forms State
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'student', facultyId: '', title: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  const [editingUser, setEditingUser] = useState<UserExtended | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', role: 'student', facultyId: '', title: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { faculties, fetchFaculties } = useFaculties()

  async function fetchProfiles() {
    setLoading(true)
    // We also need to fetch their faculty associations if they are staff
    const { data: profilesData, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    
    // Fetch faculty members
    const { data: facultyMembers } = await supabase.from('faculty_members').select('profile_id, faculty_id')
    
    const combined = profilesData.map(p => {
      const member = facultyMembers?.find(fm => fm.profile_id === p.id)
      return { ...p, assigned_faculty_id: member?.faculty_id }
    })

    setProfiles(combined as UserExtended[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
    fetchFaculties()
  }, [fetchFaculties])

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function openEditModal(user: UserExtended) {
    setEditingUser(user)
    setEditForm({
      fullName: user.full_name,
      role: user.role,
      facultyId: user.assigned_faculty_id || '',
      title: 'Professor' // Hardcoded default for visual simplicity
    })
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: form.role }
      }
    })

    if (authError) {
      setCreateError(authError.message)
      setCreating(false)
      return
    }

    const newUserId = authData.user?.id

    if (newUserId && form.role === 'staff' && form.facultyId) {
      await new Promise(res => setTimeout(res, 800)) // Wait for trigger
      await supabase.from('faculty_members').insert({
        faculty_id: form.facultyId,
        profile_id: newUserId,
        title: form.title || 'Professor'
      })
    }

    setCreating(false)
    setShowAddForm(false)
    setForm({ email: '', password: '', fullName: '', role: 'student', facultyId: '', title: '' })
    fetchProfiles()
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setSavingEdit(true)

    // quick fix: update profile basic data first
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: editForm.fullName, role: editForm.role })
      .eq('id', editingUser.id)

    if (profileError) {
      alert("Failed to update profile: " + profileError.message)
      setSavingEdit(false)
      return
    }

    // handle faculty map if staff
    if (editForm.role === 'staff') {
      // Check if they already have an assignment
      const { data: existing } = await supabase.from('faculty_members').select('*').eq('profile_id', editingUser.id).maybeSingle()
      
      if (editForm.facultyId) {
        if (existing) {
          await supabase.from('faculty_members').update({ faculty_id: editForm.facultyId }).eq('profile_id', editingUser.id)
        } else {
          await supabase.from('faculty_members').insert({ profile_id: editingUser.id, faculty_id: editForm.facultyId, title: editForm.title || 'Staff' })
        }
      } else if (existing) {
        // Remove assignment if empty
        await supabase.from('faculty_members').delete().eq('profile_id', editingUser.id)
      }
    } else {
      // If changed to student/admin, remove from faculty_members
      await supabase.from('faculty_members').delete().eq('profile_id', editingUser.id)
    }

    setSavingEdit(false)
    setEditingUser(null)
    fetchProfiles()
  }

  async function handleDeleteUser(user: UserExtended) {
    if (!confirm(`Are you absolutely sure you want to delete ${user.full_name}? This action cannot be undone and will remove all their enrollments and data.`)) return
    
    setDeletingId(user.id)
    const { error: err } = await supabase.rpc('delete_user', { target_user_id: user.id })
    if (err) {
      alert("Failed to delete user: " + err.message)
    } else {
      setProfiles(prev => prev.filter(p => p.id !== user.id))
    }
    setDeletingId(null)
  }

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = 
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.institutional_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const matchesFaculty = facultyFilter === 'all' || p.assigned_faculty_id === facultyFilter;

      return matchesSearch && matchesRole && matchesFaculty
    })
  }, [profiles, searchQuery, roleFilter, facultyFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">User Management</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage institutional access, roles, and faculty assignments.</p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} variant="primary" className="shrink-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="bg-[#F8FAFC] border-[var(--color-border)] shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Create User Account</h2>
          </div>
          {createError && <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">{createError}</div>}
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input required type="text" name="fullName" value={form.fullName} onChange={handleFormChange} className="input-field" /></div>
              <div><label className="label">Email Address</label><input required type="email" name="email" value={form.email} onChange={handleFormChange} className="input-field" /></div>
              <div><label className="label">Password</label><input required type="password" name="password" value={form.password} onChange={handleFormChange} className="input-field" minLength={6} /></div>
              <div>
                <label className="label">Role</label>
                <select required name="role" value={form.role} onChange={handleFormChange} className="input-field">
                  <option value="student">Student</option>
                  <option value="staff">Staff / Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            {form.role === 'staff' && (
              <div className="border-t border-slate-200 mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Primary Faculty</label>
                  <select name="facultyId" value={form.facultyId} onChange={handleFormChange} className="input-field">
                    <option value="">-- None --</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Job Title</label><input type="text" name="title" value={form.title} onChange={handleFormChange} className="input-field" /></div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={creating}>Create User</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Users</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="input-field pl-10 h-10 w-full"
              placeholder="Name or institutional ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Role</label>
          <select className="input-field h-10 w-full" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Staff/Professors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Faculty</label>
          <select className="input-field h-10 w-full disabled:opacity-50 disabled:bg-slate-100" disabled={roleFilter === 'student' || roleFilter === 'admin'} value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)}>
            <option value="all">All Faculties</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        { (searchQuery || roleFilter !== 'all' || facultyFilter !== 'all') && (
          <div className="w-full sm:w-auto">
            <Button 
                variant="ghost" 
                className="h-10 px-4 text-slate-500 hover:text-slate-700 w-full sm:w-auto mt-2 sm:mt-0"
                onClick={() => { setSearchQuery(''); setRoleFilter('all'); setFacultyFilter('all'); }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">Error: {error}</div>
      ) : (
        <Card className="p-0 border border-slate-200 overflow-hidden shadow-sm" noPadding>
          {/* TODO: this table crashes the browser if there are more than 100 users. need to add pagination next sprint */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 px-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Role & Faculty</th>
                  <th scope="col" className="py-3.5 px-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Joined</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                   <tr><td colSpan={5} className="py-8 text-center"><Skeleton className="h-6 w-32 mx-auto" /></td></tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-500">No users found matching your criteria.</td></tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const faculty = faculties.find(f => f.id === p.assigned_faculty_id)
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4 px-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{p.full_name}</span>
                            {/* Note: profiles table doesn't actively store email in this schema, auth.users does */}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-col">
                            {p.institutional_id ? (
                              <Badge variant="neutral" className="w-fit font-mono">{p.institutional_id}</Badge>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">Pending...</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 hidden md:table-cell">
                          <div className="flex flex-col items-start gap-1">
                            <Badge variant={p.role === 'admin' ? 'info' : p.role === 'staff' ? 'success' : 'neutral'} className="capitalize">
                              {p.role}
                            </Badge>
                            {faculty && <span className="text-xs text-slate-500">{faculty.name}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-sm text-slate-500 hidden lg:table-cell">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-900">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" isLoading={deletingId === p.id} onClick={() => handleDeleteUser(p)} className="text-red-600 hover:text-red-900">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit User: {editingUser.full_name}</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div><label className="label">Full Name</label><input required type="text" name="fullName" value={editForm.fullName} onChange={handleEditFormChange} className="input-field" /></div>
              <div>
                <label className="label">Role</label>
                <select required name="role" value={editForm.role} onChange={handleEditFormChange} className="input-field">
                  <option value="student">Student</option>
                  <option value="staff">Staff / Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {editForm.role === 'staff' && (
                <div>
                  <label className="label">Primary Faculty</label>
                  <select name="facultyId" value={editForm.facultyId} onChange={handleEditFormChange} className="input-field">
                    <option value="">-- None --</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} disabled={savingEdit}>Cancel</Button>
                <Button type="submit" variant="primary" isLoading={savingEdit}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
