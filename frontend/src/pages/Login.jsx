import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Play, X, MonitorPlay,
  ChevronLeft, ChevronRight, Search, Upload, Users, ClipboardCheck,
  Layers, CheckCircle, Star, Zap, Brain, BarChart2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AppIcon from '../components/ui/AppIcon'

// Set this to your YouTube embed URL once you record a demo
// e.g. 'https://www.youtube.com/embed/your-video-id?autoplay=1'
const DEMO_VIDEO_URL = ''

const SLIDES = [
  {
    id: 1,
    title: 'AI Resume Extraction',
    subtitle: 'Drop a PDF — Claude reads everything',
    description: 'Upload any PDF resume. Claude AI instantly extracts skills, experience, projects, certifications, and education into a structured profile.',
    gradient: 'from-violet-600 via-purple-600 to-blue-600',
    accent: '#a78bfa',
    icon: Upload,
    mockup: 'upload',
  },
  {
    id: 2,
    title: 'Semantic AI Search',
    subtitle: 'Search in plain English',
    description: 'Type "React developers with fintech experience in Pune" and get ranked candidates with match scores, skill gaps, and strengths — no keyword hunting.',
    gradient: 'from-blue-600 via-cyan-600 to-teal-500',
    accent: '#38bdf8',
    icon: Search,
    mockup: 'search',
  },
  {
    id: 3,
    title: 'Smart Team Builder',
    subtitle: 'AI assembles the perfect team',
    description: 'Describe your project requirements and Claude picks the optimal team from your talent pool, with role assignments and skill coverage analysis.',
    gradient: 'from-emerald-600 via-green-600 to-teal-600',
    accent: '#34d399',
    icon: Layers,
    mockup: 'team',
  },
  {
    id: 4,
    title: 'HR Review Queue',
    subtitle: 'Approve profiles with confidence',
    description: 'Review AI-extracted employee profiles, approve or reject with notes, and maintain a full audit trail of all hiring decisions.',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    accent: '#fb923c',
    icon: ClipboardCheck,
    mockup: 'review',
  },
  {
    id: 5,
    title: 'Live Dashboard',
    subtitle: 'Your workforce at a glance',
    description: 'Real-time charts for top skills, employee locations, growth trends, and pending reviews — everything an HR team needs in one view.',
    gradient: 'from-pink-600 via-rose-500 to-red-500',
    accent: '#f472b6',
    icon: BarChart2,
    mockup: 'dashboard',
  },
]

function UploadMockup() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 900)
    return () => clearInterval(t)
  }, [])
  const steps = [
    { label: 'Reading PDF...', pct: 25 },
    { label: 'Claude analysing resume...', pct: 55 },
    { label: 'Inferring related skills...', pct: 80 },
    { label: 'Profile saved!', pct: 100 },
  ]
  const skills = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS']
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-full max-w-xs bg-white/10 rounded-2xl p-4 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={14} className="text-white/70" />
          <span className="text-xs text-white/70 font-medium">resume_john_doe.pdf</span>
          <CheckCircle size={13} className="ml-auto text-green-400" />
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-1.5">
          <motion.div
            className="h-1.5 rounded-full bg-white"
            animate={{ width: `${steps[step].pct}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <p className="text-xs text-white/60">{steps[step].label}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: step > 1 ? 1 : 0, scale: step > 1 ? 1 : 0.8 }}
            transition={{ delay: i * 0.1 }}
            className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white font-medium border border-white/25"
          >
            {s}
          </motion.span>
        ))}
      </div>
      <p className="text-xs text-white/50">+ 8 inferred skills from AI</p>
    </div>
  )
}

function SearchMockup() {
  const results = [
    { name: 'Priya Sharma', role: 'Senior React Dev', match: 96, skills: ['React', 'TypeScript', 'Fintech'] },
    { name: 'Rahul Mehta', role: 'Full Stack Engineer', match: 88, skills: ['React', 'Node.js', 'AWS'] },
    { name: 'Sneha Iyer', role: 'Frontend Lead', match: 81, skills: ['React', 'Vue', 'GraphQL'] },
  ]
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6">
      <div className="w-full max-w-sm bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-white/25">
        <Search size={14} className="text-white/60" />
        <span className="text-xs text-white/80 font-medium">React devs with fintech experience in Pune</span>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5 border border-white/15"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {r.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white leading-tight">{r.name}</p>
              <p className="text-xs text-white/50">{r.role}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-sm font-black text-green-300">{r.match}%</p>
              <p className="text-xs text-white/40">match</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TeamMockup() {
  const members = [
    { name: 'Arjun K.', role: 'Tech Lead', icon: '👨‍💻', skills: 'React, Node.js' },
    { name: 'Sneha R.', role: 'Backend Dev', icon: '👩‍💻', skills: 'Python, AWS' },
    { name: 'Dev M.', role: 'DevOps', icon: '🛠️', skills: 'Docker, K8s' },
    { name: 'Priya S.', role: 'QA Lead', icon: '🧪', skills: 'Selenium, Jest' },
  ]
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} className="text-yellow-300" />
        <span className="text-xs font-bold text-white">AI-Recommended Team: Project Phoenix</span>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {members.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="bg-white/10 rounded-xl p-2.5 border border-white/15"
          >
            <span className="text-lg">{m.icon}</span>
            <p className="text-xs font-bold text-white leading-tight mt-1">{m.name}</p>
            <p className="text-xs text-white/50">{m.role}</p>
            <p className="text-xs text-white/40 mt-0.5">{m.skills}</p>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-white/40">100% skill coverage · 0 gaps identified</p>
    </div>
  )
}

function ReviewMockup() {
  const [decided, setDecided] = useState(null)
  useEffect(() => {
    const t = setTimeout(() => setDecided('approved'), 1800)
    return () => { clearTimeout(t); setDecided(null) }
  }, [])
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-full max-w-xs bg-white/10 rounded-2xl p-4 border border-white/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">👤</div>
          <div>
            <p className="text-sm font-bold text-white">Rohan Verma</p>
            <p className="text-xs text-white/50">Senior Engineer · Mumbai</p>
          </div>
          <AnimatePresence>
            {decided === 'approved' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                <CheckCircle size={20} className="text-green-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {['Go', 'Kubernetes', 'PostgreSQL'].map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/80 border border-white/20">{s}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <motion.button
            animate={decided === 'approved' ? { backgroundColor: 'rgba(52,211,153,0.3)', borderColor: 'rgba(52,211,153,0.6)' } : {}}
            className="flex-1 text-xs font-semibold py-2 rounded-lg border border-white/20 text-white/80 transition-colors"
          >
            {decided === 'approved' ? '✓ Approved' : 'Approve'}
          </motion.button>
          <button className="flex-1 text-xs font-semibold py-2 rounded-lg border border-white/20 text-white/80">Reject</button>
        </div>
      </div>
      <p className="text-xs text-white/40">12 profiles pending · 48 approved this week</p>
    </div>
  )
}

function DashboardMockup() {
  const bars = [65, 48, 42, 38, 30, 25]
  const labels = ['React', 'Node', 'Python', 'AWS', 'Docker', 'Go']
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-6">
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {[['124', 'Employees'], ['98', 'Approved'], ['16', 'Pending']].map(([n, l]) => (
          <div key={l} className="bg-white/10 rounded-xl p-2.5 text-center border border-white/15">
            <p className="text-xl font-black text-white">{n}</p>
            <p className="text-xs text-white/50">{l}</p>
          </div>
        ))}
      </div>
      <div className="w-full max-w-sm bg-white/10 rounded-xl p-3 border border-white/15">
        <p className="text-xs font-semibold text-white/70 mb-2 flex items-center gap-1.5">
          <Star size={11} className="text-yellow-300" /> Top Skills
        </p>
        <div className="space-y-1.5">
          {bars.map((pct, i) => (
            <div key={labels[i]} className="flex items-center gap-2">
              <span className="text-xs text-white/60 w-10 flex-shrink-0">{labels[i]}</span>
              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                <motion.div
                  className="h-1.5 rounded-full bg-white/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-white/40 w-6 flex-shrink-0">{pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MOCKUPS = {
  upload: UploadMockup,
  search: SearchMockup,
  team: TeamMockup,
  review: ReviewMockup,
  dashboard: DashboardMockup,
}

function DemoCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  const next = () => setCurrent(c => (c + 1) % SLIDES.length)
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, 4000)
    return () => clearInterval(timerRef.current)
  }, [paused, current])

  const slide = SLIDES[current]
  const Mockup = MOCKUPS[slide.mockup]
  const Icon = slide.icon

  return (
    <div
      className="w-full h-full flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className={`flex-1 bg-gradient-to-br ${slide.gradient} flex flex-col lg:flex-row overflow-hidden`}
        >
          {/* Left: info */}
          <div className="flex flex-col justify-center px-8 py-6 lg:w-2/5 lg:py-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Icon size={20} className="text-white" />
            </div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">{slide.subtitle}</p>
            <h3 className="text-xl font-black text-white mb-3 leading-tight">{slide.title}</h3>
            <p className="text-sm text-white/70 leading-relaxed">{slide.description}</p>
            {/* Progress bar */}
            <div className="mt-5 w-full bg-white/15 rounded-full h-0.5">
              <motion.div
                className="h-0.5 rounded-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: paused ? undefined : '100%' }}
                transition={{ duration: 4, ease: 'linear' }}
                key={`${slide.id}-${paused}`}
              />
            </div>
          </div>

          {/* Right: animated mockup */}
          <div className="flex-1 bg-black/10 flex items-center justify-center py-4 lg:py-0">
            <Mockup />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-800 border-t border-gray-700">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'}`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 font-medium">{slide.title}</p>

        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (email, password) => setForm({ email, password })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

      {/* Mobile brand header */}
      <div className="flex flex-col items-center mb-8 lg:hidden">
        <div className="relative flex items-center justify-center mb-4">
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.8, repeat: Infinity }}
            className="absolute w-20 h-20 rounded-2xl border border-primary-400/50" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-xl shadow-primary-500/40 ring-2 ring-primary-300/30">
            <AppIcon className="w-7 h-7" />
          </div>
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 shadow-md shadow-yellow-400/60" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Skill<span className="text-primary-500">Sync</span> <span className="text-gray-400 font-semibold text-lg">AI</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Skills Intelligence Platform</p>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Welcome back</h2>
        <p className="text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
      </div>

      {/* Quick login */}
      <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-primary-500" />
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Quick Demo Login</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => quickLogin('priya.hr@skillsync.ai', 'password123')}
            className="text-xs font-medium px-3 py-2 bg-white dark:bg-dark-700 border border-primary-200 dark:border-primary-700/50 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
            HR Manager
          </button>
          <button type="button" onClick={() => quickLogin('rahul@example.com', 'password123')}
            className="text-xs font-medium px-3 py-2 bg-white dark:bg-dark-700 border border-primary-200 dark:border-primary-700/50 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
            Employee
          </button>
        </div>
      </div>

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@company.com" className="input-field pl-11" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" className="input-field pl-11 pr-11" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
          ) : (
            <>Sign In <ArrowRight size={18} /></>
          )}
        </motion.button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">Create one</Link>
      </p>

      {/* Watch Demo button */}
      <div className="mt-6">
        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-dark-600" />
        </div>
        <motion.button
          id="watch-demo-btn"
          onClick={() => setShowDemo(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-dashed border-primary-200 dark:border-primary-800/50 bg-primary-50/50 dark:bg-primary-900/10 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
            <Play size={14} className="text-white ml-0.5" fill="white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 leading-tight">Explore Features</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Interactive tour of all platform features</p>
          </div>
          <MonitorPlay size={16} className="ml-auto text-primary-400 dark:text-primary-500" />
        </motion.button>
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
              style={{ height: 'min(90vh, 560px)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                    <Brain size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">SkillSync AI — Platform Preview</p>
                    <p className="text-xs text-gray-400">Hover to pause · click dots or arrows to navigate</p>
                  </div>
                </div>
                <button onClick={() => setShowDemo(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Carousel or real video */}
              <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 52px)' }}>
                {DEMO_VIDEO_URL ? (
                  <iframe src={DEMO_VIDEO_URL} className="w-full h-full" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="SkillSync AI Demo" />
                ) : (
                  <DemoCarousel />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
