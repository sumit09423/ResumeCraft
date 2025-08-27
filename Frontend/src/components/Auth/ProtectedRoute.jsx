import { Navigate, useLocation } from 'react-router-dom'
import { authService, adminService } from '../../api'

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = adminService.isAdmin()

  // If admin access is required
  if (requireAdmin) {
    // If not admin, redirect to admin login
    if (!isAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }
    // If admin is already logged in and trying to access admin login, redirect to dashboard
    if (location.pathname === '/admin/login') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return children
  }

  // If regular authentication is required
  if (requireAuth) {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    // If authenticated user trying to access login/register, redirect to dashboard
    if (location.pathname === '/login' || location.pathname === '/register') {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  // If no authentication required (public routes like login/register)
  // If user is already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
