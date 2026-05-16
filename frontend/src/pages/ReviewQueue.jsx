import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, Check, X, Eye, Clock, User, MapPin, Briefcase, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Modal from '../components/ui/Modal'
import { SkeletonTable } from '../components/ui/SkeletonLoader'
import { getAvatarColor, getInitials, timeAgo, getProficiencyColor, getCategoryColor } from '../utils/helpers'

export default function ReviewQueue() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [notes, setNotes] = useState('')
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reviews/pending?limit=50')
      setEmployees(res.data.data)
      setTotalPending(res.data.pagination.total)
    } catch (err) {
      toast.error('Failed to load review queue')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (emp) => {
    setActionLoading(`approve-${emp._id}`)
    try {
      await api.put(`/reviews/${emp._id}/approve`, { notes })
      toast.success(`${emp.name}'s profile approved!`)
      setEmployees(prev => prev.filter(e => e._id !== emp._id))
      setTotalPending(p => p - 1)
      setSelectedEmployee(null)
      setNotes('')
    } catch (err) {
      toast.error(err.message || 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (emp) => {
    if (!notes.trim()) {
      toast.error('Please add a note explaining why the profile was rejected')
      return
    }
    setActionLoading(`reject-${emp._id}`)
    try {
      await api.put(`/reviews/${emp._id}/reject`, { notes })
      toast.success(`${emp.name}'s profile rejected`)
      setEmployees(prev => prev.filter(e => e._id !== emp._id))
      setTotalPending(p => p - 1)
      setSelectedEmployee(null)
      setNotes('')
    } catch (err) {
      toast.error(err.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Queue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? '...' : `${totalPending} profiles pending review`}
          </p>
        </div>
        {totalPending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <Clock size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{totalPending} pending</span>
          </div>
        )}
      </motion.div>

      {/* Queue list */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : employees.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-20 text-center"
        >
          <ClipboardCheck size={48} className="mx-auto mb-4 text-green-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400">No profiles pending review at the moment.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp, i) => (
            <motion.div
              key={emp._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-black flex-shrink-0`}>
                  {getInitials(emp.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">{emp.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md font-medium">Pending</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      {emp.role || 'No role'}
                    </div>
                    {emp.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {emp.location}
                      </div>
                    )}
                    {emp.totalYearsOfExperience > 0 && (
                      <div className="flex items-center gap-1">
                        <Briefcase size={12} />
                        {emp.totalYearsOfExperience} years
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(emp.updatedAt)}
                    </div>
                  </div>
                  {/* Skill preview */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {emp.skills?.filter(s => !s.isInferred).slice(0, 5).map(skill => (
                      <span key={skill.name} className={`text-xs px-2 py-0.5 rounded-md font-medium ${getProficiencyColor(skill.proficiency)}`}>
                        {skill.name}
                      </span>
                    ))}
                    {emp.skills?.filter(s => !s.isInferred).length > 5 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-500 rounded-md">
                        +{emp.skills.filter(s => !s.isInferred).length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    onClick={() => { setSelectedEmployee(emp); setNotes('') }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                  >
                    <Eye size={15} />
                    <span className="hidden sm:inline">Review</span>
                    <ChevronRight size={14} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleApprove(emp)}
                    disabled={actionLoading === `approve-${emp._id}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                  >
                    <Check size={15} />
                    <span className="hidden sm:inline">Approve</span>
                  </motion.button>
                  <motion.button
                    onClick={() => { setSelectedEmployee(emp); setNotes('') }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <X size={15} />
                    <span className="hidden sm:inline">Reject</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!selectedEmployee} onClose={() => { setSelectedEmployee(null); setNotes('') }} title="Review Profile" size="lg">
        {selectedEmployee && (
          <div className="p-6 space-y-6">
            {/* Employee summary */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(selectedEmployee.name)} flex items-center justify-center text-white text-xl font-black`}>
                {getInitials(selectedEmployee.name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEmployee.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedEmployee.role} • {selectedEmployee.location}</p>
                <p className="text-sm text-gray-400 mt-0.5">{selectedEmployee.totalYearsOfExperience} years experience</p>
              </div>
            </div>

            {selectedEmployee.summary && (
              <div className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.summary}</p>
              </div>
            )}

            {/* Skills */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Extracted Skills ({selectedEmployee.skills?.filter(s => !s.isInferred).length})</h4>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {selectedEmployee.skills?.filter(s => !s.isInferred).map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white text-sm flex-1">{skill.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getCategoryColor(skill.category)}`}>{skill.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getProficiencyColor(skill.proficiency)}`}>{skill.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Review Notes <span className="text-red-400">(required for rejection)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this review decision..."
                className="input-field resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => handleApprove(selectedEmployee)}
                disabled={actionLoading?.startsWith('approve')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading?.startsWith('approve') ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                Approve Profile
              </motion.button>
              <motion.button
                onClick={() => handleReject(selectedEmployee)}
                disabled={actionLoading?.startsWith('reject')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {actionLoading?.startsWith('reject') ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X size={18} />}
                Reject Profile
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
