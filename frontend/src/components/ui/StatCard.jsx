import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-500', ring: 'ring-blue-500/20' },
    green: { bg: 'bg-green-500/10', icon: 'text-green-500', ring: 'ring-green-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', ring: 'ring-purple-500/20' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-500', ring: 'ring-orange-500/20' },
    pink: { bg: 'bg-pink-500/10', icon: 'text-pink-500', ring: 'ring-pink-500/20' },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trendValue}% this month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </motion.div>
  )
}
