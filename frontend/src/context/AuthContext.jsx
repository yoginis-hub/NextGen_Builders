import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

// If company email is set, use it as the primary email throughout the app
const normalizeUser = (u) => {
  if (!u) return u
  if (u.companyEmail) return { ...u, email: u.companyEmail }
  return u
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('skillsync-token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(normalizeUser(res.data.user))
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('skillsync-token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    const normalized = normalizeUser(newUser)
    setUser(normalized)
    return normalized
  }

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('skillsync-token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    const normalized = normalizeUser(newUser)
    setUser(normalized)
    return normalized
  }

  const logout = useCallback(() => {
    localStorage.removeItem('skillsync-token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = (updates) => setUser(prev => {
    const merged = { ...prev, ...updates }
    // When company email is set, also update the displayed email
    if (updates.companyEmail) merged.email = updates.companyEmail
    return merged
  })

  const hasCompanyEmail = !!user?.companyEmail || user?.email?.endsWith('@skillsync.ai')
  const needsCompanyEmail = !!user && !hasCompanyEmail

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser, isHR: user?.role === 'hr', isEmployee: user?.role === 'employee', needsCompanyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
