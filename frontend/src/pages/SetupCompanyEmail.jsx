import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DOMAIN = '@skillsync.ai'

export default function SetupCompanyEmail() {
  const { user, updateUser, needsCompanyEmail } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Already set — redirect
  if (!needsCompanyEmail) {
    navigate('/employee/dashboard', { replace: true })
    return null
  }

  const companyEmail = username.trim().toLowerCase() + DOMAIN

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) { toast.error('Please enter your company username'); return }
    if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      toast.error('Username can only contain letters, numbers, dots, underscores, and hyphens')
      return
    }
    setLoading(true)
    try {
      await api.patch('/auth/company-email', { companyEmail })
      updateUser({ companyEmail })
      setDone(true)
      toast.success('Company email set successfully!')
      setTimeout(() => navigate('/employee/dashboard', { replace: true }), 1800)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to set company email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Building2 size={30} className="text-white" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Almost there!</h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          You signed in with <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.email}</span>
          <br />Please set your <span className="font-semibold text-primary-500">company email</span> to continue.
        </p>
      </div>

      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">Company email set!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{companyEmail}</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to dashboard...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Split input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Email
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-dark-600 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all bg-white dark:bg-dark-800">
              <div className="flex items-center pl-3.5 text-gray-400">
                <Mail size={17} />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, '').replace(/@.*/g, ''))}
                placeholder="yourname"
                className="flex-1 px-3 py-3 text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
                autoFocus
                autoComplete="off"
              />
              <div className="flex items-center pr-4 text-sm font-semibold text-primary-500 bg-primary-50 dark:bg-primary-900/20 border-l border-gray-200 dark:border-dark-600 px-3 select-none whitespace-nowrap">
                {DOMAIN}
              </div>
            </div>
            {username.trim() && (
              <p className="mt-1.5 text-xs text-gray-400">
                Your company email will be: <span className="font-semibold text-gray-600 dark:text-gray-300">{companyEmail}</span>
              </p>
            )}
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              After setting your company email, you can log in using <strong>{DOMAIN.slice(1)}</strong> email next time instead of your personal email.
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !username.trim()}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up...
              </>
            ) : (
              <>Set Company Email <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>
      )}
    </motion.div>
  )
}
