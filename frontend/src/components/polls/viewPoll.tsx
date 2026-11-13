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
import { pollDetailsApi, useUpdatePoll } from '#/hooks/dashboard.hook'
import { toast } from '@heroui/react'
import {socket} from "#/socket/socket.ts"
import { useCurrentUser } from '#/lib/currentUser'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PollOption {
  Oid: string
  option: string
  voteCount?: number
  text?: string
}

export interface PollQuestion {
  Qid: string
  question: string
  options: PollOption[]
}

export interface PollDetail {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  isActive: boolean
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

export interface LivePollOption {
  optionId: string
  option: string
  voteCount: number | null
  percentage: number | null
}

export interface LivePollQuestion {
  questionId: string
  question: string
  totalVotes: number | null
  options: LivePollOption[]
}

export interface LivePollResponse {
  pollId: string
  title: string
  isPublished: boolean
  canViewResults: boolean
  message: string
  totalVoters: number | null
  startsAt:string
  totalVisitors?: number | null
  questions: LivePollQuestion[]
}

export type PollResponse = LivePollResponse

export interface DashboardPollStats {
  id: string
  title?: string
  visitors: number
  voters: number
}

export interface DashboardSocketData {
  success: boolean
  totalPolls: number
  activePolls: number
  publishedPolls: number
  totalVoters: number
  topPerformingPolls: Array<{
    id: string
    title: string
    totalUniqueVoters: number
  }>
  last5Polls: Array<DashboardPollStats>
  allPollsStats?: Array<DashboardPollStats>
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',timeZone: 'UTC'
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
  icon,
  label,
  value,
  sub,
  color,
  isLive,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
  isLive?: boolean
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 p-4">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{label}</p>
        {isLive && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live update" />
        )}
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
)

// ─── Option bar (answers view) ────────────────────────────────────────────────

const OptionBar = ({
  text,
  count,
  total,
  percentage,
}: {
  text: string
  count: number
  total: number
  percentage?: number | null
}) => {
  const pct =
    percentage !== undefined && percentage !== null
      ? Math.round(percentage)
      : total === 0
      ? 0
      : Math.round((count / total) * 100)
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
  const [editingBackup, setEditingBackup] = useState<PollQuestion | null>(null)
  const [liveData, setLiveData] = useState<LivePollResponse | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardSocketData | null>(null)
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false)

  const updatePollMutation = useUpdatePoll()
  const { data: user } = useCurrentUser()
  const { data } = pollDetailsApi(poll?.id ?? '', {
    enabled: !!poll?.id && isOpen,
  })

  // Sync questions when detail data arrives
  useEffect(() => {
    if (data?.questions) {
      setLocalQuestions(JSON.parse(JSON.stringify(data.questions)))
    }
  }, [data])

  // Reset edit state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEditingQIdx(null)
      setEditingBackup(null)
      setActiveTab('overview')
      setLiveData(null)
      setDashboardData(null)
      setIsLiveLoading(false)
    }
  }, [isOpen])

  // Live data over websocket
  useEffect(() => {
    if (!isOpen || !poll?.id) return

    if (!socket.connected) {
      socket.connect()
    }

    setIsLiveLoading(true)

    const userId = user?.user?.id

    const requestResults = () => {
      socket.emit('get_poll_results', {
        pollId: poll.id,
        user: userId,
      })
    }

    requestResults()

    const handleLiveResults = (res: LivePollResponse) => {
      console.log('Live poll data received:', res)
      if (res && (!res.pollId || res.pollId === poll.id)) {
        setLiveData(res)
        setIsLiveLoading(false)
      }
    }

    // const handleVoteCountUpdate = (payload: {
    //   pollId: string
    //   totalVoters: number
    //   totalVisitors?: number
    // }) => {
    //   if (payload && payload.pollId === poll.id) {
    //     setLiveData((prev) =>
    //       prev
    //         ? {
    //             ...prev,
    //             totalVoters: payload.totalVoters,
    //             ...(payload.totalVisitors !== undefined
    //               ? { totalVisitors: payload.totalVisitors }
    //               : {}),
    //           }
    //         : prev
    //     )
    //   }
    // }

    // const handleDashboard = (res: DashboardSocketData) => {
    //   console.log('Dashboard live data in viewPoll:', res)
    //   if (res && res.success) {
    //     setDashboardData(res)
    //   }
    // }

    socket.on('poll_results', handleLiveResults)
    //socket.on('poll_results_data', handleLiveResults)

    return () => {
      socket.off('poll_results', handleLiveResults)
      //socket.off('poll_results_data', handleLiveResults)
      socket.emit('leave_poll', { pollId: poll.id })
    }
  }, [isOpen, poll?.id, poll?.creatorId, user?.user?.id])

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

  if (!isOpen || !poll || !poll.id) return null

  const isScheduled =
    poll.status === 'scheduled' ||
    (Boolean(data?.poll?.startsAt) && new Date(data.poll.startsAt) > new Date())
  const canEdit = isScheduled

  // Match current poll against live dashboard data
  // const dashboardPoll =
  //   dashboardData?.allPollsStats?.find((p) => p.id === poll.id) ||
  //   dashboardData?.last5Polls?.find((p) => p.id === poll.id)

  const totalVoters = liveData?.totalVoters !== null && liveData?.totalVoters !== undefined? liveData.totalVoters:0;

  const Visitors =
    liveData?.totalVisitors !== null && liveData?.totalVisitors !== undefined
      ? liveData.totalVisitors:0


  const liveVisitors = Math.max(Visitors, totalVoters)

  const SubmissionRate = Visitors === 0? 0
      : Math.min(100, Math.round((totalVoters / liveVisitors) * 100))

  const droppedOff = Math.max(0, liveVisitors - totalVoters)

  const liveQuestionsCount = liveData?.questions?.length ?? localQuestions.length

  const liveOptionsCount =
    liveData?.questions
      ? liveData.questions.reduce((a, q) => a + q.options.length, 0)
      : localQuestions.reduce((a, q) => a + q.options.length, 0)

  // ── Edit helpers ──────────────────────────────────────────────────────────

  const startEditing = (qIdx: number) => {
    if (editingQIdx !== null && editingQIdx !== qIdx) {
      toast.warning('Please save or cancel the currently edited question first')
      return
    }
    setEditingBackup(JSON.parse(JSON.stringify(localQuestions[qIdx])))
    setEditingQIdx(qIdx)
  }

  const updateQuestionText = (qIdx: number, val: string) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx].question = val
      return copy
    })
  }

  const updateOptionText = (qIdx: number, oIdx: number, val: string) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx].options[oIdx].option = val
      copy[qIdx].options[oIdx].text = val
      return copy
    })
  }

  const addOption = (qIdx: number) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      copy[qIdx].options.push({
        Oid: `new-opt-${Date.now()}-${copy[qIdx].options.length}`,
        option: '',
        text: '',
        voteCount: 0,
      })
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

  const addQuestion = () => {
    if (editingQIdx !== null) {
      toast.warning('Please save or cancel the currently edited question first')
      return
    }
    const newQuestion: PollQuestion = {
      Qid: `new-q-${Date.now()}`,
      question: '',
      options: [
        { Oid: `new-opt-1-${Date.now()}`, option: '', voteCount: 0 },
        { Oid: `new-opt-2-${Date.now()}`, option: '', voteCount: 0 },
      ],
    }
    setEditingBackup(null)
    const nextList = [...localQuestions, newQuestion]
    setLocalQuestions(nextList)
    setEditingQIdx(nextList.length - 1)
  }

  const deleteQuestion = (qIdx: number) => {
    if (localQuestions.length <= 1) {
      toast.warning('Poll must have at least one question')
      return
    }

    const target = localQuestions[qIdx]
    const updated = localQuestions.filter((_, idx) => idx !== qIdx)

    // If it's a new unsaved question (not on server), remove locally
    if (
      target.Qid.startsWith('new-') &&
      !data?.questions?.some((q: any) => q.Qid === target.Qid)
    ) {
      setLocalQuestions(updated)
      setEditingQIdx(null)
      setEditingBackup(null)
      return
    }

    // Call API to delete question from poll
    const payloadQuestions = updated.map((q) => ({
      Qid: q.Qid,
      question: q.question.trim(),
      options: q.options.map((o) => ({
        Oid: o.Oid,
        option: o.option.trim(),
      })),
    }))

    updatePollMutation.mutate(
      {
        pollId: poll.id,
        data: {
          questions: payloadQuestions,
        },
      },
      {
        onSuccess: (resData: any) => {
          toast.success('Question deleted successfully')
          setEditingQIdx(null)
          setEditingBackup(null)
          if (resData?.questions) {
            setLocalQuestions(JSON.parse(JSON.stringify(resData.questions)))
          } else {
            setLocalQuestions(updated)
          }
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || 'Failed to delete question'
          toast.danger(errMsg)
        },
      }
    )
  }

  const cancelEdit = (qIdx: number) => {
    setLocalQuestions((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as PollQuestion[]
      if (editingBackup) {
        copy[qIdx] = editingBackup
      } else if (data?.questions?.[qIdx]) {
        copy[qIdx] = JSON.parse(JSON.stringify(data.questions[qIdx]))
      } else {
        // It was a newly added unsaved question, drop it
        copy.splice(qIdx, 1)
      }
      return copy
    })
    setEditingBackup(null)
    setEditingQIdx(null)
  }

  const saveQuestion = (qIdx: number) => {
    const currentQ = localQuestions[qIdx]
    if (!currentQ.question.trim()) {
      toast.warning('Question title cannot be empty')
      return
    }
    if (currentQ.options.length < 2) {
      toast.warning('At least two options are required')
      return
    }
    for (let i = 0; i < currentQ.options.length; i++) {
      if (!currentQ.options[i].option.trim()) {
        toast.warning(`Option ${String.fromCharCode(65 + i)} cannot be empty`)
        return
      }
    }

    const payloadQuestions = localQuestions.map((q) => ({
      Qid: q.Qid,
      question: q.question.trim(),
      options: q.options.map((o) => ({
        Oid: o.Oid,
        option: o.option.trim(),
      })),
    }))

    updatePollMutation.mutate(
      {
        pollId: poll.id,
        data: {
          questions: payloadQuestions,
        },
      },
      {
        onSuccess: (resData: any) => {
          toast.success('Question saved successfully')
          setEditingQIdx(null)
          setEditingBackup(null)
          if (resData?.questions) {
            setLocalQuestions(JSON.parse(JSON.stringify(resData.questions)))
          }
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || 'Failed to save question'
          toast.danger(errMsg)
        },
      }
    )
  }

  // ── Tab content ────────────────────────────────────────────────────────────

  const OverviewTab = () => (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<Eye size={16} />}
          label="Visitors"
          value={liveVisitors.toLocaleString()}
          sub="Opened the poll"
          color="bg-blue-500/10 text-blue-500"
          isLive={Boolean(liveData || dashboardData)}
        />
        <Stat
          icon={<Vote size={16} />}
          label="Voters"
          value={totalVoters.toLocaleString()}
          sub="Submitted"
          color="bg-green-500/10 text-green-500"
          isLive={Boolean(liveData || dashboardData)}
        />
        <Stat
          icon={<TrendingUp size={16} />}
          label="Submit rate"
          value={`${SubmissionRate}%`}
          sub={`${droppedOff} dropped off`}
          color="bg-purple-500/10 text-purple-500"
          isLive={Boolean(liveData || dashboardData)}
        />
        <Stat
          icon={<BarChart3 size={16} />}
          label="Questions"
          value={liveQuestionsCount}
          sub={`${liveOptionsCount} options total`}
          color="bg-orange-500/10 text-orange-500"
          isLive={Boolean(liveData?.questions?.length)}
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
            value: (liveData?.isPublished ?? data?.poll?.isPublished)
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
      {/* edit message banner */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Pencil size={13} className="shrink-0" />
            <span>
              This poll is <strong>scheduled</strong>. You can edit questions and options before it goes live.
            </span>
          </div>
          {editingQIdx === null && (
            <button
              type="button"
              onClick={addQuestion}
              disabled={updatePollMutation.isPending}
              className="shrink-0 self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Plus size={13} /> Add question
            </button>
          )}
        </div>
      )}

      {localQuestions.map((q, qIdx) => {
        const isEditing = editingQIdx === qIdx

        return (
          <div
            key={q.Qid || qIdx}
            className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-4 transition-colors"
          >
            {/* Question header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2 flex-1">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {qIdx + 1}
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question title..."
                    className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {q.question || <span className="text-slate-400 italic">Untitled question</span>}
                  </p>
                )}
              </div>
              {canEdit && !isEditing && editingQIdx === null && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditing(qIdx)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  {localQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteQuestion(qIdx)}
                      disabled={updatePollMutation.isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 pl-8">
              {q.options.map((opt, oIdx) => (
                <div key={opt.Oid || oIdx} className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                    {String.fromCharCode(65 + oIdx)}
                  </span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={opt.option}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-slate-700 dark:text-zinc-300">
                      {opt.option || opt.text || <span className="text-slate-400 italic">Empty option</span>}
                    </span>
                  )}

                  {isEditing && localQuestions[qIdx].options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIdx, oIdx)}
                      className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                      title="Remove option"
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
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-zinc-700">
                <div>
                  {localQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteQuestion(qIdx)}
                      disabled={updatePollMutation.isPending}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete question
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cancelEdit(qIdx)}
                    disabled={updatePollMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300 transition cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveQuestion(qIdx)}
                    disabled={updatePollMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {updatePollMutation.isPending ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Save size={13} /> Save changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add another question button at bottom */}
      {canEdit && editingQIdx === null && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500 text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-semibold transition cursor-pointer"
        >
          <Plus size={16} /> Add another question
        </button>
      )}
    </div>
  )

  const AnswersTab = () => {
    // Only show live data in AnswerTab section
    const liveQuestions = liveData?.questions || []
    const liveTotalVotesAcrossAll = liveQuestions.reduce((acc, q) => {
      const qVotes =
        q.totalVotes !== null && q.totalVotes !== undefined
          ? q.totalVotes
          : q.options.reduce((s, o) => s + (o.voteCount || 0), 0)
      return acc + qVotes
    }, 0)

    return (
      <div className="space-y-5">
        {/* Participation summary bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <Users size={15} className="text-blue-500" /> Participation
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {totalVoters} {liveVisitors > 0 ? `/ ${liveVisitors} submitted` : 'voters'}
            </span>
          </div>
          {liveVisitors > 0 && (
            <>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700"
                  style={{ width: `${SubmissionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                <span>{SubmissionRate}% conversion</span>
                <span>{droppedOff} dropped off</span>
              </div>
            </>
          )}
        </div>

        {poll.status === 'scheduled' ? (
          <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-40" />
            Results will appear once the poll goes live.
          </div>
        ) : isLiveLoading && !liveData ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-sm gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p>Loading live poll results...</p>
          </div>
        ) : liveData && !liveData.canViewResults ? (
          <div className="py-10 text-center text-slate-500 dark:text-zinc-400 text-sm space-y-2">
            <BarChart3 size={32} className="mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="font-semibold text-slate-700 dark:text-zinc-200">
              {liveData.message || 'Results are not available'}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Results have not been published by the host yet.
            </p>
          </div>
        ) : liveQuestions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-40" />
            No question data available yet.
          </div>
        ) : (
          liveQuestions.map((q, qIdx) => {
            const qTotal =
              q.totalVotes !== null && q.totalVotes !== undefined
                ? q.totalVotes
                : q.options.reduce((s, o) => s + (o.voteCount || 0), 0)
            const topCount = Math.max(...q.options.map((o) => o.voteCount || 0))

            return (
              <div
                key={q.questionId || qIdx}
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
                  {q.options.map((opt, oIdx) => (
                    <div key={opt.optionId || oIdx} className="relative">
                      <OptionBar
                        text={opt.option || ''}
                        count={opt.voteCount || 0}
                        total={qTotal}
                        percentage={opt.percentage}
                      />
                      {(opt.voteCount || 0) === topCount && topCount > 0 && (
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
        {poll.status !== 'scheduled' && liveQuestions.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-4 py-3 text-sm">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">Total votes across all questions</span>
            <span className="font-bold text-slate-900 dark:text-white">{liveTotalVotesAcrossAll.toLocaleString()}</span>
          </div>
        )}
      </div>
    )
  }

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
                  {data?.poll?.title || poll.title}
                </h2>
                <div className="mt-1.5 flex items-center flex-wrap gap-2">
                  <StatusBadge status={canEdit ? 'scheduled' : poll.status} />
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
