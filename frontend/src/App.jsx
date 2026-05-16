import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import HRDashboard from './pages/HRDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeDirectory from './pages/EmployeeDirectory'
import AISearch from './pages/AISearch'
import ReviewQueue from './pages/ReviewQueue'
import TeamBuilder from './pages/TeamBuilder'
import ImportEmployees from './pages/ImportEmployees'
import Profile from './pages/Profile'
import ManageHR from './pages/ManageHR'
import SetupCompanyEmail from './pages/SetupCompanyEmail'
import LoadingScreen from './components/ui/LoadingScreen'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, needsCompanyEmail } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (needsCompanyEmail) return <Navigate to="/setup-company-email" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} replace />
  }
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} /> : <Register />} />
        <Route path="/setup-company-email" element={!user ? <Navigate to="/login" replace /> : <SetupCompanyEmail />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* HR Routes */}
        <Route path="/hr/dashboard" element={
          <ProtectedRoute allowedRoles={['hr']}><HRDashboard /></ProtectedRoute>
        } />
        <Route path="/hr/search" element={
          <ProtectedRoute allowedRoles={['hr']}><AISearch /></ProtectedRoute>
        } />
        <Route path="/hr/reviews" element={
          <ProtectedRoute allowedRoles={['hr']}><ReviewQueue /></ProtectedRoute>
        } />
        <Route path="/hr/team-builder" element={
          <ProtectedRoute allowedRoles={['hr']}><TeamBuilder /></ProtectedRoute>
        } />
        <Route path="/hr/import" element={
          <ProtectedRoute allowedRoles={['hr']}><ImportEmployees /></ProtectedRoute>
        } />
        <Route path="/hr/directory" element={
          <ProtectedRoute allowedRoles={['hr']}><EmployeeDirectory /></ProtectedRoute>
        } />
        <Route path="/hr/manage-hr" element={
          <ProtectedRoute allowedRoles={['hr']}><ManageHR /></ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={
          <ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>
        } />
        <Route path="/employee/directory" element={
          <ProtectedRoute allowedRoles={['employee']}><EmployeeDirectory /></ProtectedRoute>
        } />

        {/* Shared Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} />
          : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
