import { createFileRoute } from '@tanstack/react-router'
import {
  BarChart3,
  Vote,
  Users,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import Charts1 from '#/components/dashboard/charts1'
import Lastsection from "#/components/dashboard/lastsection.tsx"
import {useCurrentUser} from "#/lib/currentUser.ts"
import React, { useEffect, useState } from 'react'
import {socket}from '#/socket/socket'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

 type LiveData= {
      success: Boolean
      totalPolls: Number
      activePolls: Number
      publishedPolls: Number
      totalVoters: Number
      topPerformingPolls:[]
      last5Polls: Array<{ id: string; title: string; visitors: number; voters: number }>
    }

    
function RouteComponent() {
  const { data: user } = useCurrentUser()
 // const navigate = useNavigate()

  // Socket connection state on Dashboard
  // const [socketId, setSocketId] = useState<string | undefined>(socket.id)
  // const [isConnected, setIsConnected] = useState<boolean>(socket.connected)
     const [liveData,setLiveData]=useState<LiveData>({ success: true,
      totalPolls: 0,
      activePolls: 0,
      publishedPolls: 0,
      totalVoters: 0,
     topPerformingPolls:[],
     last5Polls:[]});
  // 1. Auth Guard: Redirect unauthenticated visitors to login
 useEffect(() => {
  if (!socket.connected) {
    socket.connect()
  }

  const handleDashboard = (res: any) => {
    console.log("dashboard live update=", res)
    setLiveData(res)
  }
  socket.on("dashboard", handleDashboard)
  socket.emit("dashboard", {
    userId: user?.user.id,
  })

  return () => {
    socket.off("dashboard", handleDashboard)
  }
}, [user])


  return (
    <div>
      {/* Live Socket Status Indicator */}
      {/* <div className="px-4 sm:px-6 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'
            }`}
          />
          <span>{isConnected ? `Live Socket Connected (${socketId})` : 'Connecting live updates...'}</span>
        </div>
      </div> */}

      {/* header statistics section */}
      <section className="mt-4 sm:mt-6 px-4 sm:px-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Polls */}
          <div className="group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
                <Vote size={24} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
                <TrendingUp size={14} />
                +12%
              </span>
            </div>
            <div className="mt-5 sm:mt-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Polls</p>
              <h2 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{liveData.totalPolls.toString()}</h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400">+4 created this week</p>
            </div>
          </div>

          {/* Active Polls */}
          <div className="group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-green-500">
                <BarChart3 size={24} />
              </div>
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
                LIVE
              </span>
            </div>
            <div className="mt-5 sm:mt-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Polls</p>
              <h2 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{liveData.activePolls.toString()}</h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400">Currently accepting votes</p>
            </div>
          </div>

          {/* Total Voters */}
          <div className="group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
                <Users size={24} />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-500">
                <TrendingUp size={14} />
                +18
              </span>
            </div>
            <div className="mt-5 sm:mt-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Voters</p>
              <h2 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{liveData.totalVoters.toString()}</h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400">Votes received today</p>
            </div>
          </div>

          {/* Published */}
          <div className="group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-xs font-semibold text-zinc-500">75%</span>
            </div>
            <div className="mt-5 sm:mt-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Published Polls</p>
              <h2 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{liveData.publishedPolls.toString()}</h2>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div className="h-full w-3/4 rounded-full bg-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* chart / graph */}
      <section>
        <Charts1 topPolls={liveData.topPerformingPolls} last5Polls={liveData.last5Polls}  />
      </section>

      {/* all polls section - fully responsive */}
      <section className="mt-6 sm:mt-8 px-4 sm:px-6 pb-12 sm:pb-16">
       <Lastsection/>
      </section>
    </div>
  )
}
