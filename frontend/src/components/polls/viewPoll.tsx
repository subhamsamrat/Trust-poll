import { useEffect, useState } from 'react'
import {
  X,
  ClipboardList,
  ShieldCheck,
  User,
  Calendar,
  Clock,
  Hash,
  BarChart3,
  Users,
  CheckCircle2,
  Eye,
  Pencil,
  Save,
  XCircle,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Vote,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PollOption {
  id: string
  text: string
  voteCount: number
}

export interface PollQuestion {
  id: string
  question: string
  options: PollOption[]
}

export interface PollDetail {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  isActive: boolean
  isPublished: boolean
  createdAt: string
  startsAt?: string
  expiresAt: string
  creatorId: string
  totalVisitors: number   // people who opened the poll
  totalVoters: number     // people who submitted
  questions: PollQuestion[]
}

interface ViewPollProps {
  isOpen: boolean
  onClose: () => void
  poll: PollDetail | null
}

// ─── Mock-data helper (replace with real API call) ─────────────────────────────
// The parent passes a full PollDetail. We only need it here for the edit save.

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const StatusBadge = ({ status }: { status: PollDetail['status'] }) => {
  const map = {
    active:    'bg-green-500/10 text-green-600 dark:text-green-400',
    scheduled: 'bg-zinc-500/10  text-zinc-600  dark:text-zinc-400',
    closed:    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  const dot = {
    active:    'bg-green-500 animate-pulse',
    scheduled: 'bg-zinc-400',
    closed:    'bg-amber-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

const Stat = ({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 p-4">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Option bar (answers view) ────────────────────────────────────────────────

const OptionBar = ({ text, count, total }: { text: string; count: number; total: number }) => {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[70%]">{text}</span>
        <span className="tabular-nums text-xs font-semibold text-slate-600 dark:text-zinc-300">
          {count} <span className="text-slate-400 dark:text-zinc-500">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'questions' | 'answers'

const ViewPoll = ({ isOpen, onClose, poll }: ViewPollProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // --- Edit state (only for scheduled polls) ---
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null)
  const [localQuestions, setLocalQuestions] = useState<PollQuestion[]>([])

  // Sync local copy whenever the poll changes
  useEffect(() => {
    if (poll) setLocalQuestions(JSON.parse(JSON.stringify(poll.questions)))
  }, [poll])

  // Keyboard close + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !poll) return null

  const canEdit = poll.status === 'scheduled'
  const submissionRate =
    poll.totalVisitors === 0
      ? 0
      : Math.round((poll.totalVoters / poll.totalVisitors) * 100)

  const totalVotesAcrossAll = localQuestions.reduce(
    (acc, q) => acc + q.options.reduce((s, o) => s + o.voteCount, 0),
    0,
  )

  // ── Edit helpers ──────────────────────────────────────────────────────────

  const updateOptionText = (qIdx: number, oIdx: number, val: string) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx].options[oIdx].text = val
      return copy
    })
  }

  const addOption = (qIdx: number) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx].options.push({ id: `new-${Date.now()}`, text: '', voteCount: 0 })
      return copy
    })
  }

  const removeOption = (qIdx: number, oIdx: number) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      if (copy[qIdx].options.length <= 2) return copy // min 2
      copy[qIdx].options.splice(oIdx, 1)
      return copy
    })
  }

  const saveQuestion = (qIdx: number) => {
    // TODO: call your PATCH /poll/:id/questions API here with localQuestions[qIdx]
    console.log('Saving question:', localQuestions[qIdx])
    setEditingQIdx(null)
  }

  const cancelEdit = (qIdx: number) => {
    // restore original
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx] = JSON.parse(JSON.stringify(poll.questions[qIdx]))
      return copy
    })
    setEditingQIdx(null)
  }

  // ── Tab content ────────────────────────────────────────────────────────────

  const OverviewTab = () => (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<Eye size={16} />}
          label="Visitors"
          value={poll.totalVisitors.toLocaleString()}
          sub="Opened the poll"
          color="bg-blue-500/10 text-blue-500"
        />
        <Stat
          icon={<Vote size={16} />}
          label="Votes cast"
          value={poll.totalVoters.toLocaleString()}
          sub="Submitted"
          color="bg-green-500/10 text-green-500"
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label="Submit rate"
          value={`${submissionRate}%`}
          sub={`${poll.totalVisitors - poll.totalVoters} dropped off`}
          color="bg-purple-500/10 text-purple-500"
        />
        <Stat
          icon={<BarChart3 size={16} />}
          label="Questions"
          value={poll.questions.length}
          sub={`${poll.questions.reduce((a, q) => a + q.options.length, 0)} options total`}
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {[
          {
            icon: <Hash size={14} />,
            label: 'Poll ID',
            value: <span className="font-mono text-xs break-all">{poll.id}</span>,
          },
          {
            icon: <Users size={14} />,
            label: 'Creator ID',
            value: <span className="font-mono text-xs break-all">{poll.creatorId}</span>,
          },
          {
            icon: poll.responseMode === 'verified'
              ? <ShieldCheck size={14} className="text-blue-500" />
              : <User size={14} />,
            label: 'Response Mode',
            value: <span className="capitalize">{poll.responseMode}</span>,
          },
          {
            icon: <CheckCircle2 size={14} />,
            label: 'Published',
            value: poll.isPublished
              ? <span className="text-green-600 dark:text-green-400 font-semibold">Yes</span>
              : <span className="text-slate-400">No</span>,
          },
          {
            icon: <Calendar size={14} />,
            label: 'Created',
            value: fmtDate(poll.createdAt),
          },
          {
            icon: <Clock size={14} />,
            label: 'Expires',
            value: fmtDate(poll.expiresAt),
          },
          ...(poll.startsAt
            ? [{
                icon: <Clock size={14} />,
                label: 'Starts',
                value: fmtDate(poll.startsAt),
              }]
            : []),
        ].map(({ icon, label, value }, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-4 py-3"
          >
            <span className="mt-0.5 text-slate-400 dark:text-zinc-500 shrink-0">{icon}</span>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-0.5">{label}</p>
              <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const QuestionsTab = () => (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-300">
          <Pencil size={13} />
          This poll is <strong>scheduled</strong>. You can edit options before it goes live.
        </div>
      )}

      {localQuestions.map((q, qIdx) => {
        const isEditing = editingQIdx === qIdx

        return (
          <div
            key={q.id}
            className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-4"
          >
            {/* Question header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {qIdx + 1}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {q.question}
                </p>
              </div>
              {canEdit && !isEditing && (
                <button
                  type="button"
                  onClick={() => setEditingQIdx(qIdx)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                >
                  <Pencil size={12} />
                  Edit options
                </button>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 pl-8">
              {localQuestions[qIdx].options.map((opt, oIdx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                    {String.fromCharCode(65 + oIdx)}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-slate-700 dark:text-zinc-300">{opt.text}</span>
                  )}

                  {isEditing && localQuestions[qIdx].options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIdx, oIdx)}
                      className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add option (editing mode, max 10) */}
              {isEditing && localQuestions[qIdx].options.length < 10 && (
                <button
                  type="button"
                  onClick={() => addOption(qIdx)}
                  className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus size={13} /> Add option
                </button>
              )}
            </div>

            {/* Edit action row */}
            {isEditing && (
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => cancelEdit(qIdx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                >
                  <XCircle size={13} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveQuestion(qIdx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                >
                  <Save size={13} /> Save changes
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const AnswersTab = () => (
    <div className="space-y-5">
      {/* Participation summary bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
            <Users size={15} className="text-blue-500" /> Participation
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {poll.totalVoters} / {poll.totalVisitors} submitted
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
            style={{ width: `${submissionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500">
          <span>{submissionRate}% conversion</span>
          <span>{poll.totalVisitors - poll.totalVoters} dropped off</span>
        </div>
      </div>

      {poll.status === 'scheduled' ? (
        <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
          <BarChart3 size={32} className="mx-auto mb-3 opacity-40" />
          Results will appear once the poll goes live.
        </div>
      ) : (
        localQuestions.map((q, qIdx) => {
          const qTotal = q.options.reduce((s, o) => s + o.voteCount, 0)
          const topCount = Math.max(...q.options.map((o) => o.voteCount))

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4"
            >
              <div className="flex items-start gap-2 mb-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {qIdx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    {qTotal} total votes
                  </p>
                </div>
              </div>

              <div className="space-y-3 pl-8">
                {q.options.map((opt) => (
                  <div key={opt.id} className="relative">
                    <OptionBar text={opt.text} count={opt.voteCount} total={qTotal} />
                    {opt.voteCount === topCount && topCount > 0 && (
                      <span className="absolute -left-6 top-0.5 text-amber-400 text-[10px]">★</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Total across all questions */}
      {poll.status !== 'scheduled' && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-4 py-3 text-sm">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">Total votes across all questions</span>
          <span className="font-bold text-slate-900 dark:text-white">{totalVotesAcrossAll.toLocaleString()}</span>
        </div>
      )}
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',   label: 'Overview',   icon: <ClipboardList size={14} /> },
    { key: 'questions',  label: 'Questions',  icon: <ChevronRight size={14} />  },
    { key: 'answers',    label: 'Answers',    icon: <BarChart3 size={14} />     },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Panel */}
      <div
        className="
          relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col
          rounded-3xl border border-slate-200/60 dark:border-white/10
          bg-white/85 dark:bg-zinc-900/85
          backdrop-blur-xl shadow-2xl overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {poll.title}
                </h2>
                <div className="mt-1.5 flex items-center flex-wrap gap-2">
                  <StatusBadge status={poll.status} />
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    #{poll.id.slice(0, 8)}…
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer
                  ${activeTab === t.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'}
                `}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'overview'  && <OverviewTab />}
          {activeTab === 'questions' && <QuestionsTab />}
          {activeTab === 'answers'   && <AnswersTab />}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewPoll
