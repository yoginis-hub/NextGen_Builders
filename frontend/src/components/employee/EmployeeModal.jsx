import { motion } from 'framer-motion'
import { MapPin, Briefcase, Phone, Mail, Globe, Github, Linkedin, Award, Code, Star, Building2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { getAvatarColor, getInitials, getAvailabilityBadge, getProficiencyColor, getCategoryColor } from '../../utils/helpers'

export default function EmployeeModal({ employee, isOpen, onClose }) {
  if (!employee) return null

  const availBadge = getAvailabilityBadge(employee.availability)
  const skillsByCategory = employee.skills?.filter(s => !s.isInferred).reduce((acc, skill) => {
    const cat = skill.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showClose={false}>
      {/* Profile header */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-primary-600 to-blue-500 rounded-t-xl" />
        <div className="px-8 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className={`w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-dark-800 shadow-xl flex-shrink-0 ${!employee.avatar ? `bg-gradient-to-br ${getAvatarColor(employee.name)}` : ''}`}>
              {employee.avatar
                ? <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-white text-2xl font-black">{getInitials(employee.name)}</span>
              }
            </div>
            <span className={`mb-2 px-3 py-1 rounded-lg text-xs font-semibold ${availBadge.class}`}>
              {availBadge.label}
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{employee.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">{employee.role || 'No role specified'}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            {employee.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-500" />
                {employee.location}
              </div>
            )}
            {employee.totalYearsOfExperience > 0 && (
              <div className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-primary-500" />
                {employee.totalYearsOfExperience} years experience
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-primary-500" />
                {employee.phone}
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-primary-500" />
                {employee.email}
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="flex gap-3 mt-3">
            {employee.linkedIn && <a href={employee.linkedIn} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors"><Linkedin size={18} /></a>}
            {employee.github && <a href={employee.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"><Github size={18} /></a>}
            {employee.portfolio && <a href={employee.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors"><Globe size={18} /></a>}
          </div>

          {employee.summary && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">
              {employee.summary}
            </p>
          )}
        </div>
      </div>

      <div className="px-8 pb-8 space-y-8 border-t border-gray-100 dark:border-dark-700 pt-6">
        {/* Skills by category */}
        {skillsByCategory && Object.keys(skillsByCategory).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Skills</h3>
              <span className="text-xs text-gray-400 ml-auto">{employee.skills?.filter(s => !s.isInferred).length} core skills</span>
            </div>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} className="mb-4">
                <p className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-flex mb-2 ${getCategoryColor(category)}`}>{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <div key={skill.name} className="flex items-center gap-1.5">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${getProficiencyColor(skill.proficiency)}`}>
                        {skill.name}
                      </span>
                      {skill.yearsOfExperience > 0 && (
                        <span className="text-xs text-gray-400">{skill.yearsOfExperience}yr</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Inferred skills */}
            {employee.skills?.filter(s => s.isInferred).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-violet-500" />
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">AI Inferred Skills</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.filter(s => s.isInferred).map(skill => (
                    <span key={skill.name} className="text-xs px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg font-medium">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        {employee.projects?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Projects</h3>
            </div>
            <div className="space-y-3">
              {employee.projects.map((proj, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{proj.name}</h4>
                    {proj.duration && <span className="text-xs text-gray-400">{proj.duration}</span>}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies?.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {employee.previousCompanies?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Experience</h3>
            </div>
            <div className="space-y-3">
              {employee.previousCompanies.map((comp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-dark-600 flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{comp.role}</p>
                    <p className="text-xs text-primary-500 font-medium">{comp.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{comp.from} — {comp.to} • {comp.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {employee.certifications?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Certifications</h3>
            </div>
            <div className="space-y-2">
              {employee.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                  <Award size={16} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</p>
                    <p className="text-xs text-gray-400">{cert.issuer} {cert.year && `• ${cert.year}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
