import { useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import logo from '../../assets/logo.svg'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Icon } from '@iconify/react'
import { X } from 'lucide-react'
import type { SignupFormInputs } from '../../types/auth.type'
import { useSignupUser } from '#/hooks/auth.hook'


export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>()

  const navigate = useNavigate()

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ to: '/' })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

 const signupApi=useSignupUser();

  const onSubmit: SubmitHandler<SignupFormInputs> = (data) => {
    signupApi.mutate(data)
  }

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12">
      <div className="relative w-full sm:max-w-[420px] p-6 sm:p-8 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center gap-2 text-center pb-6">
          <img src={logo} alt="TrustPoll Logo" className="h-8 w-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign up for your TrustPoll account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              {...register('FullName', { required: 'Full Name is required' })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.FullName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.FullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#FF8F00] hover:bg-amber-600 text-black font-bold rounded-full shadow-md transition cursor-pointer text-sm"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
            <button
              type="button"
              className="w-full py-2.5 flex flex-row items-center justify-center border border-slate-300 dark:border-slate-700 font-medium rounded-full shadow-sm transition cursor-pointer text-sm mt-3 text-slate-800 dark:text-white bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              <Icon icon="devicon:google" className="mr-2 text-base" />
              Continue with Google
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Already have an Account?{' '}
            <Link to="/login" className="text-blue-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
