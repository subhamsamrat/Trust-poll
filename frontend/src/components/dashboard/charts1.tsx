import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    dataKey?: string
    color?: string
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 shadow-xl backdrop-blur-md">
        {label && (
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-2 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
            {label}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {payload.map((entry, index) => {
            const isVisitors = entry.dataKey === 'visitors'
            const isVotes = entry.dataKey === 'votes'
            const badgeColor = isVisitors
              ? '#3B82F6'
              : isVotes && entry.name === 'Votes' && payload.length > 1
              ? '#22C55E'
              : '#8B5CF6'

            return (
              <div
                key={`tooltip-${index}`}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: badgeColor }}
                  />
                  <span className="font-medium text-slate-600 dark:text-zinc-400">
                    {entry.name || entry.dataKey}:
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {typeof entry.value === 'number'
                    ? entry.value.toLocaleString()
                    : entry.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

const Charts1 = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const votingActivity = [
    { day: 'Mon', visitors: 120, votes: 80 },
    { day: 'Tue', visitors: 180, votes: 130 },
    { day: 'Wed', visitors: 160, votes: 110 },
    { day: 'Thu', visitors: 210, votes: 170 },
    { day: 'Fri', visitors: 240, votes: 190 },
    { day: 'Sat', visitors: 200, votes: 150 },
    { day: 'Sun', visitors: 260, votes: 220 },
  ]

  const topPolls = [
    {
      name: 'Favorite Programming Language',
      votes: 486,
    },
    {
      name: 'Best Frontend Framework',
      votes: 421,
    },
    {
      name: 'Remote Work Survey',
      votes: 385,
    },
    {
      name: 'AI Tools for Developers',
      votes: 332,
    },
    {
      name: 'React vs Angular',
      votes: 176,
    },
  ]

  if (!mounted) {
    return (
      <section className="mt-8 px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-[430px] rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-zinc-300 dark:border-zinc-700 animate-pulse" />
          <div className="h-[430px] rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-zinc-300 dark:border-zinc-700 animate-pulse" />
        </div>
      </section>
    )
  }

  return (
    <section className="mt-8 px-6 pb-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ================= Voting Activity ================= */}

        <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-xl border border-zinc-300 dark:border-zinc-700">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Voting Activity</h2>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Visitors vs Submitted Votes (Last 7 Days)
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 px-3 py-2">
              <BarChart3 className="text-blue-500" size={22} />
            </div>
          </div>

          <div className="h-[360px] sm:h-[340px] lg:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={votingActivity} barCategoryGap={18}>
                <defs>
                  <linearGradient
                    id="visitorsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>

                  <linearGradient
                    id="votesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="100%" stopColor="#16A34A" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.2}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    fill: 'rgba(59,130,246,0.08)',
                  }}
                />

                <Legend
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      {value}
                    </span>
                  )}
                />

                <Bar
                  dataKey="visitors"
                  name="Visitors"
                  fill="url(#visitorsGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={22}
                />

                <Bar
                  dataKey="votes"
                  name="Votes"
                  fill="url(#votesGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ================= Top Performing Polls ================= */}

        <div className="rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 shadow-xl">
          <div className="rounded-3xl p-4 md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Top Performing Polls</h2>

                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Polls with highest number of votes
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-500">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="h-[360px] sm:h-[340px] lg:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPolls}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="pollGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    strokeOpacity={0.2}
                  />

                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(value) =>
                      value.length > 16 ? value.slice(0, 16) + '...' : value
                    }
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: 'rgba(139,92,246,0.08)',
                    }}
                  />

                  <Bar
                    dataKey="votes"
                    name="Votes"
                    fill="url(#pollGradient)"
                    radius={[0, 10, 10, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Charts1
