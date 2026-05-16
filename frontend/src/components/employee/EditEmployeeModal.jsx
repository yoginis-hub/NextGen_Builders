import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Save, Camera, Edit3, Phone, MapPin, Briefcase,
  Globe, Github, Linkedin, Code, Plus, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getAvatarColor, getInitials, getAvailabilityBadge } from '../../utils/helpers'

const CATEGORIES = ['Language', 'Framework', 'Database', 'DevOps', 'Cloud', 'Tool', 'Platform', 'Domain', 'Other']
const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export default function EditEmployeeModal({ employee, isOpen, onClose, onSaved }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('info')
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (isOpen && employee) {
      setForm({
        name: employee.name || '',
        role: employee.role || '',
        location: employee.location || '',
        phone: employee.phone || '',
        summary: employee.summary || '',
        totalYearsOfExperience: employee.totalYearsOfExperience || 0,
        availability: employee.availability || 'available',
        linkedIn: employee.linkedIn || '',
        github: employee.github || '',
        portfolio: employee.portfolio || '',
        skills: employee.skills?.filter(s => !s.isInferred) || [],
        avatar: employee.avatar || null,
      })
      setActiveSection('info')
    }
  }, [isOpen, employee])

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }))
  const setE = (field) => (e) => set(field, e.target.value)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => set('avatar', ev.target.result)
    reader.readAsDataURL(file)
  }

  const addSkill = () => set('skills', [...form.skills, { name: '', category: 'Other', proficiency: 'Intermediate', yearsOfExperience: 0 }])
  const removeSkill = (idx) => set('skills', form.skills.filter((_, i) => i !== idx))
  const updateSkill = (idx, field, value) => {
    const updated = [...form.skills]
    updated[idx] = { ...updated[idx], [field]: value }
    set('skills', updated)
  }

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Name is required'); return }
    const invalidSkill = form.skills.find(s => !s.name.trim())
    if (invalidSkill) { toast.error('All skills must have a name'); return }
    setSaving(true)
    try {
      const res = await api.put(`/employees/${employee._id}`, {
        ...form,
        totalYearsOfExperience: Number(form.totalYearsOfExperience),
        skills: form.skills.map(s => ({ ...s, yearsOfExperience: Number(s.yearsOfExperience || 0) })),
      })
      toast.success('Profile updated!')
      onSaved?.(res.data.data)
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !employee) return null

  const displayName = form.name || employee.name || ''

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl glass-card max-h-[92vh] overflow-hidden flex flex-col"
          >

            {/* ── Cover + Avatar (no separate modal title bar) ── */}
            <div className="relative flex-shrink-0">
              <div className="h-24 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
              </div>

              {/* Close button on cover */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={16} />
              </button>

              {/* Avatar */}
              <div className="absolute left-6 bottom-0 translate-y-1/2">
                <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt={displayName}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-dark-800 shadow-xl"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(displayName)} flex items-center justify-center text-white text-xl font-black ring-4 ring-white dark:ring-dark-800 shadow-xl`}>
                      {getInitials(displayName)}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={16} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-dark-800 shadow-md pointer-events-none">
                    <Edit3 size={9} className="text-white" />
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>

              {/* Save / Cancel on right */}
              <div className="absolute right-6 bottom-0 translate-y-full pt-3 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all disabled:opacity-50 shadow-md shadow-primary-500/25"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save size={13} />}
                  Save Changes
                </button>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="overflow-y-auto flex-1 px-6 pt-12 pb-6 space-y-5">

              {/* Name */}
              <div>
                <input
                  type="text"
                  value={form.name}
                  onChange={setE('name')}
                  placeholder="Full name"
                  className="input-field text-xl font-bold w-full"
                />
              </div>

              {/* Read-only info row */}
              <div className="flex flex-wrap items-center gap-3 -mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</span>
              </div>

              {/* Section tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl w-fit">
                {[
                  { key: 'info', label: 'Profile Info' },
                  { key: 'skills', label: `Skills (${form.skills?.length || 0})` },
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

              <AnimatePresence mode="wait">

                {/* ── Profile Info section ── */}
                {activeSection === 'info' && (
                  <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-dark-700" />

                    {/* Fields grid */}
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">

                      <FieldWrap icon={Briefcase} label="Job Role">
                        <input type="text" value={form.role} onChange={setE('role')} placeholder="e.g. Senior Developer" className="input-field text-sm w-full" />
                      </FieldWrap>

                      <FieldWrap icon={Phone} label="Phone">
                        <input type="tel" value={form.phone} onChange={setE('phone')} placeholder="+91 99999 99999" className="input-field text-sm w-full" />
                      </FieldWrap>

                      <FieldWrap icon={MapPin} label="Location">
                        <input type="text" value={form.location} onChange={setE('location')} placeholder="City, Country" className="input-field text-sm w-full" />
                      </FieldWrap>

                      <FieldWrap icon={Star} label="Experience (yrs)">
                        <input type="number" min="0" max="50" value={form.totalYearsOfExperience} onChange={setE('totalYearsOfExperience')} className="input-field text-sm w-full" />
                      </FieldWrap>
                    </div>

                    {/* Availability */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Availability</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'available', label: 'Available', dot: 'bg-green-500' },
                          { value: 'busy', label: 'Busy', dot: 'bg-blue-500' },
                          { value: 'on-leave', label: 'On Leave', dot: 'bg-orange-400' },
                          { value: 'notice-period', label: 'Notice Period', dot: 'bg-red-400' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => set('availability', opt.value)}
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
                    </div>

                    {/* Summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</p>
                      <textarea
                        value={form.summary}
                        onChange={setE('summary')}
                        rows={3}
                        placeholder="Professional summary..."
                        className="input-field text-sm resize-none w-full"
                      />
                    </div>

                    {/* Social links */}
                    <div className="pt-4 border-t border-gray-100 dark:border-dark-700">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Social Links</p>
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { icon: Linkedin, label: 'LinkedIn', field: 'linkedIn', placeholder: 'https://linkedin.com/in/...' },
                          { icon: Github, label: 'GitHub', field: 'github', placeholder: 'https://github.com/...' },
                          { icon: Globe, label: 'Portfolio', field: 'portfolio', placeholder: 'https://yoursite.com' },
                        ].map(({ icon: Icon, label, field, placeholder }) => (
                          <div key={field} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                              <Icon size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
                              <input
                                type="url"
                                value={form[field]}
                                onChange={setE(field)}
                                placeholder={placeholder}
                                className="input-field text-sm w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Skills section ── */}
                {activeSection === 'skills' && (
                  <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="border-t border-gray-100 dark:border-dark-700" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{form.skills?.length || 0} skills</p>
                      <button
                        onClick={addSkill}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl transition-colors"
                      >
                        <Plus size={14} /> Add Skill
                      </button>
                    </div>

                    {form.skills?.length > 0 && (
                      <div className="grid grid-cols-12 gap-2 px-3 text-xs text-gray-400 font-medium">
                        <div className="col-span-4">Skill Name</div>
                        <div className="col-span-3">Category</div>
                        <div className="col-span-3">Proficiency</div>
                        <div className="col-span-1 text-center">Yrs</div>
                        <div className="col-span-1" />
                      </div>
                    )}

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function FieldWrap({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}
