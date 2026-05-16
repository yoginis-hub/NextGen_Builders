import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Search, Users, ClipboardCheck, Layers,
  Upload, User, Sparkles, ChevronRight, X, FileSpreadsheet
} from 'lucide-react'
import AppIcon from './AppIcon'
import { useAuth } from '../../context/AuthContext'

const hrLinks = [
  { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hr/search', icon: Search, label: 'AI Search' },
  { to: '/hr/directory', icon: Users, label: 'Employee Directory' },
  { to: '/hr/reviews', icon: ClipboardCheck, label: 'Review Queue' },
  { to: '/hr/team-builder', icon: Layers, label: 'Team Builder' },
  { to: '/hr/import', icon: FileSpreadsheet, label: 'Bulk Import' },
]

const employeeLinks = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
  { to: '/employee/directory', icon: Users, label: 'Directory' },
  { to: '/profile', icon: User, label: 'My Profile' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const links = user?.role === 'hr' ? hrLinks : employeeLinks

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <AppIcon className="w-5 h-5" />
            </div>
            <motion.div
              className="absolute -inset-1 rounded-2xl bg-primary-500/20 blur-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-base leading-tight">SkillSync AI</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Skills Intelligence</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Role badge */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
          <Sparkles size={14} className="text-primary-500" />
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
            {user?.role === 'hr' ? 'HR Manager' : 'Employee'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {user?.role === 'hr' ? 'HR Tools' : 'My Space'}
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-500/10 to-primary-600/5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
