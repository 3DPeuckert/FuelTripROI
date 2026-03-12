/**
 * useTheme — manages the dark/light mode preference.
 *
 * Priority:
 *  1. User-set localStorage value ('dark' | 'light')
 *  2. OS/browser `prefers-color-scheme` on first load
 *
 * Applies/removes the `dark` class on <html> so Tailwind's
 * `darkMode: 'class'` works correctly.
 */

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fueltriproi-theme'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage not available
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = getInitialTheme()
    applyTheme(t)
    return t
  })

  // Keep in sync when system preference changes and no manual override exists
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          const next: Theme = e.matches ? 'dark' : 'light'
          applyTheme(next)
          setTheme(next)
        }
      } catch {
        // ignore
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function toggle() {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      return next
    })
  }

  return { theme, toggle, isDark: theme === 'dark' }
}
