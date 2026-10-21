import {
  Calendar,
  Eye,
  FileText,
  Plus,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  QrCode,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react"
import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { IoIosSearch } from "react-icons/io"
import CreatePoll from "#/components/polls/createPoll"
import ViewPoll, { type PollDetail } from "#/components/polls/viewPoll"
import type { PollItem, ShareModalProps } from "#/types/dashboard.type"

// ─── Mock list data (shown in table / cards) ───────────────────────────────────

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

// ─── Rich mock detail data (keyed by poll ID) ──────────────────────────────────
// Replace this with a real API call: GET /polls/:id

const mockPollDetails: Record<string, PollDetail> = {
  '1': {
    id: '1',
    title: 'Favorite Programming Language in 2026',
    status: 'active',
    responseMode: 'verified',
    isActive: true,
    isPublished: true,
    createdAt: '2026-10-10T09:00:00.000Z',
    expiresAt: '2026-10-24T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 620,
    totalVoters: 486,
    questions: [
      {
        id: 'q1',
        question: 'Which programming language do you use most in 2026?',
        options: [
          { id: 'o1', text: 'TypeScript', voteCount: 210 },
          { id: 'o2', text: 'Python', voteCount: 145 },
          { id: 'o3', text: 'Rust', voteCount: 80 },
          { id: 'o4', text: 'Go', voteCount: 51 },
        ],
      },
      {
        id: 'q2',
        question: 'What is your primary use case?',
        options: [
          { id: 'o5', text: 'Web Development', voteCount: 220 },
          { id: 'o6', text: 'Data Science / AI', voteCount: 160 },
          { id: 'o7', text: 'Systems / Embedded', voteCount: 106 },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Best Frontend Framework for Enterprise Apps',
    status: 'active',
    responseMode: 'verified',
    isActive: true,
    isPublished: true,
    createdAt: '2026-10-09T10:00:00.000Z',
    expiresAt: '2026-10-23T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 540,
    totalVoters: 421,
    questions: [
      {
        id: 'q3',
        question: 'Which frontend framework does your team use in production?',
        options: [
          { id: 'o8', text: 'React', voteCount: 200 },
          { id: 'o9', text: 'Angular', voteCount: 120 },
          { id: 'o10', text: 'Vue', voteCount: 60 },
          { id: 'o11', text: 'Svelte', voteCount: 41 },
        ],
      },
    ],
  },
  '3': {
    id: '3',
    title: 'Remote Work vs Hybrid vs On-site Survey',
    status: 'active',
    responseMode: 'anonymous',
    isActive: true,
    isPublished: true,
    createdAt: '2026-10-08T08:00:00.000Z',
    expiresAt: '2026-10-22T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 500,
    totalVoters: 385,
    questions: [
      {
        id: 'q4',
        question: 'What work model do you prefer?',
        options: [
          { id: 'o12', text: 'Fully Remote', voteCount: 180 },
          { id: 'o13', text: 'Hybrid', voteCount: 140 },
          { id: 'o14', text: 'On-site', voteCount: 65 },
        ],
      },
    ],
  },
  '4': {
    id: '4',
    title: 'AI Coding Tools & Copilots Developer Adoption',
    status: 'active',
    responseMode: 'verified',
    isActive: true,
    isPublished: true,
    createdAt: '2026-10-07T11:00:00.000Z',
    expiresAt: '2026-10-21T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 400,
    totalVoters: 332,
    questions: [
      {
        id: 'q5',
        question: 'Which AI coding assistant do you use daily?',
        options: [
          { id: 'o15', text: 'GitHub Copilot', voteCount: 140 },
          { id: 'o16', text: 'Cursor / Antigravity', voteCount: 110 },
          { id: 'o17', text: 'Gemini Code Assist', voteCount: 52 },
          { id: 'o18', text: 'None', voteCount: 30 },
        ],
      },
    ],
  },
  '5': {
    id: '5',
    title: 'React 19 vs Angular 19 Migration Plans',
    status: 'active',
    responseMode: 'verified',
    isActive: true,
    isPublished: false,
    createdAt: '2026-10-06T09:30:00.000Z',
    expiresAt: '2026-10-20T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 210,
    totalVoters: 176,
    questions: [
      {
        id: 'q6',
        question: 'Are you planning to migrate to React 19 this year?',
        options: [
          { id: 'o19', text: 'Yes, already started', voteCount: 80 },
          { id: 'o20', text: 'Planning to', voteCount: 60 },
          { id: 'o21', text: 'No, staying on older version', voteCount: 36 },
        ],
      },
    ],
  },
  '6': {
    id: '6',
    title: 'Decentralized Identity (DID) Acceptance Survey',
    status: 'scheduled',
    responseMode: 'anonymous',
    isActive: false,
    isPublished: false,
    createdAt: '2026-10-12T14:00:00.000Z',
    startsAt: '2026-10-20T09:00:00.000Z',
    expiresAt: '2026-10-26T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 0,
    totalVoters: 0,
    questions: [
      {
        id: 'q7',
        question: 'Would you adopt decentralized identity in your next project?',
        options: [
          { id: 'o22', text: 'Definitely yes', voteCount: 0 },
          { id: 'o23', text: 'Maybe, need to research', voteCount: 0 },
          { id: 'o24', text: 'No', voteCount: 0 },
        ],
      },
    ],
  },
  '7': {
    id: '7',
    title: 'Community Governance Proposal #42',
    status: 'closed',
    responseMode: 'verified',
    isActive: false,
    isPublished: true,
    createdAt: '2026-09-25T08:00:00.000Z',
    expiresAt: '2026-10-05T23:59:59.000Z',
    creatorId: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
    totalVisitors: 780,
    totalVoters: 612,
    questions: [
      {
        id: 'q8',
        question: 'Do you approve Proposal #42?',
        options: [
          { id: 'o25', text: 'Approve', voteCount: 430 },
          { id: 'o26', text: 'Reject', voteCount: 120 },
          { id: 'o27', text: 'Abstain', voteCount: 62 },
        ],
      },
    ],
  },
}

// ─── Share Modal Component ──────────────────────────────────────────────────



function ShareModal({ poll, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen || !poll) return null

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/answerPoll?id=${poll.id}`
      : `https://trustpoll.app/answerPoll?id=${poll.id}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const shareVia = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: `Vote on "${poll.title}" on TrustPoll!`,
          url,
        })
      } catch {
        // user cancelled
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                Share Poll
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">Invite others to vote</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Poll Title display */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 line-clamp-2">
            {poll.title}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 inline-block capitalize">
            Status:{' '}
            <span
              className={`font-semibold ${
                poll.status === 'active'
                  ? 'text-green-500'
                  : poll.status === 'scheduled'
                  ? 'text-zinc-400'
                  : 'text-amber-500'
              }`}
            >
              {poll.status}
            </span>
          </span>
        </div>

        {/* Copy URL bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 truncate rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-slate-600 dark:text-zinc-300 font-mono">
            {url}
          </div>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Toggle QR code */}
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/50 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition mb-3 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <QrCode size={15} className="text-blue-500" />
            <span>Show QR Code</span>
          </span>
          <ChevronRight
            size={14}
            className={`text-slate-400 transition-transform ${showQR ? 'rotate-90' : ''}`}
          />
        </button>

        {showQR && (
          <div className="mb-3 py-4 px-2 bg-slate-50 dark:bg-zinc-800/90 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <QRCodeSVG
                value={url}
                size={168}
                level="M"
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-center text-[11px] text-slate-400 dark:text-zinc-500 mt-2.5">
              Scan to open and vote on this poll
            </p>
          </div>
        )}

        {/* Native share button if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={shareVia}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            <ExternalLink size={14} />
            Share via...
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

const Lastsection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'closed'>('all')
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false)

  // ViewPoll state
  const [viewPoll, setViewPoll] = useState<PollDetail | null>(null)
  const [isViewPollOpen, setIsViewPollOpen] = useState(false)

  // SharePoll state
  const [sharePoll, setSharePoll] = useState<PollItem | null>(null)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const openShare = (poll: PollItem) => {
    setSharePoll(poll)
    setIsShareOpen(true)
  }

  const openView = (pollId: string) => {
    const detail = mockPollDetails[pollId]
    if (detail) {
      setViewPoll(detail)
      setIsViewPollOpen(true)
    }
  }

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
      {/* Modals */}
      <CreatePoll
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        creatorId="ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea"
      />
      <ViewPoll
        isOpen={isViewPollOpen}
        onClose={() => setIsViewPollOpen(false)}
        poll={viewPoll}
      />
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        poll={sharePoll}
      />

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
              onClick={() => setIsCreatePollOpen(true)}
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
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-center">Share</th>
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
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-zinc-400">
                        {poll.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openShare(poll)}
                          className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition cursor-pointer"
                          title="Share poll"
                          aria-label={`Share ${poll.title}`}
                        >
                          <Share2 size={16} />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openView(poll.id)}
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
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar size={13} />
                        {poll.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openShare(poll)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 bg-slate-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-500/10 transition cursor-pointer"
                        title="Share poll"
                        aria-label={`Share ${poll.title}`}
                      >
                        <Share2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openView(poll.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </div>
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
