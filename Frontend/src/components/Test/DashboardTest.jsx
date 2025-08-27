import { useState, useEffect } from 'react'
import { authService, adminService } from '../../api'
import Header from '../Layout/Header'

const DashboardTest = () => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAdmin: false,
    currentUser: null,
    adminUser: null
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const isAuthenticated = authService.isAuthenticated()
    const isAdmin = adminService.isAdmin()
    const currentUser = authService.getCurrentUser()
    const adminUser = adminService.getAdminUser()

    setAuthStatus({
      isAuthenticated,
      isAdmin,
      currentUser,
      adminUser
    })

    console.log('Auth Status:', {
      isAuthenticated,
      isAdmin,
      currentUser,
      adminUser
    })
  }

  const simulateLogin = () => {
    // Simulate user login
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    }))
    checkAuthStatus()
  }

  const simulateAdminLogin = () => {
    // Simulate admin login
    localStorage.setItem('adminToken', 'mock-admin-token')
    localStorage.setItem('adminRole', 'admin')
    localStorage.setItem('adminUser', JSON.stringify({
      name: 'Admin User',
      role: 'admin'
    }))
    checkAuthStatus()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    localStorage.removeItem('adminUser')
    checkAuthStatus()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Test</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Is Authenticated:</strong> {authStatus.isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Is Admin:</strong> {authStatus.isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>Current User:</strong> {authStatus.currentUser ? JSON.stringify(authStatus.currentUser) : 'None'}</p>
              <p><strong>Admin User:</strong> {authStatus.adminUser ? JSON.stringify(authStatus.adminUser) : 'None'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
            <div className="space-x-4">
              <button
                onClick={simulateLogin}
                className="btn-primary"
              >
                Simulate User Login
              </button>
              <button
                onClick={simulateAdminLogin}
                className="btn-secondary"
              >
                Simulate Admin Login
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Navigation Links</h2>
            <div className="space-y-2">
              <a href="/dashboard" className="block text-orange-600 hover:text-orange-800">
                → User Dashboard (/dashboard)
              </a>
              <a href="/admin/dashboard" className="block text-orange-600 hover:text-orange-800">
                → Admin Dashboard (/admin/dashboard)
              </a>
              <a href="/resume/create" className="block text-orange-600 hover:text-orange-800">
                → Create Resume (/resume/create)
              </a>
              <a href="/login" className="block text-orange-600 hover:text-orange-800">
                → Login (/login)
              </a>
              <a href="/register" className="block text-orange-600 hover:text-orange-800">
                → Register (/register)
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardTest
