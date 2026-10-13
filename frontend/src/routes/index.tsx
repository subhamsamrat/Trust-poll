import { createFileRoute, Link } from '@tanstack/react-router'
import { Vote, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center max-w-3xl my-10 sm:my-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
          <ShieldCheck size={16} />
          <span>Transparent & Verifiable Polling</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight sm:leading-none">
          Make Your Voice Heard on <span className="text-blue-600 dark:text-blue-500">TrustPoll</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Create, vote, and verify polls with full transparency and confidence. Real-time metrics, fraud-resistant voting, and community trust.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Explore Dashboard</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF8F00] hover:bg-amber-600 text-black font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6 mb-16">
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-500 mb-4">
            <Vote size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Secure Voting
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Every vote is recorded with tamper-proof integrity, preventing duplicate or fraudulent submissions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-green-500/15 flex items-center justify-center text-green-500 mb-4">
            <BarChart3 size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Real-Time Analytics
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Watch live polling trends, voter distribution, and comprehensive metrics update instantaneously.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Verified Pollsters
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Know who created the poll and rest assured that results represent actual community sentiment.
          </p>
        </div>
      </section>
    </div>
  )
}
