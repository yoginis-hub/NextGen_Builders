import { motion } from 'framer-motion'
import { Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppIcon from './AppIcon'
import ThemeToggle from './ThemeToggle'
import { getInitials, getAvatarColor } from '../../utils/helpers'

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-100 dark:border-dark-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo on mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onMobileMenuToggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-current rounded-full" />
              <span className="block w-4 h-0.5 bg-current rounded-full" />
              <span className="block w-5 h-0.5 bg-current rounded-full" />
            </div>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
              <AppIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">SkillSync AI</span>
          </Link>
        </div>

        {/* Center: Search hint */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <Search size={15} />
          <span>Search anything...</span>
          <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-xs text-gray-500 dark:text-gray-400">⌘K</kbd>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto lg:ml-0">
          <ThemeToggle />

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-sm font-bold`}>
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-card py-2 z-20"
                >
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
