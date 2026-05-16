import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, SlidersHorizontal, X } from 'lucide-react'
import api from '../services/api'
import EmployeeCard from '../components/employee/EmployeeCard'
import EmployeeModal from '../components/employee/EmployeeModal'
import EditEmployeeModal from '../components/employee/EditEmployeeModal'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import { useAuth } from '../context/AuthContext'

const AVAILABILITY_OPTIONS = ['', 'available', 'busy', 'on-leave', 'notice-period']
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest first' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'name', label: 'Name A-Z' },
]

export default function EmployeeDirectory() {
  const { isHR } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ availability: '', location: '', skills: '', sort: 'createdAt' })
  const [pagination, setPagination] = useState({ total: 0, page: 1 })

  useEffect(() => {
    fetchEmployees()
  }, [filters])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', 'approved')
      if (filters.availability) params.append('availability', filters.availability)
      if (filters.location) params.append('location', filters.location)
      if (filters.skills) params.append('skills', filters.skills)
      if (filters.sort) params.append('sort', filters.sort)
      params.append('limit', '24')

      const res = await api.get(`/employees?${params}`)
      setEmployees(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.role?.toLowerCase().includes(q) ||
      emp.location?.toLowerCase().includes(q) ||
      emp.skills?.some(s => s.name.toLowerCase().includes(q))
    )
  })

  const clearFilters = () => {
    setFilters({ availability: '', location: '', skills: '', sort: 'createdAt' })
    setSearchQuery('')
  }

  const hasActiveFilters = filters.availability || filters.location || filters.skills || searchQuery

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? '...' : `${filteredEmployees.length} employees found`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Users size={16} />
          <span>{pagination.total} total</span>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, skill, location..."
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
              showFilters || filters.availability || filters.location || filters.skills
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-dark-500'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filters.availability || filters.location || filters.skills) && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X size={16} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-dark-700"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Availability</label>
              <select
                value={filters.availability}
                onChange={e => setFilters(p => ({ ...p, availability: e.target.value }))}
                className="input-field py-2 text-sm"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="notice-period">Notice Period</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Pune, Bangalore"
                className="input-field py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Skills (comma separated)</label>
              <input
                type="text"
                value={filters.skills}
                onChange={e => setFilters(p => ({ ...p, skills: e.target.value }))}
                placeholder="e.g. React, Node.js"
                className="input-field py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Sort By</label>
              <select
                value={filters.sort}
                onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
                className="input-field py-2 text-sm"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Employee Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-20 text-center"
        >
          <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No employees found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Clear filters</button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredEmployees.map((emp, i) => (
            <EmployeeCard
              key={emp._id}
              employee={emp}
              onClick={setSelectedEmployee}
              onEdit={isHR ? setEditingEmployee : undefined}
              delay={i * 0.04}
            />
          ))}
        </motion.div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {isHR && (
        <EditEmployeeModal
          employee={editingEmployee}
          isOpen={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSaved={(updated) => {
            setEmployees(prev => prev.map(e => e._id === updated._id ? updated : e))
            setEditingEmployee(null)
          }}
        />
      )}
    </div>
  )
}
