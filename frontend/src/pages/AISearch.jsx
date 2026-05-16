import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Sparkles, Send, MapPin, Briefcase,
  ChevronDown, ChevronUp, Clock, Zap, RotateCcw,
  SlidersHorizontal, X, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getAvatarColor, getInitials, getAvailabilityBadge, matchPercentageColor } from '../utils/helpers'
import EmployeeModal from '../components/employee/EmployeeModal'

const EXAMPLE_QUERIES = [
  'Find React developers with WebSocket experience',
  'Backend developers in Pune with payment gateway integration',
  'Senior frontend engineers available now',
  'Node.js developers who worked on fintech applications',
  'Full-stack developers with 5+ years in Bangalore',
  'AI/ML engineers with Python and TensorFlow experience',
]

const STATUS_OPTIONS = [
  { value: 'available',     label: 'Available',    desc: 'Free & ready to join',      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',      dot: 'bg-green-500' },
  { value: 'busy',          label: 'Busy',         desc: 'Currently on a project',    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',          dot: 'bg-blue-500' },
  { value: 'on-leave',      label: 'On Leave',     desc: 'Temporarily unavailable',   color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',  dot: 'bg-orange-500' },
  { value: 'notice-period', label: 'Notice Period', desc: 'Serving notice, soon free', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',             dot: 'bg-red-500' },
]

const DEFAULT_FILTERS = { minExp: '', maxExp: '', statuses: [] }

export default function AISearch() {
  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [hasSearched, setHasSearched]   = useState(false)
  const [expandedId, setExpandedId]     = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [meta, setMeta]                 = useState({})
  const [showFilters, setShowFilters]   = useState(false)
  const [filters, setFilters]           = useState(DEFAULT_FILTERS)
  const inputRef = useRef(null)

  // ── search ────────────────────────────────────────────────────────
  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query
    if (!q.trim()) { toast.error('Please enter a search query'); return }

    setLoading(true)
    setHasSearched(true)
    setResults([])
    setExpandedId(null)
    setShowFilters(false)
    setFilters(DEFAULT_FILTERS)

    try {
      const res = await api.post('/search/semantic', { query: q })
      setResults(res.data.data)
      setMeta({
        totalCandidates: res.data.totalCandidates,
        resultsFound: res.data.resultsFound,
        responseTime: res.data.responseTime,
      })
      if (res.data.data.length === 0) toast('No matching candidates found. Try a different query.', { icon: '🔍' })
      else toast.success(`Found ${res.data.data.length} matching candidates`)
    } catch (err) {
      toast.error(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example) => { setQuery(example); handleSearch(example) }

  const handleReset = () => {
    setQuery(''); setResults([]); setHasSearched(false)
    setExpandedId(null); setMeta({}); setShowFilters(false); setFilters(DEFAULT_FILTERS)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── filter toggle helpers ─────────────────────────────────────────
  const toggleStatus = (val) => {
    setFilters(f => ({
      ...f,
      statuses: f.statuses.includes(val) ? f.statuses.filter(s => s !== val) : [...f.statuses, val]
    }))
  }

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  // ── client-side filtering ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return results.filter(r => {
      const emp = r.employee
      if (!emp) return false
      const exp = emp.totalYearsOfExperience || 0
      if (filters.minExp !== '' && exp < Number(filters.minExp)) return false
      if (filters.maxExp !== '' && exp > Number(filters.maxExp)) return false
      if (filters.statuses.length > 0 && !filters.statuses.includes(emp.availability)) return false
      return true
    })
  }, [results, filters])

  const activeFilterCount = [
    filters.minExp !== '',
    filters.maxExp !== '',
    filters.statuses.length > 0,
  ].filter(Boolean).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
          <Sparkles size={14} className="text-primary-500" />
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">Powered by AI</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">AI Semantic Search</h1>
        <p className="text-gray-500 dark:text-gray-400">Search in natural language — understands context, skills, and experience</p>
      </motion.div>

      {/* Search box */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSearch()}
              placeholder="Find React developers with WebSocket experience in Pune..."
              className="w-full bg-transparent pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
            />
          </div>
          <motion.button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={18} />
            }
            <span className="hidden sm:inline">Search</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Example queries */}
      <AnimatePresence>
        {!hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3 text-center">Try an example</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLE_QUERIES.map(ex => (
                <motion.button key={ex} onClick={() => handleExampleClick(ex)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="text-sm px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl border border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 transition-all font-medium">
                  "{ex}"
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-ping" />
              <div className="relative w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                <Sparkles size={28} className="text-primary-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyzing candidates...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Semantic matching across {meta.totalCandidates || 'all'} profiles</p>
            <div className="flex gap-2 justify-center mt-6">
              {['Parsing query', 'Matching skills', 'Ranking candidates', 'Generating insights'].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5] }} transition={{ delay: i * 0.5, duration: 1, repeat: Infinity }}
                  className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-medium">
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results area */}
      {!loading && hasSearched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Meta bar */}
          {results.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap size={14} className="text-primary-500" />
                <span className="font-medium">{filtered.length} of {results.length} candidates</span>
                {meta.totalCandidates && <span>from {meta.totalCandidates} profiles</span>}
                {meta.responseTime && (
                  <span className="flex items-center gap-1"><Clock size={12} /> {(meta.responseTime / 1000).toFixed(1)}s</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Filter button */}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowFilters(p => !p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                    showFilters || activeFilterCount > 0
                      ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/25'
                      : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-700 hover:border-primary-400 hover:text-primary-500'
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white/30 text-white text-xs font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </motion.button>

                {/* New Search */}
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-500 px-3 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border border-gray-200 dark:border-dark-700"
                >
                  <RotateCcw size={14} /> New Search
                </motion.button>
              </div>
            </div>
          )}

          {/* ── Filter Panel ── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm p-5 space-y-5">

                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <SlidersHorizontal size={16} className="text-primary-500" /> Filter Results
                    </p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors">
                        <X size={12} /> Clear all
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">

                    {/* Years of Experience */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Briefcase size={12} /> Years of Experience
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Min</label>
                          <input
                            type="number" min="0" max="30" placeholder="0"
                            value={filters.minExp}
                            onChange={e => setFilters(f => ({ ...f, minExp: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>
                        <div className="text-gray-300 dark:text-dark-500 mt-5 font-bold">—</div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Max</label>
                          <input
                            type="number" min="0" max="30" placeholder="30"
                            value={filters.maxExp}
                            onChange={e => setFilters(f => ({ ...f, maxExp: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Availability / Status */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CheckCircle size={12} /> Availability / Status
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map(opt => {
                          const active = filters.statuses.includes(opt.value)
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggleStatus(opt.value)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                active
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500/30'
                                  : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 hover:border-primary-300'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dot}`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {opt.label}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{opt.desc}</p>
                              </div>
                              {active && <CheckCircle size={13} className="text-primary-500 flex-shrink-0 ml-auto" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Filter summary */}
                  {activeFilterCount > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-dark-700 text-sm text-gray-500 dark:text-gray-400">
                      <Zap size={13} className="text-primary-500" />
                      Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> of {results.length} results after filters
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="glass-card p-16 text-center">
              <Search size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {activeFilterCount > 0 ? 'No results match your filters' : 'No candidates found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-5">
                {activeFilterCount > 0 ? 'Try adjusting or clearing the filters' : 'Try a different search query or broader terms'}
              </p>
              {activeFilterCount > 0 ? (
                <button onClick={clearFilters} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary-500/25">
                  <X size={15} /> Clear Filters
                </button>
              ) : (
                <button onClick={handleReset} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-primary-500/25">
                  <RotateCcw size={15} /> Try New Search
                </button>
              )}
            </div>
          )}

          {/* Result cards */}
          {filtered.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    i === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                    i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-gray-50 text-gray-500 dark:bg-dark-700 dark:text-gray-400'
                  }`}>#{i + 1}</div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(result.employee?.name)} flex items-center justify-center text-white font-black flex-shrink-0 shadow-lg`}>
                    {getInitials(result.employee?.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white">{result.employee?.name}</h3>
                      {result.employee?.availability && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getAvailabilityBadge(result.employee.availability).class}`}>
                          {getAvailabilityBadge(result.employee.availability).label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{result.employee?.role}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {result.employee?.location && (
                        <div className="flex items-center gap-1"><MapPin size={11} />{result.employee.location}</div>
                      )}
                      {result.employee?.totalYearsOfExperience > 0 && (
                        <div className="flex items-center gap-1"><Briefcase size={11} />{result.employee.totalYearsOfExperience} years</div>
                      )}
                    </div>
                  </div>

                  {/* Match % */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-3xl font-black ${matchPercentageColor(result.matchPercentage)}`}>{result.matchPercentage}%</div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">match</p>
                    <div className="mt-1 w-16 h-1.5 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.matchPercentage}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                        className={`h-full rounded-full ${result.matchPercentage >= 80 ? 'bg-green-500' : result.matchPercentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
                </div>

                {/* Matching skills */}
                {result.matchingSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {result.matchingSkills.map(skill => (
                      <span key={skill} className="text-xs px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium border border-green-100 dark:border-green-800/30">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expand / View profile */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                    className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                  >
                    {expandedId === result.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedId === result.id ? 'Hide details' : 'View reasoning'}
                  </button>
                  <button
                    onClick={() => setSelectedEmployee(result.employee)}
                    className="text-sm font-semibold text-primary-500 hover:text-primary-600 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    Full Profile →
                  </button>
                </div>

                {/* Expanded reasoning */}
                <AnimatePresence>
                  {expandedId === result.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3 border-t border-gray-100 dark:border-dark-700 pt-4"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">AI Reasoning</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">{result.reasoning}</p>
                      </div>
                      {result.strengthAreas?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Strength Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {result.strengthAreas.map(area => (
                              <span key={area} className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium">{area}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.concerns && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Potential Concerns</p>
                          <p className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">{result.concerns}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <EmployeeModal employee={selectedEmployee} isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} />
    </div>
  )
}
