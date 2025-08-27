import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService, adminService, userService } from '../../api'
import { 
  UserIcon, 
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Header = () => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = adminService.isAdmin()
  const currentUser = authService.getCurrentUser()
  const adminUser = adminService.getAdminUser()
  const [profilePicture, setProfilePicture] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const closeMenus = () => {
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  const getUserDisplayName = () => {
    if (isAdmin) {
      return adminUser?.name || 'Admin'
    }
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`
    }
    return currentUser?.firstName || 'User'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-dropdown-container')) {
        setUserMenuOpen(false)
      }
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen, mobileMenuOpen])



  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3" onClick={closeMenus}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                <span className="text-white font-bold text-sm sm:text-base">R</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 hidden sm:block">
                ResumeCraft
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {!isAuthenticated && !isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Home
                </Link>
                <a href="#templates" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">Templates</a>
                <a href="#pricing" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">Pricing</a>
                <a href="#contact" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">Contact</a>
              </>
            ) : isAuthenticated && !isAdmin ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Home
                </Link>
                <Link to="/resume/create" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Create Resume
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Admin Dashboard
                </Link>
                <Link to="/admin/users" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Manage Users
                </Link>
                <Link to="/admin/resumes" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Manage Resumes
                </Link>
              </>
            ) : null}
          </nav>
          
          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated || isAdmin ? (
              <div className="flex items-center space-x-4">
                <div className="relative user-dropdown-container">
                  <button 
                    className="flex items-center space-x-2 text-base text-gray-600 hover:text-orange-500 font-medium transition-colors"
                    onClick={toggleUserMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    <span className="hidden xl:block max-w-32 truncate">
                      Welcome, {getUserDisplayName()}
                    </span>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Enhanced Desktop User Dropdown Menu */}
                  {userMenuOpen && !isAdmin && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {profilePicture ? (
                              <img 
                                src={profilePicture} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {currentUser?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Navigation Links */}
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={closeMenus}
                        >
                          <HomeIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/resume/create"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={closeMenus}
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Create Resume
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={closeMenus}
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={closeMenus}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Settings
                        </Link>
                        <Link
                          to="/stats"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={closeMenus}
                        >
                          <ChartBarIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Statistics
                        </Link>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-100"></div>
                      
                      {/* Logout */}
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-gray-400" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Sign In
                </Link>
                <Link to="/admin/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-base whitespace-nowrap">
                  Admin Login
                </Link>
                <Link to="/register" className="btn-primary text-base px-4 py-2 whitespace-nowrap">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button and Actions */}
          <div className="lg:hidden flex items-center space-x-2">
            {isAuthenticated || isAdmin ? (
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium max-w-16 sm:max-w-20 truncate hidden xs:block">
                  {getUserDisplayName()}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-xs sm:text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors px-2 py-1">
                  Sign In
                </Link>
                <Link to="/admin/login" className="text-xs sm:text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors px-2 py-1">
                  Admin
                </Link>
                <Link to="/register" className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
                  Get Started
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>


    </header>
  )
}

export default Header
