import { useState, useEffect } from 'react'
import { adminService } from '../../api'
import AdminLayout from './Layout/AdminLayout'
import { 
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalUsers: 0,
      activeUsers: 0,
      totalResumes: 0,
      pendingResumes: 0,
      approvedResumes: 0,
      publishedResumes: 0
    },
    recentUsers: [],
    recentResumes: [],
    templateStats: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true)
      const response = await adminService.getDashboardStats()
      // Handle the nested data structure from the API
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setDashboardData(response)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'published':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAdminStats}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
              <p className="text-orange-100 text-sm sm:text-base lg:text-lg">Monitor and manage your resume builder platform</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-orange-100 text-xs sm:text-sm">Total Platform Activity</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {dashboardData.statistics?.totalUsers + dashboardData.statistics?.totalResumes}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl mb-2 sm:mb-3">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Users</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{dashboardData.statistics?.totalUsers || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl mb-2 sm:mb-3">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Users</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{dashboardData.statistics?.activeUsers || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl mb-2 sm:mb-3">
                <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Resumes</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{dashboardData.statistics?.totalResumes || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl mb-2 sm:mb-3">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Pending</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{dashboardData.statistics?.pendingResumes || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl mb-2 sm:mb-3">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Approved</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900">{dashboardData.statistics?.approvedResumes || 0}</p>
            </div>
          </div>
        </div>

        {/* Template Statistics */}
        {dashboardData.templateStats && dashboardData.templateStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-orange-600" />
                Template Usage Statistics
              </h2>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">Distribution of resume templates across the platform</p>
            </div>
                        <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {dashboardData.templateStats.map((template) => (
                  <div key={template._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 capitalize mb-1">{template._id}</h3>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{template.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" />
                Recent Users
              </h2>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">Latest registered users on the platform</p>
            </div>
            <div className="p-4 sm:p-6">
              {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                          </span>
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          {user.addressString && user.addressString !== 'undefined, undefined, undefined undefined, undefined' && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{user.addressString}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-500 bg-white px-2 sm:px-3 py-1 rounded-full">
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No recent users</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Resumes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-orange-600" />
                Recent Resumes
              </h2>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">Latest resume submissions and updates</p>
            </div>
            <div className="p-4 sm:p-6">
              {dashboardData.recentResumes && dashboardData.recentResumes.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentResumes.map((resume) => (
                    <div key={resume._id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {resume.title || 'Untitled Resume'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {resume.user?.fullName || resume.user?.firstName || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize mt-1 truncate">
                            {resume.template} template
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resume.status)}`}>
                          {resume.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(resume.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No recent resumes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
