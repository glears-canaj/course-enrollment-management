import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'admin'>('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await signUp(email, password, fullName, role)
    if (err) {
      setError(err)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-center bg-no-repeat bg-[length:60%_auto] md:bg-[length:35%_auto] max-h-screen"
        style={{ backgroundImage: "url('/unyt.svg')", backgroundPosition: "center 40%" }}
      />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/unyt.svg" alt="UNYT Logo" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-md" />
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Create an account</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Enter your details to get started.</p>
        </div>

        <Card>
          {error && (
            <div className="mb-5 p-3 rounded bg-[var(--color-danger-bg)] border border-red-200 text-sm text-[var(--color-danger)] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label">Full Name</label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="role" className="label">Account Role</label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'admin')}
                  className="input-field appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin / Staff</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="mt-4"
            >
              Sign up
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  )
}
