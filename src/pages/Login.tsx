import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await signIn(email, password)
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome back</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Please enter your details to sign in.</p>
        </div>

        <Card>
          {error && (
            <div className="mb-5 p-3 rounded bg-[var(--color-danger-bg)] border border-red-200 text-sm text-[var(--color-danger)] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
            Register now
          </Link>
        </p>
      </div>
    </div>
  )
}
