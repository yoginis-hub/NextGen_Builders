import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Sparkles, Users, CheckCircle, AlertTriangle, Target, ChevronRight, RotateCcw, MapPin, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getAvatarColor, getInitials, getAvailabilityBadge } from '../utils/helpers'
import EmployeeModal from '../components/employee/EmployeeModal'

const AVAIL_OPTIONS = [
  { value: 'available', label: 'Available', dot: 'bg-green-500' },
  { value: 'busy', label: 'Busy', dot: 'bg-blue-500' },
  { value: 'on-leave', label: 'On Leave', dot: 'bg-orange-500' },
]

const EXAMPLE_REQUIREMENTS = [
  'Build a 4-person healthcare team: frontend, backend, DevOps, and data engineer',
  'Need a fintech startup team: full-stack React/Node developer, Java microservices expert, and cloud architect',
  'Machine learning project team: AI/ML engineer, data engineer, backend developer',
  'E-commerce platform: 2 frontend developers, 1 backend, 1 DevOps engineer',
]

export default function TeamBuilder() {
  const [requirement, setRequirement] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [filters, setFilters] = useState({ availability: [], location: '', minExp: '' })
  const [showFilters, setShowFilters] = useState(false)

  const toggleAvail = (val) =>
    setFilters(f => ({
      ...f,
      availability: f.availability.includes(val)
        ? f.availability.filter(v => v !== val)
        : [...f.availability, val]
    }))

  const filteredMembers = useMemo(() => {
    if (!result?.members) return []
    return result.members.filter(member => {
      const emp = member.employeeData
      if (!emp) return false
      if (filters.availability.length > 0 && !filters.availability.includes(emp.availability)) return false
      if (filters.location && !emp.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
      if (filters.minExp && emp.totalYearsOfExperience < parseInt(filters.minExp)) return false
      return true
    })
  }, [result, filters])

  const handleViewProfile = async (employeeData) => {
    try {
      const res = await api.get(`/employees/${employeeData._id}`)
      setSelectedEmployee(res.data.data)
    } catch {
      setSelectedEmployee(employeeData)
    }
  }

  const handleReset = () => {
    setResult(null)
    setRequirement('')
    setFilters({ availability: [], location: '', minExp: '' })
    setShowFilters(false)
  }

  const handleBuild = async (req) => {
    const r = req || requirement
    if (!r.trim() || r.trim().length < 10) {
      toast.error('Please describe your team requirements in more detail')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await api.post('/team-builder/build', { requirement: r })
      setResult(res.data.data)
      toast.success(`Team "${res.data.data.teamName}" composed successfully!`)
    } catch (err) {
      toast.error(err.message || 'Team building failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-full mb-4">
          <Layers size={14} className="text-violet-500" />
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">AI Team Composer</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Team Builder</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Describe your project needs — Claude will compose the perfect team from your talent pool
        </p>
      </motion.div>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Layers className="absolute left-4 top-4 text-gray-400" size={20} />
            <textarea
              value={requirement}
              onChange={e => setRequirement(e.target.value)}
              placeholder="Describe your team requirements... e.g. 'Build a 4-person fintech team with frontend, backend, DevOps, and security expertise'"
              className="w-full bg-transparent pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base resize-none min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 p-2">
            <motion.button
              onClick={() => handleBuild()}
              disabled={loading || requirement.trim().length < 10}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              Build Team
            </motion.button>
            {result && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowFilters(f => !f)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                  showFilters || filters.availability.length > 0 || filters.location
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                    : 'border-gray-200 dark:border-dark-600 text-gray-500 dark:text-gray-400 hover:border-violet-300 hover:text-violet-500'
                }`}
              >
                <SlidersHorizontal size={14} /> Filters
                {(filters.availability.length > 0 || filters.location) && (
                  <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-black">
                    {filters.availability.length + (filters.location ? 1 : 0)}
                  </span>
                )}
              </motion.button>
            )}
            {(requirement.trim().length > 0 || result) && (
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 font-semibold text-sm transition-colors"
              >
                <RotateCcw size={14} /> New Search
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-dark-700 mt-2 space-y-3">
                {/* Availability */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAIL_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleAvail(opt.value)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          filters.availability.includes(opt.value)
                            ? 'bg-violet-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${filters.availability.includes(opt.value) ? 'bg-white' : opt.dot}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Location + Experience */}
                <div className="flex flex-wrap gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Location</p>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={filters.location}
                        onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Mumbai, Bangalore..."
                        className="pl-8 pr-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400 w-48"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Min. Experience (yrs)</p>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={filters.minExp}
                      onChange={e => setFilters(f => ({ ...f, minExp: e.target.value }))}
                      placeholder="e.g. 3"
                      className="px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-400 w-28"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Examples */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3 text-center">Try an example</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAMPLE_REQUIREMENTS.map(ex => (
              <motion.button
                key={ex}
                onClick={() => { setRequirement(ex); handleBuild(ex) }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="text-left text-sm px-4 py-3 bg-gray-50 dark:bg-dark-700/50 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl border border-gray-200 dark:border-dark-600 hover:border-violet-300 dark:hover:border-violet-700 transition-all font-medium"
              >
                <ChevronRight size={14} className="inline mr-2 opacity-50" />
                {ex}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
              <div className="relative w-16 h-16 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center">
                <Layers size={28} className="text-violet-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Composing your dream team...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Claude is analyzing skills and matching the best candidates</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Team header */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Users size={20} className="text-violet-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{result.teamName}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{result.projectSummary}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-4xl font-black text-violet-500">{result.skillCoverage?.overallScore}%</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">skill coverage</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 font-semibold text-sm transition-colors"
                  >
                    <RotateCcw size={14} /> New Search
                  </motion.button>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl leading-relaxed">
                {result.teamAnalysis}
              </p>

              {/* Skill coverage */}
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                {result.skillCoverage?.covered?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Covered Skills</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skillCoverage.covered.map(skill => (
                        <span key={skill} className="text-xs px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md font-medium">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.skillCoverage?.gaps?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-orange-500" />
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Skill Gaps</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skillCoverage.gaps.map(skill => (
                        <span key={skill} className="text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-md font-medium">
                          ⚠ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team members */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={18} className="text-violet-500" />
                Selected Team Members ({filteredMembers.length}{filteredMembers.length !== result.members?.length ? ` of ${result.members?.length}` : ''})
              </h3>
              {filteredMembers.length === 0 && (
                <div className="glass-card p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                  No members match the current filters. Try adjusting or clearing filters.
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredMembers.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(member.employeeData?.name)} flex items-center justify-center text-white font-black flex-shrink-0 shadow-md`}>
                        {getInitials(member.employeeData?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white">{member.employeeData?.name}</h4>
                        <p className="text-sm text-violet-500 font-semibold">{member.suggestedRole}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {member.employeeData?.totalYearsOfExperience}yr exp •{' '}
                          {member.employeeData?.location}
                        </p>
                        {member.employeeData?.availability && (
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-md font-medium mt-1 ${getAvailabilityBadge(member.employeeData.availability).class}`}>
                            {getAvailabilityBadge(member.employeeData.availability).label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl">
                      <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Why selected</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{member.whySelected}</p>
                    </div>

                    {member.keyContributions?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Key Contributions</p>
                        <div className="space-y-1">
                          {member.keyContributions.map(contrib => (
                            <div key={contrib} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{contrib}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top skills */}
                    {member.employeeData?.topSkills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {member.employeeData.topSkills.map(skill => (
                          <span key={skill} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleViewProfile(member.employeeData)}
                      className="mt-4 w-full text-xs font-semibold text-violet-500 hover:text-violet-600 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                    >
                      View Full Profile →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmployeeModal
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  )
}
