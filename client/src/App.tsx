import { useMemo, useState, useEffect } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { Logo } from './Logo'

type Point = { x: number; y: number }

function BackgroundFlow() {
  const [pathData, setPathData] = useState('')
  const [checkpoints, setCheckpoints] = useState<Point[]>([])

  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080

    let currentX = 0
    let currentY = Math.floor(Math.random() * (h * 0.6)) + h * 0.2
    const pts: Point[] = [{ x: currentX, y: currentY }]

    const steps = 8
    const segmentWidth = w / steps

    for (let i = 1; i <= steps; i++) {
      currentX = i * segmentWidth
      pts.push({ x: currentX, y: currentY })

      if (i < steps) {
        const nextY = Math.floor(Math.random() * (h * 0.7)) + h * 0.15
        currentY = nextY
        pts.push({ x: currentX, y: currentY })
      }
    }

    const radius = 40
    let d = `M ${pts[0].x} ${pts[0].y}`

    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const next = pts[i + 1]

      const dx1 = curr.x - prev.x
      const dy1 = curr.y - prev.y
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      const r1 = Math.min(radius, len1 / 2)
      const p1x = curr.x - (dx1 / len1) * r1
      const p1y = curr.y - (dy1 / len1) * r1

      const dx2 = next.x - curr.x
      const dy2 = next.y - curr.y
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      const r2 = Math.min(radius, len2 / 2)
      const p2x = curr.x + (dx2 / len2) * r2
      const p2y = curr.y + (dy2 / len2) * r2

      d += ` L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y}`
    }

    d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`

    setPathData(d)
    setCheckpoints(pts.slice(1, -1))
  }, [])

  const shapes = ['cross', 'circle', 'square', 'triangle']

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-app-accent)" />
            <stop offset="50%" stopColor="var(--color-app-primary)" />
            <stop offset="100%" stopColor="var(--color-app-highlight)" />
          </linearGradient>
          <style>
            {`
              .shape-hover {
                pointer-events: auto;
                transition: all 0.3s ease;
                cursor: crosshair;
              }
              .shape-hover:hover {
                transform: scale(1.5);
                filter: drop-shadow(0 0 10px currentColor);
                opacity: 1;
              }
              .flow-path {
                stroke-dasharray: 10 15;
                animation: flowDash 2s linear infinite;
              }
              @keyframes flowDash {
                to { stroke-dashoffset: -25; }
              }
            `}
          </style>
        </defs>
        
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="url(#flowGradient)"
            strokeWidth="2"
            className="flow-path"
          />
        )}

        {checkpoints.map((pt, i) => {
          const shape = shapes[i % shapes.length]
          const colors = [
            'var(--color-app-accent)',
            'var(--color-app-primary)',
            'var(--color-app-highlight)',
          ]
          const color = colors[i % colors.length]

          return (
            <g key={i} transform={`translate(${pt.x}, ${pt.y})`} className="shape-hover" style={{ color }}>
              {shape === 'circle' && <circle cx="0" cy="0" r="8" fill="none" stroke="currentColor" strokeWidth="2" />}
              {shape === 'square' && <rect x="-7" y="-7" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" />}
              {shape === 'triangle' && <polygon points="0,-9 9,7 -9,7" fill="none" stroke="currentColor" strokeWidth="2" />}
              {shape === 'cross' && <path d="M-8 -8 L8 8 M-8 8 L8 -8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_URL || 'http://localhost:5000',
    [],
  )

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const x = `${event.clientX}px`
    const y = `${event.clientY}px`
    document.documentElement.style.setProperty('--mouse-x', x)
    document.documentElement.style.setProperty('--mouse-y', y)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const payload =
        mode === 'signup'
          ? { username, name, dateOfBirth, email, password }
          : { email, password }

      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      localStorage.setItem('bitpathToken', data.token)
      localStorage.setItem('bitpathUser', JSON.stringify(data.user))
      setPassword('')
      setConfirmPassword('')

      if (mode === 'login') {
        navigate('/problems')
        return
      }

      setSuccessMessage('Signup successful. Please login to continue.')
      navigate('/login')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        setError('Unable to process authentication')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="relative min-h-screen bg-app-bg text-app-text"
      onMouseMove={handleMouseMove}
    >
      <div className="interactive-dots" />
      <div className="interactive-dots-glow" />
      <BackgroundFlow />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="mb-10 max-w-xl lg:mb-0">
          <Logo />
          <h1 className="mt-8 font-heading text-4xl leading-tight text-app-text sm:text-5xl">
            Code with confidence.
            <br />
            Learn through structure.
          </h1>
          <p className="mt-6 max-w-lg text-base text-app-muted sm:text-lg">
            Start with your profile, track your progress, and run coding tests directly on the
            platform while staying organized by roadmap goals.
          </p>
        </section>

        <section className="w-full max-w-md rounded-none border border-app-border bg-app-bg p-6 sm:p-8 relative">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <label className="block">
                  <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                    Username
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value.toLowerCase())}
                    className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                    placeholder="your_unique_handle"
                    pattern="[a-z0-9_-]+"
                    minLength={3}
                    maxLength={32}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                    Full Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                    Date of Birth
                  </span>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => setDateOfBirth(event.target.value)}
                    className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                    required
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                placeholder="you@bitpath.dev"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            {mode === 'signup' && (
              <label className="block">
                <span className="mb-2 block font-heading text-xs uppercase tracking-widest text-app-muted">
                  Confirm Password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-none border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text outline-none ring-app-primary transition focus:ring-2"
                  placeholder="Re-enter password"
                  minLength={6}
                  required
                />
              </label>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {successMessage && <p className="text-sm text-app-accent">{successMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-none bg-app-primary px-4 py-2.5 font-heading text-sm uppercase tracking-widest text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Enter BitPath'}
            </button>
            
            <div className="mt-6 pt-2 border-t border-app-border text-center font-heading text-sm text-app-muted">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <Link to="/login" className="text-app-accent hover:text-white transition">
                    Login here
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-app-accent hover:text-white transition">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

type StoredUser = {
  name?: string
  username?: string
}

function getStoredUser(): StoredUser {
  try {
    const rawUser = localStorage.getItem('bitpathUser')
    if (!rawUser) return {}
    return JSON.parse(rawUser) as StoredUser
  } catch {
    return {}
  }
}

function AppNavbar() {
  const user = getStoredUser()
  const fullName = user.name || 'BitPath User'
  const username = user.username || 'member'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  return (
    <header className="sticky top-4 z-20 rounded-none border border-app-border bg-app-bg shadow-[0_12px_30px_rgba(10,10,15,0.35)]">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="flex items-center gap-2 sm:gap-3">
            <NavLink
              to="/problems"
              className={({ isActive }) =>
                `rounded-none border px-3 py-1.5 font-heading text-xs uppercase tracking-widest transition ${
                  isActive
                    ? 'border-app-primary bg-app-primary text-white'
                    : 'border-app-border text-app-muted hover:border-app-accent hover:text-app-accent'
                }`
              }
            >
              Problems
            </NavLink>
            <NavLink
              to="/roadmaps"
              className={({ isActive }) =>
                `rounded-none border px-3 py-1.5 font-heading text-xs uppercase tracking-widest transition ${
                  isActive
                    ? 'border-app-accent bg-app-accent text-app-bg'
                    : 'border-app-border text-app-muted hover:border-app-accent hover:text-app-accent'
                }`
              }
            >
              Roadmaps
            </NavLink>
          </nav>

          <div className="flex items-center gap-3 border-l border-app-border pl-4 sm:pl-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-app-border bg-app-surface font-heading text-sm text-app-accent">
              {initials || 'U'}
            </div>
            <div>
              <p className="font-highlight text-2xl leading-none text-app-text">{fullName}</p>
              <p className="mt-1 font-heading text-xs text-app-muted">@{username}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function ProtectedLayout() {
  const token = localStorage.getItem('bitpathToken')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="relative min-h-screen bg-app-bg text-app-text">
      <div className="interactive-dots" />
      <div className="interactive-dots-glow" />
      <BackgroundFlow />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-6 pt-4 pb-8 sm:px-10">
        <AppNavbar />
        <main className="pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function ProblemsPage() {
  return (
    <section>
      <h1 className="font-heading text-4xl text-app-text sm:text-5xl">Problems</h1>
      <p className="mt-4 max-w-3xl text-app-muted">
        Practice coding questions here. We can now add categories, difficulty filters, and test-run
        actions connected to your evaluation pipeline.
      </p>
    </section>
  )
}

function RoadmapsPage() {
  return (
    <section>
      <h1 className="font-heading text-4xl text-app-text sm:text-5xl">Roadmaps</h1>
      <p className="mt-4 max-w-3xl text-app-muted">
        Organize learning paths by goals and track progress. This page is your second main route
        alongside Problems.
      </p>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/roadmaps" element={<RoadmapsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}

export default App
