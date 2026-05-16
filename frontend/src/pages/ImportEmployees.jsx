import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  Users, ArrowRight, RefreshCw, X, Copy, KeyRound,
  Sparkles, MapPin, Briefcase, ChevronDown, ChevronUp, Trash2,
  UserPlus, Plus, Mail, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getAvatarColor, getInitials, getProficiencyColor } from '../utils/helpers'

const STEPS = ['upload', 'processing', 'preview', 'importing', 'done']

const EMPTY_ROW = () => ({ name: '', email: '', role: '', location: '', totalYearsOfExperience: '' })

export default function ImportEmployees() {
  const [activeTab, setActiveTab] = useState('pdf')

  // PDF import state
  const [step, setStep] = useState('upload')
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [processingIndex, setProcessingIndex] = useState(0)
  const fileInputRef = useRef(null)

  // Direct import state
  const [directRows, setDirectRows] = useState([EMPTY_ROW()])
  const [directImporting, setDirectImporting] = useState(false)
  const [directResult, setDirectResult] = useState(null)

  const addRow = () => setDirectRows(r => [...r, EMPTY_ROW()])
  const removeRow = (i) => setDirectRows(r => r.filter((_, idx) => idx !== i))
  const updateRow = (i, field, value) =>
    setDirectRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row))

  const handleDirectImport = async () => {
    const valid = directRows.filter(r => r.name.trim() && r.email.trim())
    if (valid.length === 0) {
      toast.error('Please fill in at least one employee with name and email')
      return
    }
    setDirectImporting(true)
    setDirectResult(null)
    try {
      const res = await api.post('/import/direct', { employees: valid })
      setDirectResult(res.data.data)
      toast.success(`${res.data.data.created} employee(s) added successfully!`)
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setDirectImporting(false)
    }
  }

  const resetDirect = () => {
    setDirectRows([EMPTY_ROW()])
    setDirectResult(null)
  }

  // ── File handling ─────────────────────────────────────────────
  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => {
      if (f.type !== 'application/pdf') {
        toast.error(`"${f.name}" is not a PDF`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 10MB limit`)
        return false
      }
      return true
    })
    if (pdfs.length === 0) return
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const fresh = pdfs.filter(f => !existing.has(f.name))
      if (fresh.length < pdfs.length) toast(`${pdfs.length - fresh.length} duplicate(s) skipped`, { icon: 'ℹ️' })
      return [...prev, ...fresh]
    })
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  // ── Process PDFs → Claude ─────────────────────────────────────
  const handleProcess = async () => {
    if (files.length === 0) { toast.error('Please select at least one PDF'); return }

    setStep('processing')
    setProcessingIndex(0)

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('resumes', f))

      // Simulate per-file progress indicator
      const progressInterval = setInterval(() => {
        setProcessingIndex(p => Math.min(p + 1, files.length))
      }, 2500)

      const res = await api.post('/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      })

      clearInterval(progressInterval)
      setProcessingIndex(files.length)
      setPreview(res.data.data)
      setStep('preview')

      if (res.data.data.invalid > 0) {
        toast(`${res.data.data.valid} ready, ${res.data.data.invalid} need attention`, { icon: '⚠️' })
      } else {
        toast.success(`All ${res.data.data.valid} resumes extracted successfully!`)
      }
    } catch (err) {
      toast.error(err.message || 'Processing failed')
      setStep('upload')
    }
  }

  // ── Confirm import ────────────────────────────────────────────
  const handleConfirm = async () => {
    const validRows = preview.rows.filter(r => r.isValid)
    if (validRows.length === 0) { toast.error('No valid profiles to import'); return }

    setStep('importing')
    try {
      const res = await api.post('/import/confirm', { employees: validRows })
      setResult(res.data.data)
      setStep('done')
      toast.success(`${res.data.data.created} employees imported!`)
    } catch (err) {
      toast.error(err.message || 'Import failed')
      setStep('preview')
    }
  }

  const reset = () => {
    setStep('upload')
    setFiles([])
    setPreview(null)
    setResult(null)
    setExpandedRow(null)
    setProcessingIndex(0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Employees</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
          Add employees via PDF resume upload or fill in their details directly
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl w-fit">
        {[
          { key: 'pdf', label: 'Upload Resumes', icon: Upload },
          { key: 'direct', label: 'Direct Add', icon: UserPlus },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════ DIRECT IMPORT TAB ══════════ */}
      {activeTab === 'direct' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

          {!directResult ? (
            <>
              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40">
                <Mail size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Auto-generated Credentials</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    A unique password is created for each employee and emailed to them. Credentials are also shown on screen after import.
                  </p>
                </div>
              </div>

              {/* Employee cards */}
              <div className="space-y-3">
                <AnimatePresence>
                  {directRows.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="glass-card p-4 space-y-3"
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee {i + 1}</span>
                        </div>
                        <button
                          onClick={() => removeRow(i)}
                          disabled={directRows.length === 1}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Name + Email */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name <span className="text-red-400">*</span></label>
                          <input
                            value={row.name}
                            onChange={e => updateRow(i, 'name', e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email <span className="text-red-400">*</span></label>
                          <input
                            value={row.email}
                            onChange={e => updateRow(i, 'email', e.target.value)}
                            placeholder="email@example.com"
                            type="email"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Role + Location + Experience */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Role</label>
                          <input
                            value={row.role}
                            onChange={e => updateRow(i, 'role', e.target.value)}
                            placeholder="e.g. Frontend Dev"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</label>
                          <input
                            value={row.location}
                            onChange={e => updateRow(i, 'location', e.target.value)}
                            placeholder="e.g. Mumbai"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Experience (yrs)</label>
                          <input
                            value={row.totalYearsOfExperience}
                            onChange={e => updateRow(i, 'totalYearsOfExperience', e.target.value)}
                            placeholder="0"
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-400 transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add row + Import buttons */}
              <div className="flex gap-3">
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600 font-medium text-sm transition-colors border border-gray-200 dark:border-dark-600"
                >
                  <Plus size={16} /> Add Employee
                </button>
                <motion.button
                  onClick={handleDirectImport}
                  disabled={directImporting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-primary-500/20"
                >
                  {directImporting
                    ? <><RefreshCw size={17} className="animate-spin" /> Creating accounts...</>
                    : <><Send size={17} /> Import {directRows.filter(r => r.name && r.email).length || directRows.length} Employee{directRows.length !== 1 ? 's' : ''}</>
                  }
                </motion.button>
              </div>
            </>
          ) : (
            /* Direct import result */
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
              <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Employees Added!</h2>
                <div className="flex items-center justify-center gap-10">
                  <div>
                    <div className="text-4xl font-black text-green-500">{directResult.created}</div>
                    <div className="text-sm text-gray-500 mt-1">Accounts Created</div>
                  </div>
                  {directResult.skipped > 0 && (
                    <div>
                      <div className="text-4xl font-black text-orange-400">{directResult.skipped}</div>
                      <div className="text-sm text-gray-500 mt-1">Skipped</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Credentials */}
              {directResult.credentials?.length > 0 && (
                <div className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound size={16} className="text-primary-500" />
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Login Credentials</p>
                    </div>
                    <button
                      onClick={() => {
                        const text = directResult.credentials.map(c => `${c.name}\nEmail: ${c.email}\nPassword: ${c.password}`).join('\n\n')
                        navigator.clipboard.writeText(text)
                        toast.success('All credentials copied!')
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <Copy size={13} /> Copy All
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-dark-700/50">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Sent</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                        {directResult.credentials.map((cred, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700/50"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm">{cred.name}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">{cred.email}</td>
                            <td className="px-4 py-3">
                              <code className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold font-mono">
                                {cred.password}
                              </code>
                            </td>
                            <td className="px-4 py-3">
                              {cred.emailSent
                                ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"><CheckCircle size={12} /> Sent</span>
                                : <span className="flex items-center gap-1 text-xs text-orange-500 font-medium"><AlertTriangle size={12} /> Not sent</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`Email: ${cred.email}\nPassword: ${cred.password}`)
                                  toast.success(`Copied ${cred.name}'s credentials`)
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                              >
                                <Copy size={13} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {directResult.errors?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5"><AlertTriangle size={13} /> Skipped</p>
                      {directResult.errors.map((e, i) => (
                        <div key={i} className="text-xs p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                          {e.name}: {e.error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={resetDirect} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                <UserPlus size={18} /> Add More Employees
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ══════════ PDF IMPORT TAB ══════════ */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: 'upload', label: 'Upload PDFs' },
          { key: 'processing', label: 'AI Processing' },
          { key: 'preview', label: 'Preview' },
          { key: 'done', label: 'Done' },
        ].map((s, i, arr) => {
          const stepIdx = ['upload','processing','preview','importing','done'].indexOf(step)
          const thisIdx = ['upload','processing','preview','importing','done'].indexOf(s.key)
          const isDone = stepIdx > thisIdx
          const isActive = step === s.key || (s.key === 'preview' && step === 'importing')
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive ? 'bg-primary-500 text-white' :
                isDone ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                'bg-gray-100 dark:bg-dark-700 text-gray-400'
              }`}>
                {isDone ? <CheckCircle size={13} /> : <span className="w-4 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700" />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Upload ── */}
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* How it works */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Sparkles size={15} className="text-primary-500" /> How it works
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: '📄', step: '1', label: 'Upload PDFs', desc: 'Drop multiple resume PDFs' },
                  { icon: '🧠', step: '2', label: 'Claude Extracts', desc: 'AI reads each resume' },
                  { icon: '✅', step: '3', label: 'Review & Save', desc: 'Confirm and create accounts' },
                ].map(item => (
                  <div key={item.step} className="p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
              <Upload size={36} className={`mx-auto mb-3 transition-colors ${dragging ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'}`} />
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Drop PDF resumes here or click to browse
              </p>
              <p className="text-sm text-gray-400 mt-1">Select multiple files at once • PDF only • Max 10MB each • Up to 20 files</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {files.length} PDF{files.length > 1 ? 's' : ''} selected
                  </p>
                  <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-500 transition-colors">
                    Clear all
                  </button>
                </div>
                {files.map((file, i) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl"
                  >
                    <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.button
              onClick={handleProcess}
              disabled={files.length === 0}
              whileHover={{ scale: files.length === 0 ? 1 : 1.01 }}
              whileTap={{ scale: files.length === 0 ? 1 : 0.99 }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              Process {files.length > 0 ? `${files.length} Resume${files.length > 1 ? 's' : ''}` : 'Resumes'} with AI
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2: Processing ── */}
        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-ping" />
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                <Sparkles size={32} className="text-primary-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Claude is reading resumes...
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Extracting skills, experience, projects, and certifications from each PDF
              </p>
            </div>

            {/* Per-file progress */}
            <div className="space-y-2 max-w-sm mx-auto">
              {files.map((file, i) => (
                <div key={file.name} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all ${
                  i < processingIndex ? 'bg-green-50 dark:bg-green-900/20' :
                  i === processingIndex ? 'bg-primary-50 dark:bg-primary-900/20' :
                  'bg-gray-50 dark:bg-dark-700/50'
                }`}>
                  <div className="flex-shrink-0">
                    {i < processingIndex
                      ? <CheckCircle size={16} className="text-green-500" />
                      : i === processingIndex
                      ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      : <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-dark-500" />
                    }
                  </div>
                  <span className={`truncate text-xs font-medium ${
                    i < processingIndex ? 'text-green-600 dark:text-green-400' :
                    i === processingIndex ? 'text-primary-600 dark:text-primary-400' :
                    'text-gray-400'
                  }`}>{file.name}</span>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              {processingIndex} of {files.length} processed
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Preview ── */}
        {step === 'preview' && preview && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Resumes', value: preview.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Ready to Import', value: preview.valid, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'Need Attention', value: preview.invalid, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`glass-card p-4 text-center ${bg}`}>
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Extracted profiles */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {preview.rows.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card overflow-hidden border-2 ${
                    row.isValid
                      ? 'border-green-200 dark:border-green-800/40'
                      : 'border-red-200 dark:border-red-800/40'
                  }`}
                >
                  {/* Row header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                  >
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      row.isValid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {row.isValid
                        ? <CheckCircle size={18} className="text-green-500" />
                        : <XCircle size={18} className="text-red-500" />
                      }
                    </div>

                    {/* Avatar */}
                    {row.isValid && (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(row.name)} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}>
                        {getInitials(row.name)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {row.name || <span className="text-gray-400 italic">Name not found</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="truncate">{row.email || 'No email'}</span>
                        {row.location && (
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <MapPin size={10} /> {row.location}
                          </span>
                        )}
                        {row.totalYearsOfExperience > 0 && (
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Briefcase size={10} /> {row.totalYearsOfExperience}yr
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats + expand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {row.isValid && (
                        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg font-medium">
                            {row.extractedSkillsCount} skills
                          </span>
                          <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg font-medium">
                            +{row.inferredSkillsCount} inferred
                          </span>
                        </div>
                      )}
                      {!row.isValid && row.warnings?.map(w => (
                        <span key={w} className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                          {w}
                        </span>
                      ))}
                      {expandedRow === i ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {expandedRow === i && row.isValid && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 dark:border-dark-700 px-4 pb-4 pt-3 space-y-3"
                      >
                        {row.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-dark-700/50 rounded-xl p-3">
                            "{row.summary}"
                          </p>
                        )}
                        {/* PDF source */}
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <FileText size={12} className="text-red-400" /> {row.fileName}
                        </p>
                        {/* Skills */}
                        {row.skills?.filter(s => !s.isInferred).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Extracted Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {row.skills.filter(s => !s.isInferred).map(s => (
                                <span key={s.name} className={`text-xs px-2 py-0.5 rounded-md font-medium ${getProficiencyColor(s.proficiency)}`}>
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Inferred */}
                        {row.skills?.filter(s => s.isInferred).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {row.skills.filter(s => s.isInferred).map(s => (
                              <span key={s.name} className="text-xs px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-md font-medium">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Projects */}
                        {row.projects?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Projects ({row.projects.length})</p>
                            <div className="flex flex-wrap gap-1.5">
                              {row.projects.map(p => (
                                <span key={p.name} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600 font-medium text-sm transition-colors"
              >
                <X size={16} /> Start Over
              </button>
              <motion.button
                onClick={handleConfirm}
                disabled={preview.valid === 0}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                <Users size={18} />
                Create {preview.valid} Employee Account{preview.valid !== 1 ? 's' : ''}
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP: Importing ── */}
        {step === 'importing' && (
          <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-ping" />
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
                <RefreshCw size={28} className="text-primary-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Creating employee accounts...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Setting up profiles and saving to database</p>
          </motion.div>
        )}

        {/* ── STEP 4: Done ── */}
        {step === 'done' && result && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">

            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Import Complete!</h2>
              <div className="flex items-center justify-center gap-10">
                <div>
                  <div className="text-4xl font-black text-green-500">{result.created}</div>
                  <div className="text-sm text-gray-500 mt-1">Accounts Created</div>
                </div>
                {result.skipped > 0 && (
                  <div>
                    <div className="text-4xl font-black text-orange-400">{result.skipped}</div>
                    <div className="text-sm text-gray-500 mt-1">Skipped</div>
                  </div>
                )}
              </div>
            </div>

            {/* Credentials table */}
            {result.credentials?.length > 0 && (
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-primary-500" />
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Login Credentials</p>
                  </div>
                  <button
                    onClick={() => {
                      const text = result.credentials.map(c => `${c.name}\nEmail: ${c.email}\nPassword: ${c.password}`).join('\n\n')
                      navigator.clipboard.writeText(text)
                      toast.success('All credentials copied!')
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <Copy size={13} /> Copy All
                  </button>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/40">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Share these credentials with employees so they can log in. All use the same default password.
                  </p>
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-dark-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-dark-700/50">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Password</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                      {result.credentials.map((cred, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm">{cred.name}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">{cred.email}</td>
                          <td className="px-4 py-3">
                            <code className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold font-mono">
                              {cred.password}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Email: ${cred.email}\nPassword: ${cred.password}`)
                                toast.success(`Copied ${cred.name}'s credentials`)
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                              <Copy size={13} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Skipped errors */}
            {result.errors?.length > 0 && (
              <div className="glass-card p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-orange-500" /> Skipped ({result.errors.length})
                </p>
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <FileText size={12} className="text-orange-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 flex-1">{e.fileName}</span>
                    <span className="text-orange-600 dark:text-orange-400">{e.error}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={reset} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
              <Upload size={18} /> Import More Resumes
            </button>
          </motion.div>
        )}

      </AnimatePresence>
        </div>
      )}

    </div>
  )
}
