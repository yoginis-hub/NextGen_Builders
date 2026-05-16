import { motion } from 'framer-motion'

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
  }
}

export const SkeletonBox = ({ className = '' }) => (
  <motion.div
    {...shimmer}
    className={`rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-dark-700 dark:via-dark-600 dark:to-dark-700 bg-[length:400%_100%] ${className}`}
  />
)

export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <SkeletonBox className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonBox className="h-3 w-full" />
    <SkeletonBox className="h-3 w-5/6" />
    <div className="flex gap-2">
      <SkeletonBox className="h-6 w-16 rounded-lg" />
      <SkeletonBox className="h-6 w-20 rounded-lg" />
      <SkeletonBox className="h-6 w-14 rounded-lg" />
    </div>
  </div>
)

export const SkeletonStatCard = () => (
  <div className="glass-card p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-8 w-16" />
        <SkeletonBox className="h-3 w-20" />
      </div>
      <SkeletonBox className="w-12 h-12 rounded-xl flex-shrink-0" />
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 glass-card">
        <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
        <SkeletonBox className="h-4 flex-1" />
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-6 w-16 rounded-lg" />
      </div>
    ))}
  </div>
)

export default SkeletonCard
