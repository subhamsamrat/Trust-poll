import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { User, LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import logoDark from '../assets/logo_dark.svg'
import logoLight from '../assets/logo_light.svg'
import { useTheme } from '../lib/ThemeContext'
import { useCurrentUser, clearStoredUser } from '../lib/currentUser'
import { useQueryClient } from '@tanstack/react-query'
import { logoutApi } from '../api/auth.api'

export default function Header() {
  const { resolvedTheme } = useTheme()
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      // Ignore if session already expired on server
    }
    clearStoredUser()
    queryClient.setQueryData(['currentUser'], null)
    queryClient.removeQueries({ queryKey: ['currentUser'] })
    setMenuOpen(false)
    navigate({ to: '/' })
  }

  const isLoggedIn = mounted && Boolean(currentUser)

  const logo = mounted && resolvedTheme === 'dark' ? logoDark : logoLight

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 ease-in-out px-3 sm:px-6 py-2.5 sm:py-3">
      <nav
        aria-label="Main Navigation"
        className={`mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled
            ? 'max-w-5xl rounded-full bg-white/80 dark:bg-[#111111]/80 px-4 sm:px-6 py-2 backdrop-blur-md border border-neutral-200/70 dark:border-neutral-800/80 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]'
            : 'max-w-7xl rounded-2xl bg-transparent px-4 sm:px-6 py-3 border border-transparent'
        }`}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90"
            aria-label="TrustPoll Home"
          >
            <img src={logo} alt="TrustPoll Logo" className="h-7 sm:h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          {isLoggedIn ? (
            /* Logged in: Profile Icon with Dropdown */
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-sm transition cursor-pointer"
                aria-label="User menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-[#FF8F00] font-bold">
                  <User size={16} />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-xl backdrop-blur-md z-50">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  >
                    <User size={14} className="text-amber-500" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out */
            <Link
              to="/login"
              className="group relative inline-block overflow-hidden rounded-full p-[1.5px] transition-transform duration-200 active:scale-95 shadow-sm hover:shadow-[0_0_20px_rgba(255,143,0,0.35)]"
            >
              {/* Animated glowing star borders */}
              <div
                className="animate-star-movement-bottom absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-80"
                style={{
                  background: 'radial-gradient(circle, #FF8F00, transparent 15%)',
                  animationDuration: '5s',
                }}
              />
              <div
                className="animate-star-movement-top absolute left-[-250%] top-[-10px] z-0 h-[50%] w-[300%] rounded-full opacity-80"
                style={{
                  background: 'radial-gradient(circle, #FF8F00, transparent 15%)',
                  animationDuration: '5s',
                }}
              />

              {/* Button Inner Background & Typography */}
              <div className="relative z-10 flex items-center justify-center rounded-full border border-neutral-300/60 dark:border-neutral-800 bg-gradient-to-b from-neutral-800 to-black dark:from-neutral-900 dark:to-neutral-950 px-4 sm:px-5 py-1.5 text-center text-xs sm:text-sm font-semibold text-white transition-all duration-200 group-hover:brightness-110">
                Login
              </div>
            </Link>
          )}

          {/* Theme Toggle Icon */}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
