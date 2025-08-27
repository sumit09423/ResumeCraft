import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeService, authService, userService } from '../../api'
import Header from '../Layout/Header'
import UserStats from './UserStats'
import ToastContainer from '../Common/ToastContainer'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const UserDashboard = () => {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    template: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [openDropdown, setOpenDropdown] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    console.log('UserDashboard mounted, currentUser:', currentUser)
    fetchUserData()
    fetchUserProfile()
  }, [filters])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

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

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching user data...')
      
      // Fetch real data using new API structure
      try {
        const resumesResponse = await resumeService.getAll(filters)
        
        if (resumesResponse && resumesResponse.data) {
          // Apply client-side filtering if needed
          let filteredResumes = resumesResponse.data
          
          // Filter by status
          if (filters.status) {
            filteredResumes = filteredResumes.filter(resume => resume.status === filters.status)
          }
          
          // Filter by template
          if (filters.template) {
            filteredResumes = filteredResumes.filter(resume => resume.template === filters.template)
          }
          
          // Sort resumes
          filteredResumes.sort((a, b) => {
            const aValue = a[filters.sortBy] || a.createdAt
            const bValue = b[filters.sortBy] || b.createdAt
            
            if (filters.sortOrder === 'asc') {
              return new Date(aValue) - new Date(bValue)
            } else {
              return new Date(bValue) - new Date(aValue)
            }
          })
          
          setResumes(filteredResumes)
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError)

        const mockResumes = [
          {
            id: '1',
            title: 'Professional Resume',
            template: 'modern',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Creative Resume',
            template: 'creative',
            status: 'approved',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Classic Resume',
            template: 'classic',
            status: 'rejected',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
        
        // Apply client-side filtering to mock data
        let filteredResumes = mockResumes
        
        // Filter by status
        if (filters.status) {
          filteredResumes = filteredResumes.filter(resume => resume.status === filters.status)
        }
        
        // Filter by template
        if (filters.template) {
          filteredResumes = filteredResumes.filter(resume => resume.template === filters.template)
        }
        
        // Sort resumes
        filteredResumes.sort((a, b) => {
          const aValue = a[filters.sortBy] || a.createdAt
          const bValue = b[filters.sortBy] || b.createdAt
          
          if (filters.sortOrder === 'asc') {
            return new Date(aValue) - new Date(bValue)
          } else {
            return new Date(bValue) - new Date(aValue)
          }
        })
        
        setResumes(filteredResumes)
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResume = async (resumeId) => {
    const resume = resumes.find(r => (r.id || r._id) === resumeId)
    setResumeToDelete(resume)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      await resumeService.delete(resumeToDelete.id || resumeToDelete._id)
      window.showToast('Resume deleted successfully!', 'success')
      fetchUserData() // Refresh data
    } catch (error) {
      console.error('Error deleting resume:', error)
      window.showToast('Failed to delete resume. Please try again.', 'error')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setResumeToDelete(null)
    }
  }





  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTemplateIcon = (template) => {
    const icons = {
      modern: '🎨',
      professional: '💼',
      creative: '✨',
      classic: '📄'
    }
    return icons[template] || '📄'
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUserData}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ToastContainer />
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {currentUser?.firstName && currentUser?.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser?.firstName || 'User'}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your resumes and track your progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserStats />
        </div>

        {/* Resumes Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Resumes</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  <Link 
                    to="/resume-builder" 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Resume
                  </Link>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                      <select
                        value={filters.template}
                        onChange={(e) => setFilters({ ...filters, template: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Templates</option>
                        <option value="modern">Modern</option>
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="classic">Classic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="updatedAt">Updated Date</option>
                        <option value="title">Title</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                      <select
                        value={filters.sortOrder}
                        onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-gray-600 mb-6">Create your first resume to get started</p>
                <Link to="/resume-builder" className="btn-primary">
                  Create Your First Resume
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume) => (
                    <div key={resume.id || resume._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getTemplateIcon(resume.template)}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">
                                {resume.title || `${resume.firstName} ${resume.lastName}`}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">{resume.template || 'modern'} Template</p>
                            </div>
                          </div>
                          {getStatusBadge(resume.status)}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                          <p>Created: {new Date(resume.createdAt).toLocaleDateString()}</p>
                          <p>Updated: {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex justify-end mb-4">
                          <div className="relative dropdown-container">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === resume.id ? null : resume.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Actions
                              <svg className="-mr-1 ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Dropdown menu */}
                            {openDropdown === resume.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  <Link
                                    to={`/resume/${resume.id || resume._id}`}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    role="menuitem"
                                  >
                                    <EyeIcon className="mr-3 h-4 w-4 text-blue-500" />
                                    View
                                  </Link>
                                  <Link
                                    to={`/resume-builder/${resume.id || resume._id}`}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    role="menuitem"
                                  >
                                    <PencilIcon className="mr-3 h-4 w-4 text-green-500" />
                                    Edit
                                  </Link>

                                  <button
                                    onClick={() => handleDeleteResume(resume.id || resume._id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    role="menuitem"
                                  >
                                    <TrashIcon className="mr-3 h-4 w-4 text-red-500" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>


                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            {/* Quick Actions section removed as requested */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && resumeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Resume</h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{resumeToDelete.title || `${resumeToDelete.firstName} ${resumeToDelete.lastName}`}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setResumeToDelete(null)
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserDashboard
