import { useEffect, useState } from 'react'
import { useTheme } from '../lib/ThemeContext'
import { HiDesktopComputer } from "react-icons/hi"
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md"

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme mode"
        className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-lg font-bold text-black dark:text-slate-200 shadow-sm opacity-0"
      >
        <HiDesktopComputer />
      </button>
    )
  }

  const label =
    mode === 'auto'
      ? 'Theme mode: auto (system). Click to switch to light mode.'
      : `Theme mode: ${mode}. Click to switch mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-lg font-bold text-black dark:text-slate-200 shadow-sm transition hover:-translate-y-0.5"
    >
      {mode === 'auto' ? (
        <HiDesktopComputer />
      ) : mode === 'dark' ? (
        <MdDarkMode />
      ) : (
        <MdOutlineLightMode />
      )}
    </button>
  )
}
