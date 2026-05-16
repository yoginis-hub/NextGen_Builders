import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MapPin, Briefcase, Star, ExternalLink, Pencil } from 'lucide-react'
import { getAvatarColor, getInitials, getAvailabilityBadge, getProficiencyColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeCard({ employee, onClick, onEdit, delay = 0 }) {
  const { isHR } = useAuth()
  const [hovered, setHovered] = useState(false)
  const availBadge = getAvailabilityBadge(employee.availability)
  const topSkills = employee.skills?.filter(s => !s.isInferred).slice(0, 4) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick?.(employee)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="glass-card p-6 cursor-pointer hover:shadow-xl hover:shadow-primary-500/10 transition-all group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow overflow-hidden ${!employee.avatar ? `bg-gradient-to-br ${getAvatarColor(employee.name)}` : ''}`}>
          {employee.avatar
            ? <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-white text-lg font-black">{getInitials(employee.name)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
            {employee.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{employee.role || 'No role'}</p>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md mt-1 ${availBadge.class}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
            {availBadge.label}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isHR && onEdit && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onEdit(employee) }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Edit profile"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Pencil size={13} />
            </motion.button>
          )}
          <span onClick={e => e.stopPropagation()}>
            <ExternalLink size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-400 transition-colors" />
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
        {employee.location && (
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-primary-400" />
            <span className="truncate">{employee.location}</span>
          </div>
        )}
        {employee.totalYearsOfExperience > 0 && (
          <div className="flex items-center gap-1">
            <Briefcase size={12} className="text-primary-400" />
            <span>{employee.totalYearsOfExperience}yr exp</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => (
            <span key={skill.name} className={`text-xs px-2 py-0.5 rounded-md font-medium ${getProficiencyColor(skill.proficiency)}`}>
              {skill.name}
            </span>
          ))}
          {employee.skills?.filter(s => !s.isInferred).length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-gray-100 text-gray-500 dark:bg-dark-700 dark:text-gray-400">
              +{employee.skills.filter(s => !s.isInferred).length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Inferred skills */}
      {employee.skills?.filter(s => s.isInferred).length > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 dark:text-violet-500">
          <Star size={11} className="fill-current" />
          <span>{employee.skills.filter(s => s.isInferred).length} AI-inferred skills</span>
        </div>
      )}

      {/* Hover description overlay */}
      <AnimatePresence>
        {hovered && employee.summary && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-primary-600 via-primary-500/95 to-primary-400/80 backdrop-blur-sm px-5 py-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">About</p>
            <p className="text-sm text-white leading-relaxed line-clamp-3">{employee.summary}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
              <Briefcase size={11} />
              <span>{employee.totalYearsOfExperience || 0} years experience</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
