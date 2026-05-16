import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle, Star, Code, Award, Briefcase, MapPin,
  RefreshCw, Phone, Globe, Github, Linkedin
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ResumeUpload from '../components/resume/ResumeUpload'
import { getProficiencyColor, getCategoryColor, getAvailabilityBadge, getStatusBadge, getAvatarColor, getInitials } from '../utils/helpers'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('skills')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees/me')
      setProfile(res.data.data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (emp) => { setProfile(emp); setShowUpload(false) }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-48 glass-card animate-pulse rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-64 glass-card animate-pulse rounded-2xl" />
          <div className="lg:col-span-2 h-64 glass-card animate-pulse rounded-2xl" />
        </div>
      </div>
    )
  }

  const statusBadge = profile ? getStatusBadge(profile.status) : null
  const displayName = profile?.name || user?.name || ''

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Profile header card ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">

        {/* Cover + Avatar */}
        <div className="relative">
          <div className="h-28 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          </div>

          {/* Avatar */}
          <div className="absolute left-6 sm:left-8 bottom-0 translate-y-1/2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-dark-800 shadow-xl"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-2xl font-black ring-4 ring-white dark:ring-dark-800 shadow-xl`}>
                {getInitials(displayName)}
              </div>
            )}
          </div>

          {/* Right-side action buttons */}
          <div className="absolute right-6 sm:right-8 bottom-0 translate-y-full pt-3 flex items-center gap-2">
            {statusBadge && (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusBadge.class}`}>
                {statusBadge.label}
              </span>
            )}
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-lg shadow-primary-500/25"
            >
              <RefreshCw size={14} />
              {profile ? 'Update Resume' : 'Upload Resume'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 pt-14 pb-6">

          {/* Name */}
          <div className="mb-1">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{displayName}</h1>
          </div>

          {/* Read-only info row */}
          <div className="flex flex-wrap items-center gap-3 mt-2 mb-5">
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Briefcase size={13} className="text-primary-400" />
              {profile?.role || 'No role specified'}
            </span>
            {profile?.email && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-600" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-dark-700 mb-5" />

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={15} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.phone || <span className="text-gray-400 italic font-normal">Not set</span>}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={15} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.location || <span className="text-gray-400 italic font-normal">Not set</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Availability</p>
            <span className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-xl ${getAvailabilityBadge(profile?.availability || 'available').class}`}>
              <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-70" />
              {getAvailabilityBadge(profile?.availability || 'available').label}
            </span>
          </div>

          {/* Summary */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">
              {profile?.summary || <span className="italic text-gray-400">No summary yet. Upload your resume to auto-generate one.</span>}
            </p>
          </div>

          {/* Social links */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-dark-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Social Links</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { icon: Linkedin, label: 'LinkedIn', field: 'linkedIn' },
                { icon: Github, label: 'GitHub', field: 'github' },
                { icon: Globe, label: 'Portfolio', field: 'portfolio' },
              ].map(({ icon: Icon, label, field }) => (
                <div key={field} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
                    {profile?.[field] ? (
                      <a href={profile[field]} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:text-primary-600 transition-colors truncate block">
                        {profile[field]}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not added</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Resume upload panel ── */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Upload size={20} className="text-primary-500" /> Upload Resume
            </h3>
            <ResumeUpload onSuccess={handleUploadSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No profile state ── */}
      {!profile ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center">
          <Upload size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload your resume to get started</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Our AI will automatically extract your skills, experience, and achievements from your PDF resume.
          </p>
          <button onClick={() => setShowUpload(true)} className="btn-primary">Upload Resume</button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Quick stats */}
          <div className="space-y-4">
            {[
              { label: 'Total Skills', value: profile.skills?.filter(s => !s.isInferred).length || 0, icon: Code, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Inferred Skills', value: profile.skills?.filter(s => s.isInferred).length || 0, icon: Star, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
              { label: 'Certifications', value: profile.certifications?.length || 0, icon: Award, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Projects', value: profile.projects?.length || 0, icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div key={label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 2 }} className="glass-card p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="lg:col-span-2 glass-card">
            <div className="flex border-b border-gray-100 dark:border-dark-700 px-6 pt-6">
              {['skills', 'projects', 'experience', 'certifications'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`mr-6 pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">

                {activeTab === 'skills' && (
                  <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid gap-2">
                      {profile.skills?.filter(s => !s.isInferred).map((skill, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">{skill.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getCategoryColor(skill.category)}`}>{skill.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getProficiencyColor(skill.proficiency)}`}>{skill.proficiency}</span>
                          {skill.yearsOfExperience > 0 && <span className="text-xs text-gray-400">{skill.yearsOfExperience}yr</span>}
                        </motion.div>
                      ))}
                      {profile.skills?.filter(s => s.isInferred).length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">AI Inferred Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.filter(s => s.isInferred).map((skill, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg font-medium">
                                {skill.name} <span className="opacity-60">← {skill.inferredFrom}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'projects' && (
                  <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {!profile.projects?.length && <p className="text-gray-400 text-center py-8">No projects found</p>}
                    {profile.projects?.map((proj, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{proj.name}</h4>
                          {proj.duration && <span className="text-xs text-gray-400">{proj.duration}</span>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies?.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'experience' && (
                  <motion.div key="experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {!profile.previousCompanies?.length && <p className="text-gray-400 text-center py-8">No experience found</p>}
                    {profile.previousCompanies?.map((comp, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 mt-1" />
                          {i < profile.previousCompanies.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-dark-700 mt-1" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{comp.role}</h4>
                          <p className="text-sm text-primary-500 font-medium">{comp.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{comp.from} — {comp.to} • {comp.duration}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'certifications' && (
                  <motion.div key="certifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {!profile.certifications?.length && <p className="text-gray-400 text-center py-8">No certifications found</p>}
                    {profile.certifications?.map((cert, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                          <Award size={18} className="text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{cert.name}</p>
                          <p className="text-xs text-gray-400">{cert.issuer}{cert.year && ` • ${cert.year}`}</p>
                        </div>
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
