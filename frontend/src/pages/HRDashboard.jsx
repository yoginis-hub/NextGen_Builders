import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ClipboardCheck, Zap, TrendingUp, Search, ArrowRight,
  Clock, Sparkles, X, CheckCircle, Upload, Layers,
  AlertCircle, Activity, Star, Bell, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { timeAgo, getAvatarColor, getInitials } from '../utils/helpers'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return ['Good morning', '🌅']
  if (h < 17) return ['Good afternoon', '☀️']
  if (h < 21) return ['Good evening', '🌆']
  return ['Good night', '🌙']
}

const PIE_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fb923c', '#a78bfa']

function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0)
  const [go, setGo] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGo(true), 300); return () => clearTimeout(t) }, [])
  useEffect(() => {
    if (!go || target === 0) { setVal(target); return }
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [go, target, duration])
  return val
}

const QUICK_ACTIONS = [
  { label: 'AI Search', icon: Search, to: '/hr/search', grad: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30', desc: 'Find talent by skills' },
  { label: 'Review Queue', icon: ClipboardCheck, to: '/hr/reviews', grad: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/30', desc: 'Approve profiles' },
  { label: 'Team Builder', icon: Layers, to: '/hr/team-builder', grad: 'from-violet-500 to-purple-400', shadow: 'shadow-violet-500/30', desc: 'Build project teams' },
  { label: 'Bulk Import', icon: Upload, to: '/hr/import', grad: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30', desc: 'Upload PDF resumes' },
]

const STAT_CONFIG = [
  { key: 'total',    label: 'Total Employees', icon: Users,          grad: 'from-blue-500 to-cyan-400',    lightBg: 'bg-blue-50 dark:bg-blue-900/20',    textColor: 'text-blue-500' },
  { key: 'approved', label: 'Approved',         icon: CheckCircle,    grad: 'from-emerald-500 to-teal-400', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-500' },
  { key: 'pending',  label: 'Pending Review',   icon: ClipboardCheck, grad: 'from-orange-500 to-amber-400', lightBg: 'bg-orange-50 dark:bg-orange-900/20', textColor: 'text-orange-500' },
  { key: 'rejected', label: 'Rejected',          icon: AlertCircle,    grad: 'from-pink-500 to-rose-400',   lightBg: 'bg-pink-50 dark:bg-pink-900/20',    textColor: 'text-pink-500' },
]

function StatPill({ label, value, icon: Icon, grad, lightBg, textColor, delay }) {
  const count = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 22 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="relative bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-700 cursor-default overflow-hidden"
    >
      {/* soft tinted bg blob */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${lightBg} blur-2xl opacity-60`} />

      <div className="relative flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
          <Icon size={19} className="text-white" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring', stiffness: 260 }}
          className={`text-xs font-bold px-2 py-1 rounded-lg ${lightBg} ${textColor}`}
        >
          Active
        </motion.div>
      </div>

      <div className="relative">
        <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
          {count.toLocaleString()}
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-1.5">{label}</p>
      </div>
    </motion.div>
  )
}

export default function HRDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [tipIdx, setTipIdx] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [greet, emoji] = getGreeting()

  const TIPS = [
    'Try "React developer with AWS experience in Bangalore" in AI Search',
    'Use Team Builder to auto-compose teams from your talent pool',
    'Bulk import up to 20 PDF resumes at once — Claude reads them all',
    'Click the pencil icon on any card to edit an employee profile',
  ]

  useEffect(() => {
    ;(async () => {
      try {
        const [s, p] = await Promise.all([api.get('/employees/stats'), api.get('/reviews/pending?limit=5')])
        setStats(s.data.data)
        setPending(p.data.data)
      } catch {}
      finally { setLoading(false) }
    })()
    const t = setTimeout(() => setShowTip(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!showTip) return
    const iv = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4500)
    return () => clearInterval(iv)
  }, [showTip])

  const totals = stats?.totals || {}

  const trendData = [
    { m: 'Jan', v: Math.max(1, (totals.total || 10) - 9) },
    { m: 'Feb', v: Math.max(1, (totals.total || 10) - 7) },
    { m: 'Mar', v: Math.max(1, (totals.total || 10) - 5) },
    { m: 'Apr', v: Math.max(1, (totals.total || 10) - 3) },
    { m: 'May', v: Math.max(1, (totals.total || 10) - 1) },
    { m: 'Jun', v: totals.total || 10 },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-10">

      {/* ── Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-7"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 40%, #06b6d4 100%)',
        }}
      >
        {/* decorative circles */}
        <motion.div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity }} />
        <motion.div className="absolute top-4 right-32 w-20 h-20 rounded-full bg-white/5"
          animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 3, delay: 1, repeat: Infinity, repeatDelay: 5 }}
            >
              {emoji}
            </motion.div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-0.5">HR Manager Portal</p>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {greet}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <Link
                  to={a.to}
                  className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg border border-white/20 group"
                >
                  <a.icon size={14} />
                  {a.label}
                  <ChevronRight size={12} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-white dark:bg-dark-800 animate-pulse" />
          ))
          : STAT_CONFIG.map((s, i) => (
            <StatPill
              key={s.key}
              label={s.label}
              value={totals[s.key] || 0}
              icon={s.icon}
              grad={s.grad}
              lightBg={s.lightBg}
              textColor={s.textColor}
              delay={0.05 + i * 0.07}
            />
          ))
        }
      </div>

      {/* ── AI CTA ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between gap-4"
        style={{ background: 'linear-gradient(120deg, #4f46e5, #7c3aed, #db2777)' }}
      >
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }}
          animate={{ backgroundPosition: ['0px 0px', '56px 56px'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
          >
            <Sparkles size={22} className="text-white" />
          </motion.div>
          <div>
            <p className="text-white font-black text-xl">Find the perfect match</p>
            <p className="text-white/75 text-sm">Describe what you need in plain English — Claude does the rest</p>
          </div>
        </div>
        <Link
          to="/hr/search"
          className="relative flex-shrink-0 flex items-center gap-2 bg-white text-indigo-600 font-black px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 group text-sm"
        >
          <Search size={15} /> AI Search
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Top Skills</h3>
              <p className="text-xs text-gray-400 mt-0.5">Most common across your team</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
              <Activity size={12} /> Live
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 h-3 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" />
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" style={{ width: `${60 - i * 8}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={stats?.topSkills?.slice(0, 8) || []} layout="vertical" barCategoryGap="30%">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} width={88} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#f1f5f9', fontSize: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} labelStyle={{ color: '#f1f5f9' }} itemStyle={{ color: '#f1f5f9' }}
                  cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={16}>
                  {(stats?.topSkills?.slice(0, 8) || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie + trend */}
        <div className="flex flex-col gap-5">
          {/* Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1 bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-700"
          >
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Locations</h3>
            {loading ? (
              <div className="h-32 bg-gray-100 dark:bg-dark-700 rounded-xl animate-pulse" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={stats?.locationDistribution || []} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="count" paddingAngle={4} strokeWidth={0}>
                      {(stats?.locationDistribution || []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#f1f5f9', fontSize: 11 }} labelStyle={{ color: '#f1f5f9' }} itemStyle={{ color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {(stats?.locationDistribution || []).slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{item._id}</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Area trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Growth</h3>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp size={11} /> +{Math.max(0, (totals.total || 0) - 5)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#f1f5f9', fontSize: 11 }} labelStyle={{ color: '#f1f5f9' }} itemStyle={{ color: '#f1f5f9' }} />
                <XAxis dataKey="m" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2.5} fill="url(#gr)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* ── Pending Reviews ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-700"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Pending Reviews
                <AnimatePresence>
                  {pending.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-black"
                    >
                      {pending.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Profiles awaiting approval</p>
            </div>
          </div>
          <Link to="/hr/reviews" className="flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600 px-3 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
            See all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-50 dark:bg-dark-700 rounded-xl animate-pulse" />)}
          </div>
        ) : pending.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-14">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <CheckCircle size={44} className="mx-auto mb-3 text-emerald-400" />
            </motion.div>
            <p className="font-bold text-emerald-500 text-base">All clear!</p>
            <p className="text-sm text-gray-400 mt-1">No pending reviews right now</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {pending.map((emp, i) => (
              <motion.div
                key={emp._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 dark:bg-dark-700/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md`}>
                  {getInitials(emp.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400 truncate">{emp.role || 'No role'} · {emp.location || 'No location'}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300 dark:text-gray-600 flex-shrink-0">
                  <Clock size={11} /> {timeAgo(emp.updatedAt)}
                </div>
                <Link
                  to="/hr/reviews"
                  className="flex-shrink-0 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg shadow transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                >
                  Review
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Floating tip ── */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 250, damping: 22 }}
            className="fixed bottom-6 right-6 z-50 max-w-xs w-full"
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-700 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25">
                <Bell size={15} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pro Tip</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tipIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-gray-700 dark:text-gray-300 leading-snug"
                  >
                    {TIPS[tipIdx]}
                  </motion.p>
                </AnimatePresence>
                <div className="flex gap-1 mt-2">
                  {TIPS.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === tipIdx ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-200 dark:bg-dark-600'}`} />
                  ))}
                </div>
              </div>
              <button onClick={() => setShowTip(false)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
