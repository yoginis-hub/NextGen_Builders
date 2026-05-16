import { motion } from 'framer-motion'
import AppIcon from './AppIcon'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-dark-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-glow">
            <AppIcon className="w-8 h-8" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary-400"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold gradient-text">SkillSync AI</h2>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-500"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
