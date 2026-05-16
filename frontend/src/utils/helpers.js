export const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const timeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diff = Math.floor((now - past) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(date)
}

export const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export const getProficiencyColor = (proficiency) => {
  const colors = {
    'Expert': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Advanced': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Intermediate': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Beginner': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[proficiency] || colors['Beginner']
}

export const getCategoryColor = (category) => {
  const colors = {
    'Language': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    'Framework': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    'Database': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    'DevOps': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    'Cloud': 'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
    'Tool': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    'Platform': 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
    'Domain': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    'Other': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[category] || colors['Other']
}

export const getAvailabilityBadge = (availability) => {
  const config = {
    'available': { label: 'Available', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'busy': { label: 'Busy', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    'on-leave': { label: 'On Leave', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    'notice-period': { label: 'Notice Period', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  }
  return config[availability] || config['available']
}

export const getStatusBadge = (status) => {
  const config = {
    'approved': { label: 'Approved', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    'pending': { label: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    'rejected': { label: 'Rejected', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }
  return config[status] || config['pending']
}

export const matchPercentageColor = (percentage) => {
  if (percentage >= 80) return 'text-green-500'
  if (percentage >= 60) return 'text-blue-500'
  if (percentage >= 40) return 'text-yellow-500'
  return 'text-gray-400'
}

export const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
  'from-teal-500 to-green-600',
  'from-amber-500 to-orange-600',
]

export const getAvatarColor = (name) => {
  const idx = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return avatarColors[idx % avatarColors.length]
}
