import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AppIcon from '../components/ui/AppIcon'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const quickLogin = (email, password) => {
    setForm({ email, password })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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

      {/* Quick login buttons */}
      <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/30">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-primary-500" />
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">Quick Demo Login</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => quickLogin('priya.hr@skillsync.ai', 'password123')}
            className="text-xs font-medium px-3 py-2 bg-white dark:bg-dark-700 border border-primary-200 dark:border-primary-700/50 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          >
            HR Manager
          </button>
          <button
            type="button"
            onClick={() => quickLogin('rahul@example.com', 'password123')}
            className="text-xs font-medium px-3 py-2 bg-white dark:bg-dark-700 border border-primary-200 dark:border-primary-700/50 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          >
            Employee
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@company.com"
              className="input-field pl-11"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="input-field pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>Sign In <ArrowRight size={18} /></>
          )}
        </motion.button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </motion.div>
  )
}
