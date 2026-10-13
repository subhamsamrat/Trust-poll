import { Calendar, Eye, FileText, Plus, ShieldCheck, Vote } from "lucide-react"
import { useState } from "react"
import { IoIosSearch } from "react-icons/io"

interface PollItem {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  totalVotes: number
  createdAt: string
  expiresAt: string
}

const mockPolls: PollItem[] = [
  {
    id: '1',
    title: 'Favorite Programming Language in 2026',
    status: 'active',
    responseMode: 'verified',
    totalVotes: 486,
    createdAt: '2026-10-10',
    expiresAt: '2026-10-24',
  },
  {
    id: '2',
    title: 'Best Frontend Framework for Enterprise Apps',
    status: 'active',
    responseMode: 'verified',
    totalVotes: 421,
    createdAt: '2026-10-09',
    expiresAt: '2026-10-23',
  },
  {
    id: '3',
    title: 'Remote Work vs Hybrid vs On-site Survey',
    status: 'active',
    responseMode: 'anonymous',
    totalVotes: 385,
    createdAt: '2026-10-08',
    expiresAt: '2026-10-22',
  },
  {
    id: '4',
    title: 'AI Coding Tools & Copilots Developer Adoption',
    status: 'active',
    responseMode: 'verified',
    totalVotes: 332,
    createdAt: '2026-10-07',
    expiresAt: '2026-10-21',
  },
  {
    id: '5',
    title: 'React 19 vs Angular 19 Migration Plans',
    status: 'active',
    responseMode: 'verified',
    totalVotes: 176,
    createdAt: '2026-10-06',
    expiresAt: '2026-10-20',
  },
  {
    id: '6',
    title: 'Decentralized Identity (DID) Acceptance Survey',
    status: 'scheduled',
    responseMode: 'anonymous',
    totalVotes: 0,
    createdAt: '2026-10-12',
    expiresAt: '2026-10-26',
  },
  {
    id: '7',
    title: 'Community Governance Proposal #42',
    status: 'closed',
    responseMode: 'verified',
    totalVotes: 612,
    createdAt: '2026-09-25',
    expiresAt: '2026-10-05',
  },
]

const Lastsection = () => {
     const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'closed'>('all')

  const filteredPolls = mockPolls.filter((poll) => {
    const matchesSearch =
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.responseMode.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ? true : poll.status === statusFilter

    return matchesSearch && matchesStatus
  })
  return (
    <>
       <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-sm transition-colors">
          {/* Header Controls: Title, Search, and Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  All Polls
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {filteredPolls.length}
              </span>
            </div>

            {/* Search Input & Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64 md:w-72">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 text-xl">
                  <IoIosSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search polls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-sm transition hover:shadow cursor-pointer shrink-0"
              >
                <Plus size={18} />
                <span>Create Poll</span>
              </button>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-100 dark:border-zinc-800/70">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'closed', label: 'Closed' },
              ] as const
            ).map((tab) => {
              const count =
                tab.key === 'all'
                  ? mockPolls.length
                  : mockPolls.filter((p) => p.status === tab.key).length

              const isActive = statusFilter === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Content: When polls exist */}
          {filteredPolls.length > 0 ? (
            <>
              {/* Desktop Table View (Visible on md and larger) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Poll Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Total Votes</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
                    {filteredPolls.map((poll) => (
                      <tr
                        key={poll.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {poll.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              poll.status === 'active'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : poll.status === 'scheduled'
                                ? 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                poll.status === 'active'
                                  ? 'bg-green-500 animate-pulse'
                                  : poll.status === 'scheduled'
                                  ? 'bg-zinc-400'
                                  : 'bg-amber-500'
                              }`}
                            />
                            {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400">
                            {poll.responseMode === 'verified' ? (
                              <>
                                <ShieldCheck size={14} className="text-blue-500" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <span>Anonymous</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white tabular-nums">
                          {poll.totalVotes.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400">
                          {poll.createdAt}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Visible on screens smaller than md) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
                {filteredPolls.map((poll) => (
                  <div
                    key={poll.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 hover:border-slate-300 dark:hover:border-zinc-700 transition flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            poll.status === 'active'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : poll.status === 'scheduled'
                              ? 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              poll.status === 'active'
                                ? 'bg-green-500 animate-pulse'
                                : poll.status === 'scheduled'
                                ? 'bg-zinc-400'
                                : 'bg-amber-500'
                            }`}
                          />
                          {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
                        </span>

                        {/* Mode Badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                          {poll.responseMode === 'verified' && (
                            <ShieldCheck size={13} className="text-blue-500" />
                          )}
                          <span className="capitalize">{poll.responseMode}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                        {poll.title}
                      </h4>
                    </div>

                    {/* Metadata & Action */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
                          <Vote size={14} className="text-blue-500" />
                          {poll.totalVotes}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar size={13} />
                          {poll.createdAt}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-3">
                <FileText size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                No polls found
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No polls match your search query "${searchQuery}". Try a different keyword.`
                  : 'There are no polls in this status category.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
    </>
  )
}

export default Lastsection
