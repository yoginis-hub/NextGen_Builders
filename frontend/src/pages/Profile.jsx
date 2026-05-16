import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, MapPin, Globe, Github, Linkedin,
  Edit3, Save, X, Briefcase, ShieldCheck, Building2, Camera,
  Plus, Code, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { getAvatarColor, getInitials, getAvailabilityBadge, getProficiencyColor } from '../utils/helpers'

const CATEGORIES = ['Language', 'Framework', 'Database', 'DevOps', 'Cloud', 'Tool', 'Platform', 'Domain', 'Other']
const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function Profile() {
  const { user, isEmployee, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [activeSection, setActiveSection] = useState('info')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    if (isEmployee) {
      try {
        const res = await api.get('/employees/me')
        const emp = res.data.data
        setProfile(emp)
        initForm(emp)
      } catch { /* no profile yet */ }
    } else {
      setForm({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '' })
    }
    setLoading(false)
  }

  const initForm = (emp) => setForm({
    name: emp.name || user?.name || '',
    phone: emp.phone || '',
    location: emp.location || '',
    summary: emp.summary || '',
    availability: emp.availability || 'available',
    linkedIn: emp.linkedIn || '',
    github: emp.github || '',
    portfolio: emp.portfolio || '',
    skills: emp.skills?.filter(s => !s.isInferred) || [],
  })

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const setVal = (field, value) => setForm(p => ({ ...p, [field]: value }))

  // Skill helpers
  const addSkill = () => setVal('skills', [...(form.skills || []), { name: '', category: 'Other', proficiency: 'Intermediate', yearsOfExperience: 0 }])
  const removeSkill = (idx) => setVal('skills', form.skills.filter((_, i) => i !== idx))
  const updateSkill = (idx, field, value) => {
    const updated = [...form.skills]
    updated[idx] = { ...updated[idx], [field]: value }
    setVal('skills', updated)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name is required'); return }
    if (isEmployee) {
      const badSkill = form.skills?.find(s => !s.name?.trim())
      if (badSkill) { toast.error('All skills must have a name'); return }
    }
    setSaving(true)
    try {
      if (isEmployee && profile) {
        const res = await api.put(`/employees/${profile._id}`, {
          ...form,
          skills: form.skills?.map(s => ({ ...s, yearsOfExperience: Number(s.yearsOfExperience || 0) })),
        })
        setProfile(res.data.data)
        updateUser({ name: form.name, phone: form.phone, location: form.location })
      } else {
        const res = await api.put('/auth/profile', { name: form.name, phone: form.phone, location: form.location })
        const u = res.data.user
        updateUser({ name: u?.name || form.name, phone: u?.phone ?? form.phone, location: u?.location ?? form.location })
      }
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (isEmployee && profile) initForm(profile)
    else setForm({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '' })
    setEditing(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser({ avatar: res.data.avatarUrl })
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="h-8 w-48 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
      <div className="glass-card h-80 animate-pulse rounded-2xl" />
    </div>
  )

  const displayName = user?.name || 'Unknown'
  const coverClass = isEmployee
    ? 'bg-gradient-to-r from-primary-600 to-blue-500'
    : 'bg-gradient-to-r from-violet-600 to-purple-500'

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">View and manage your account information</p>
      </motion.div>

      {/* Main profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">

        {/* Cover + Avatar */}
        <div className="relative">
          <div className={`h-28 ${coverClass}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)]" />
          </div>

          {/* Avatar */}
          <div className="absolute left-6 sm:left-8 bottom-0 translate-y-1/2">
            <div
              className={`relative group ${editing ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => editing && avatarInputRef.current?.click()}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-dark-800 shadow-xl" />
              ) : (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-2xl font-black ring-4 ring-white dark:ring-dark-800 shadow-xl`}>
                  {getInitials(displayName)}
                </div>
              )}
              {editing && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar
                    ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Camera size={18} className="text-white" />}
                </div>
              )}
              {editing && !uploadingAvatar && (
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-800 shadow-md pointer-events-none">
                  <Edit3 size={11} className="text-white" />
                </div>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div className="absolute right-6 sm:right-8 bottom-0 translate-y-full pt-3">
            {editing ? (
              <div className="flex gap-2">
                <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all disabled:opacity-50 shadow-md shadow-primary-500/25">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md shadow-primary-500/25">
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 pt-14 pb-8">

          {/* Name */}
          <div className="mb-1">
            {editing ? (
              <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" className="input-field text-xl font-bold w-full max-w-sm" />
            ) : (
              <div className="group inline-flex items-center gap-2 cursor-pointer" onClick={() => setEditing(true)} title="Click to edit">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{displayName}</h2>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                  <Edit3 size={14} />
                </span>
              </div>
            )}
          </div>

          {/* Read-only info row */}
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-5">
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              {isEmployee
                ? <Briefcase size={13} className="text-primary-400 flex-shrink-0" />
                : <ShieldCheck size={13} className="text-violet-400 flex-shrink-0" />}
              {isEmployee ? (profile?.role || 'Employee') : 'HR Manager'}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-600" />
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Mail size={13} className="text-gray-400 flex-shrink-0" />
              {user?.email}
            </span>
            {!isEmployee && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-dark-600" />
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Building2 size={13} className="text-gray-400 flex-shrink-0" />
                  Human Resources
                </span>
              </>
            )}
          </div>

          {/* Section switcher — employees only */}
          {isEmployee && (
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl w-fit mb-6">
              {[
                { key: 'info', label: 'Profile Info' },
                { key: 'skills', label: `Skills (${profile?.skills?.filter(s => !s.isInferred).length || 0})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    activeSection === key
                      ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-dark-700 mb-6" />

          <AnimatePresence mode="wait">

            {/* ── Profile Info section ── */}
            {(!isEmployee || activeSection === 'info') && (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                {/* Phone + Location */}
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  <Field icon={Phone} label="Phone">
                    {editing ? (
                      <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 99999 99999" className="input-field text-sm w-full" />
                    ) : (
                      <EditableHint onClick={() => setEditing(true)}>
                        {(isEmployee ? profile?.phone : user?.phone) || <span className="text-gray-400 italic font-normal">Not set</span>}
                      </EditableHint>
                    )}
                  </Field>
                  <Field icon={MapPin} label="Location">
                    {editing ? (
                      <input type="text" value={form.location} onChange={set('location')} placeholder="City, Country" className="input-field text-sm w-full" />
                    ) : (
                      <EditableHint onClick={() => setEditing(true)}>
                        {(isEmployee ? profile?.location : user?.location) || <span className="text-gray-400 italic font-normal">Not set</span>}
                      </EditableHint>
                    )}
                  </Field>
                </div>

                {/* Employee-only fields */}
                {isEmployee && (
                  <>
                    {/* Availability */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Availability</p>
                      {editing ? (
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'available', label: 'Available', dot: 'bg-green-500' },
                            { value: 'busy', label: 'Busy', dot: 'bg-blue-500' },
                            { value: 'on-leave', label: 'On Leave', dot: 'bg-orange-400' },
                            { value: 'notice-period', label: 'Notice Period', dot: 'bg-red-400' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setVal('availability', opt.value)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                                form.availability === opt.value
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                  : 'border-gray-200 dark:border-dark-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-xl ${getAvailabilityBadge(profile?.availability || 'available').class}`}>
                          <span className="w-2 h-2 rounded-full bg-current mr-2 opacity-70" />
                          {getAvailabilityBadge(profile?.availability || 'available').label}
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Summary</p>
                      {editing ? (
                        <textarea value={form.summary} onChange={set('summary')} rows={4} placeholder="Tell us about yourself..." className="input-field text-sm resize-none w-full" />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">
                          {profile?.summary || <span className="italic text-gray-400">No summary yet. Upload your resume to auto-generate one.</span>}
                        </p>
                      )}
                    </div>

                    {/* Social links */}
                    <div className="pt-5 border-t border-gray-100 dark:border-dark-700">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Social Links</p>
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { icon: Linkedin, label: 'LinkedIn', field: 'linkedIn', placeholder: 'https://linkedin.com/in/...' },
                          { icon: Github, label: 'GitHub', field: 'github', placeholder: 'https://github.com/...' },
                          { icon: Globe, label: 'Portfolio', field: 'portfolio', placeholder: 'https://yoursite.com' },
                        ].map(({ icon: Icon, label, field, placeholder }) => (
                          <Field key={field} icon={Icon} label={label}>
                            {editing ? (
                              <input type="url" value={form[field]} onChange={set(field)} placeholder={placeholder} className="input-field text-sm w-full" />
                            ) : profile?.[field] ? (
                              <a href={profile[field]} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:text-primary-600 transition-colors truncate block">
                                {profile[field]}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Not added</span>
                            )}
                          </Field>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── Skills section (employees only) ── */}
            {isEmployee && activeSection === 'skills' && (
              <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

                {editing && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{form.skills?.length || 0} skills</p>
                    <button
                      onClick={addSkill}
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl transition-colors"
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                )}

                {/* Editable skill rows */}
                {editing ? (
                  <>
                    {form.skills?.length > 0 && (
                      <div className="grid grid-cols-12 gap-2 px-3 text-xs text-gray-400 font-medium">
                        <div className="col-span-4">Skill Name</div>
                        <div className="col-span-3">Category</div>
                        <div className="col-span-3">Proficiency</div>
                        <div className="col-span-1 text-center">Yrs</div>
                        <div className="col-span-1" />
                      </div>
                    )}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      <AnimatePresence>
                        {form.skills?.map((skill, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl"
                          >
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={skill.name}
                                onChange={e => updateSkill(idx, 'name', e.target.value)}
                                placeholder="Skill name"
                                className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                              />
                            </div>
                            <div className="col-span-3">
                              <select
                                value={skill.category}
                                onChange={e => updateSkill(idx, 'category', e.target.value)}
                                className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="col-span-3">
                              <select
                                value={skill.proficiency}
                                onChange={e => updateSkill(idx, 'proficiency', e.target.value)}
                                className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div className="col-span-1">
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={skill.yearsOfExperience}
                                onChange={e => updateSkill(idx, 'yearsOfExperience', e.target.value)}
                                className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg px-1.5 py-1.5 text-xs text-center text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                onClick={() => removeSkill(idx)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {!form.skills?.length && (
                        <div className="text-center py-10 text-gray-400">
                          <Code size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No skills yet. Click "Add Skill" to start.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* View mode — chips */
                  <div className="space-y-4">
                    {profile?.skills?.filter(s => !s.isInferred).length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.filter(s => !s.isInferred).map(skill => (
                            <span key={skill.name} className={`text-sm px-3 py-1.5 rounded-xl font-medium ${getProficiencyColor(skill.proficiency)}`}>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                        {profile.skills.filter(s => s.isInferred).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Star size={11} /> AI Inferred
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.filter(s => s.isInferred).map(skill => (
                                <span key={skill.name} className="text-xs px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg font-medium">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <Code size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No skills yet. Upload your resume or click Edit Profile to add skills.</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}

function EditableHint({ children, onClick }) {
  return (
    <div className="group inline-flex items-center gap-1.5 cursor-pointer" onClick={onClick} title="Click to edit">
      <span className="text-sm font-medium text-gray-900 dark:text-white">{children}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-dark-700 text-gray-400 hover:text-primary-500 flex-shrink-0">
        <Edit3 size={11} />
      </span>
    </div>
  )
}
