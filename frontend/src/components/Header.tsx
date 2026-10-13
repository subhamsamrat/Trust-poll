import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import logoDark from '../assets/logo_dark.svg'
import logoLight from '../assets/logo_light.svg'
import { useTheme } from '../lib/ThemeContext'

export default function Header() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        {/* Left: Brand Logo (Preserved exact logo icon) */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-90"
            aria-label="TrustPoll Home"
          >
            <img src={logo} alt="TrustPoll Logo" className="h-7 sm:h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Right: Actions (MasterJi StarBorder Login Button & Theme Toggle) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* MasterJi-style StarBorder Animated Login Button */}
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

          {/* Preserved ThemeToggle Icon */}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
