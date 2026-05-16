import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'
import AppIcon from '../components/ui/AppIcon'

const FEATURES = [
  { icon: '🧠', title: 'Smart Extraction', text: 'AI reads resumes and maps every skill automatically' },
  { icon: '🔍', title: 'Semantic Search', text: 'Find talent using plain language, not keywords' },
  { icon: '🎯', title: 'Team Builder', text: 'AI recommends the perfect team for any project' },
]

const TAGS = ['React', 'Node.js', 'Python', 'AWS', 'ML', 'DevOps', 'TypeScript', 'Figma']

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-primary-50/20 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800 flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-primary-600 to-blue-600" />

        {/* Mesh grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Ambient blobs */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute -top-10 -left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 8, repeat: Infinity, delay: 1.5 }}
          className="absolute -bottom-20 -right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-400 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-14 py-12 text-white">

          {/* ── Logo mark ── */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
            className="relative flex items-center justify-center mb-10">

            {/* Outermost pulse ring */}
            <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 3, repeat: Infinity }}
              className="absolute w-44 h-44 rounded-full border border-white/40" />
            {/* Middle ring */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.1, 0.35] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
              className="absolute w-36 h-36 rounded-full border border-white/50" />
            {/* Inner ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute w-28 h-28 rounded-full border border-dashed border-white/30" />

            {/* Glow backdrop */}
            <div className="absolute w-24 h-24 rounded-3xl bg-white/25 blur-xl" />

            {/* Icon box */}
            <div className="relative w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/40 shadow-2xl">
              <AppIcon className="w-12 h-12" />
              {/* Corner sparkles */}
              <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0 }}
                className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/60" />
              <motion.div animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, delay: 1.1 }}
                className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rounded-full bg-blue-200 shadow-lg shadow-blue-200/60" />
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
            className="text-center mb-3">
            <h1 className="text-5xl font-black tracking-tight leading-none mb-1">
              Skill<span className="text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]">Sync</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-2xl font-bold text-white/70 tracking-widest uppercase">AI</span>
              <span className="h-px w-8 bg-white/30" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Platform</span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-white/65 text-sm font-medium mb-10 text-center max-w-xs leading-relaxed">
            Discover, match, and build teams with AI‑powered skills intelligence
          </motion.p>

          {/* Feature cards */}
          <div className="space-y-3 w-full max-w-sm mb-10">
            {FEATURES.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3.5 border border-white/15 hover:bg-white/15 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-base shadow-inner">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight">{item.title}</p>
                  <p className="text-xs text-white/60 mt-0.5 leading-snug">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating skill tags */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 max-w-xs mb-8">
            {TAGS.map((tag, i) => (
              <motion.span key={tag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.07 }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white/70 border border-white/15 backdrop-blur-sm">
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* Watch Demo button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <a
              href="/login#demo"
              onClick={e => {
                e.preventDefault()
                document.getElementById('watch-demo-btn')?.click()
              }}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all group cursor-pointer"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0"
              >
                <Play size={14} className="text-primary-600 ml-0.5" fill="currentColor" />
              </motion.div>
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight group-hover:text-yellow-300 transition-colors">Explore Features</p>
                <p className="text-xs text-white/55">Interactive tour of the platform</p>
              </div>
            </a>
          </motion.div>

        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

    </div>
  )
}
