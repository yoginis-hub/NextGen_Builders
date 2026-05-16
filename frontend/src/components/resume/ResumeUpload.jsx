import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ResumeUpload({ onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const fileInputRef = useRef(null)

  const stages = [
    { key: 'extract', label: 'Extracting PDF text...', pct: 25 },
    { key: 'ai', label: 'AI analyzing resume...', pct: 60 },
    { key: 'infer', label: 'Inferring related skills...', pct: 85 },
    { key: 'save', label: 'Saving to profile...', pct: 100 },
  ]

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)

    // Simulate staged progress
    for (const s of stages) {
      setStage(s.label)
      setProgress(s.pct - 20)
      await new Promise(r => setTimeout(r, 600))
    }

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await api.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 20)
          setProgress(pct)
        }
      })

      setProgress(100)
      setStage('Complete!')
      toast.success(`Resume processed! Found ${res.data.data.extractedSkillsCount} skills + ${res.data.data.inferredSkillsCount} inferred skills`)
      setTimeout(() => {
        onSuccess?.(res.data.data.employee)
        setFile(null)
        setUploading(false)
        setProgress(0)
      }, 1000)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : file
            ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <FileText size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
              >
                <X size={12} /> Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-dark-700'}`}>
                <Upload size={28} className={dragging ? 'text-primary-500' : 'text-gray-400'} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Drop your resume here</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or click to browse • PDF only • Max 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-primary-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{stage}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Processing with Claude AI...</p>
              </div>
              <span className="text-sm font-bold text-primary-500">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI features callout */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🧠', label: 'AI Extraction' },
          { icon: '🔗', label: 'Skill Inference' },
          { icon: '📊', label: 'Categorization' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl text-center">
            <span className="text-xl">{icon}</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      <motion.button
        onClick={handleUpload}
        disabled={!file || uploading}
        whileHover={{ scale: !file || uploading ? 1 : 1.01 }}
        whileTap={{ scale: !file || uploading ? 1 : 0.99 }}
        className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
        ) : (
          <><Upload size={18} /> Upload & Analyze Resume</>
        )}
      </motion.button>
    </div>
  )
}
