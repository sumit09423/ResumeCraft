import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService, adminService, userService } from '../../api'
import { UserIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = adminService.isAdmin()
  const currentUser = authService.getCurrentUser()
  const adminUser = adminService.getAdminUser()
  const [profilePicture, setProfilePicture] = useState(null)

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchUserProfile()
    }
  }, [isAuthenticated, isAdmin])

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile()
      if (response.success && response.data.profilePicture) {
        setProfilePicture(response.data.profilePicture)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleLogout = () => {
    if (isAdmin) {
      adminService.clearAdminData()
    } else {
      authService.clearAuthData()
    }
    window.location.href = '/'
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                ResumeCraft
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {!isAuthenticated && !isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Home
                </Link>
                <a href="#templates" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Templates</a>
                <a href="#pricing" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Pricing</a>
                <a href="#contact" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Contact</a>
              </>
            ) : isAuthenticated && !isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Home
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Dashboard
                </Link>
                <Link to="/resume/create" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Create Resume
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Admin Dashboard
                </Link>
                <Link to="/admin/users" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Manage Users
                </Link>
                <Link to="/admin/resumes" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Manage Resumes
                </Link>
              </>
            ) : null}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated || isAdmin ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-3 text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors">
                    {/* Profile Picture */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span>
                      Welcome, {isAdmin ? (adminUser?.name || 'Admin') : (currentUser?.firstName && currentUser?.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.firstName || 'User')}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {!isAdmin && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          Profile
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
