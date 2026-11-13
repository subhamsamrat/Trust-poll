import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  CheckCircle2,
  Clock,
  Share2,
  Copy,
  Check,
  QrCode,
  ChevronRight,
  Vote,
  AlertCircle,
  Lock,
  BarChart3,
  XCircle,
  ExternalLink,
  Trophy,
} from 'lucide-react'

export const Route = createFileRoute('/answerPoll')({
  component: AnswerPoll,
})    

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PollOption {
  optionId: string
  option: string
  voteCount: number
}

interface PollQuestion {
  questionId: string
  question: string
  options: PollOption[]
}

interface Poll {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'closed'
  responseMode: 'verified' | 'anonymous'
  isPublished: boolean
  startsAt?: string
  expiresAt: string
  totalVoters: number
  questions: PollQuestion[]
}

// ─── Mock Poll ────────────────────────────────────────────────────────────────

const MOCK_POLL: Poll = {
  id: 'ec1eede4-43dd-4fc1-b9fc-0f8dc09dc0ea',
  title: 'Programming Survey 2026',
  status: 'active',
  responseMode: 'verified',
  isPublished: true,
  expiresAt: '2026-11-10T23:59:59.000Z',
  totalVoters: 486,
  questions: [
    {
      questionId: 'q1',
      question: 'Which is your favorite LLM model?',
      options: [
        { optionId: 'o1', option: 'ChatGPT', voteCount: 210 },
        { optionId: 'o2', option: 'Gemini', voteCount: 165 },
        { optionId: 'o3', option: 'Claude', voteCount: 111 },
      ],
    },
    {
      questionId: 'q2',
      question: 'Which ORM/ODM do you use with Postgres?',
      options: [
        { optionId: 'o4', option: 'Drizzle', voteCount: 240 },
        { optionId: 'o5', option: 'Prisma', voteCount: 246 },
      ],
    },
    {
      questionId: 'q3',
      question: 'What is your primary frontend framework?',
      options: [
        { optionId: 'o6', option: 'React / Next.js', voteCount: 310 },
        { optionId: 'o7', option: 'Vue / Nuxt', voteCount: 90 },
        { optionId: 'o8', option: 'Angular', voteCount: 55 },
        { optionId: 'o9', option: 'Svelte', voteCount: 31 },
      ],
    },
  ],
}

// ─── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetISO: string) {
  const calc = useCallback(() => {
    const diff = new Date(targetISO).getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      expired: false,
    }
  }, [targetISO])

  const [time, setTime] = useState(calc)

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])

  return time
}

// ─── QR Code Component ────────────────────────────────────────────────────────

function QRCodeImage({ url, size = 180 }: { url: string; size?: number }) {
  return (
    <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        marginSize={1}
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  )
}

// ─── Countdown block ──────────────────────────────────────────────────────────

function CountdownBlock({ expiresAt }: { expiresAt: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(expiresAt)

  if (expired) {
    return (
      <div className="flex items-center gap-2 justify-center text-amber-500 text-sm font-semibold">
        <AlertCircle size={16} />
        This poll has expired
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <Clock size={15} className="text-slate-400 dark:text-zinc-500 shrink-0" />
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-zinc-200">
        {days > 0 && (
          <>
            <TimeUnit value={days} label="d" />
            <span className="text-slate-400">:</span>
          </>
        )}
        <TimeUnit value={hours} label="h" />
        <span className="text-slate-400">:</span>
        <TimeUnit value={minutes} label="m" />
        <span className="text-slate-400">:</span>
        <TimeUnit value={seconds} label="s" />
      </div>
      <span className="text-xs text-slate-400 dark:text-zinc-500">remaining</span>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="inline-flex flex-col items-center">
      <span className="tabular-nums font-bold text-slate-900 dark:text-white text-base leading-tight">
        {pad(value)}
      </span>
      <span className="text-[9px] font-normal text-slate-400 dark:text-zinc-500 uppercase tracking-wider leading-none">
        {label}
      </span>
    </span>
  )
}

// ─── Results bar ──────────────────────────────────────────────────────────────

function ResultBar({
  optId,
  count,
  total,
  chosen,
  isWinner,
}: {
  optId: string
  count: number
  total: number
  chosen: boolean
  isWinner: boolean
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${
        chosen
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
          : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40'
      }`}
    >
      <div
        className={`absolute inset-0 rounded-xl transition-all duration-1000 ease-out ${
          isWinner ? 'bg-blue-500/12' : 'bg-slate-200/60 dark:bg-zinc-700/30'
        }`}
        style={{ width: `${pct}%` }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {chosen && (
            <CheckCircle2 size={15} className="shrink-0 text-blue-600 dark:text-blue-400" />
          )}
          {isWinner && !chosen && (
            <Trophy size={14} className="shrink-0 text-amber-400" />
          )}
          {!chosen && !isWinner && (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-zinc-600 shrink-0" />
          )}
          <span className={`text-sm font-semibold truncate ${chosen ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-zinc-200'}`}>
            {optId}
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{pct}%</span>
          <span className="ml-1 text-xs text-slate-400 dark:text-zinc-500">({count})</span>
        </div>
      </div>
    </div>
  )
}

// ─── Share panel (Modal) ──────────────────────────────────────────────────────

function SharePanel({ url, show, onClose }: { url: string; show: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

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
        await navigator.share({ title: 'Vote on this poll!', url })
      } catch {
        // user cancelled
      }
    }
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div
        className="relative z-10 w-full max-w-sm rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Share2 size={16} className="text-blue-500" />
            Share this Poll
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition cursor-pointer"
            aria-label="Close"
          >
            <XCircle size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 truncate rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 text-xs text-slate-600 dark:text-zinc-300 font-mono">
            {url}
          </div>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold transition cursor-pointer"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition mb-3 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <QrCode size={15} className="text-blue-500" />
            Show QR Code
          </span>
          <ChevronRight size={14} className={`transition-transform ${showQR ? 'rotate-90' : ''}`} />
        </button>

        {showQR && (
          <div className="mb-4 py-4 px-2 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center">
            <QRCodeImage url={url} size={168} />
            <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-2.5">
              Scan with phone camera to open
            </p>
          </div>
        )}

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={shareVia}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold shadow transition cursor-pointer"
          >
            <ExternalLink size={14} />
            Share via…
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Copy URL row sub-component ───────────────────────────────────────────────

function CopyUrlRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 truncate rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3.5 py-2.5 text-xs font-mono text-slate-600 dark:text-zinc-300 text-left">
        {url}
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
      >
        {copied ? <Check size={13} className="text-white" /> : <Copy size={13} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

// ─── Main AnswerPoll component ────────────────────────────────────────────────

export default function AnswerPoll() {
  const poll: Poll = MOCK_POLL
  const pollUrl = typeof window !== 'undefined' ? window.location.href : `https://trustpoll.app/poll/${poll.id}`

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const countdown = useCountdown(poll.expiresAt)
  const allAnswered = poll.questions.every((q) => answers[q.questionId])

  const choose = (questionId: string, optionId: string) => {
    if (submitted || countdown.expired || poll.status === 'closed') return
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }
  
  useEffect(()=>{
     
  },[])
  

  const submit = async () => {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitted(true)
    setSubmitting(false)
  }

  const isExpiredOrClosed = countdown.expired || poll.status === 'closed'

  if (poll.status === 'scheduled') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 mx-auto mb-5">
            <Clock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{poll.title}</h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
            This poll hasn't started yet. It opens on{' '}
            <span className="font-semibold text-slate-700 dark:text-zinc-200">
              {new Date(poll.startsAt ?? poll.expiresAt).toLocaleString()}
            </span>
            .
          </p>
          {poll.startsAt && <CountdownBlock expiresAt={poll.startsAt} />}
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer"
          >
            <Share2 size={15} /> Share
          </button>
          <SharePanel url={pollUrl} show={showShare} onClose={() => setShowShare(false)} />
        </div>
      </div>
    )
  }

  const getTotals = (q: PollQuestion) => {
    const chosen = answers[q.questionId]
    const options = q.options.map((o) => ({
      ...o,
      voteCount: o.optionId === chosen ? o.voteCount + 1 : o.voteCount,
    }))
    const total = options.reduce((s, o) => s + o.voteCount, 0)
    const max = Math.max(...options.map((o) => o.voteCount))
    return { options, total, max }
  }

  return (
    <>
      <SharePanel url={pollUrl} show={showShare} onClose={() => setShowShare(false)} />

      <div className="min-h-screen py-10 px-4">
        <div className="w-full max-w-2xl mx-auto space-y-6">

          {/* ── Poll header card ── */}
          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    poll.status === 'active'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      poll.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {poll.status === 'active' ? 'Live' : 'Closed'}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  <Vote size={11} />
                  {poll.totalVoters.toLocaleString()} voters
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  <BarChart3 size={11} />
                  {poll.questions.length} questions
                </span>
              </div>

              {/* Share & QR button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('poll-qr-section')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      setShowShare(true)
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer"
                  title="View QR Code"
                >
                  <QrCode size={13} />
                  <span>QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {poll.title}
            </h1>

            <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 px-4 py-3">
              <CountdownBlock expiresAt={poll.expiresAt} />
            </div>
          </div>

          {/* ── Results state after submission ── */}
          {submitted ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-5 py-4">
                <CheckCircle2 size={22} className="shrink-0 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-300 text-sm">Vote submitted!</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Thank you for participating.</p>
                </div>
              </div>

              {poll.isPublished ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <BarChart3 size={16} className="text-blue-500" />
                    Live Results
                  </div>

                  {poll.questions.map((q, qIdx) => {
                    const { options, total, max } = getTotals(q)
                    const chosen = answers[q.questionId]

                    return (
                      <div
                        key={q.questionId}
                        className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-2 mb-4">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                            {qIdx + 1}
                          </span>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {q.question}
                          </p>
                        </div>
                        <div className="space-y-2.5">
                          {options.map((opt) => (
                            <ResultBar
                              key={opt.optionId}
                              optId={opt.optionId}
                              count={opt.voteCount}
                              total={total}
                              chosen={opt.optionId === chosen}
                              isWinner={opt.voteCount === max && max > 0}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-right text-xs text-slate-400 dark:text-zinc-500">
                          {total} total votes
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 mx-auto mb-4">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    Results not published yet
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                    The poll creator hasn't published the results yet. Check back later or share the poll with others.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowShare(true)}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer"
                  >
                    <Share2 size={14} />
                    Share Poll
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {isExpiredOrClosed && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <AlertCircle size={14} />
                  This poll is {poll.status === 'closed' ? 'closed' : 'expired'} — voting is no longer available.
                </div>
              )}

              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(Object.keys(answers).length / poll.questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 shrink-0 tabular-nums">
                  {Object.keys(answers).length}/{poll.questions.length} answered
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {poll.questions.map((q, qIdx) => {
                  const chosen = answers[q.questionId]
                  const answered = !!chosen

                  return (
                    <div
                      key={q.questionId}
                      className={`rounded-2xl border bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all ${
                        answered
                          ? 'border-blue-300 dark:border-blue-500/40'
                          : 'border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-4">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold mt-0.5 ${
                            answered
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {answered ? <CheckCircle2 size={13} /> : qIdx + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug flex-1">
                          {q.question}
                        </p>
                      </div>

                      <div className="space-y-2.5 pl-8">
                        {q.options.map((opt, oIdx) => {
                          const isChosen = chosen === opt.optionId
                          const disabled = isExpiredOrClosed

                          return (
                            <button
                              key={opt.optionId}
                              type="button"
                              disabled={disabled}
                              onClick={() => choose(q.questionId, opt.optionId)}
                              className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left
                                transition-all duration-150 group
                                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'}
                                ${
                                  isChosen
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
                                }
                              `}
                            >
                              <div
                                className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                                  isChosen
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-slate-300 dark:border-zinc-600 group-hover:border-blue-400'
                                }`}
                              >
                                {isChosen && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>

                              <span
                                className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold ${
                                  isChosen
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>

                              <span
                                className={`flex-1 text-sm font-medium ${
                                  isChosen ? 'text-blue-700 dark:text-blue-200' : 'text-slate-800 dark:text-zinc-200'
                                }`}
                              >
                                {opt.option}
                              </span>

                              {isChosen && <CheckCircle2 size={16} className="shrink-0 text-blue-500" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {!isExpiredOrClosed && (
                <button
                  type="button"
                  disabled={!allAnswered || submitting}
                  onClick={submit}
                  className={`
                    w-full flex items-center justify-center gap-2
                    py-3.5 rounded-2xl text-sm font-bold shadow transition-all
                    ${
                      allAnswered && !submitting
                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white cursor-pointer'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                    }
                  `}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Vote size={16} />
                      Submit Vote
                      {!allAnswered && (
                        <span className="ml-1 text-xs font-normal opacity-70">
                          ({poll.questions.length - Object.keys(answers).length} left)
                        </span>
                      )}
                      {allAnswered && <ChevronRight size={16} />}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
