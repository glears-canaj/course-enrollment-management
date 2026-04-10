import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(profile.full_name)
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return

    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      await refreshProfile()
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">My Profile</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your account information.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === 'success' 
            ? 'bg-[var(--color-success-bg)] border-green-200 text-[var(--color-success)]' 
            : 'bg-[var(--color-danger-bg)] border-red-200 text-[var(--color-danger)]'
        }`}>
          <h3 className="text-sm font-medium">{message.type === 'success' ? 'Success' : 'Error'}</h3>
          <p className={`mt-1 text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label text-sm font-medium text-slate-700 mb-1 block">Account Role</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm capitalize">
              {profile?.role}
            </div>
            <p className="text-xs text-slate-400 mt-1">Role cannot be changed. Contact an administrator for role changes.</p>
          </div>

          <div>
            <label className="label text-sm font-medium text-slate-700 mb-1 block">Email Address</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm">
              {user?.email}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="label text-sm font-medium text-slate-700 mb-1 block">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={fullName === profile?.full_name}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
