import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bitpath-theme'

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem(STORAGE_KEY) || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return (
    <main className="min-h-screen bg-app text-app transition-colors duration-300">

    </main>
  )
}

export default App
