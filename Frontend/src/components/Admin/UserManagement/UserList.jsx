import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { adminService } from '../../../api'
import AdminLayout from '../Layout/AdminLayout'
import DataTable from '../Common/DataTable'
import ConfirmationModal from '../Common/ConfirmationModal'

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    isActive: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isActive: true
  })
  
  // Loading states for different actions
  const [loadingStates, setLoadingStates] = useState({
    deleting: null, // user ID being deleted
    bulkDeleting: false,
    updating: false,
    bulkUpdating: false
  })

  // Memoize table columns configuration
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-orange-600">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'admin' ? 'bg-purple-100 text-purple-800' :
          value === 'super_admin' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'super_admin' ? 'Super Admin' : value}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewUser(user)}
            className="text-blue-600 hover:text-blue-900"
            title="View User"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditClick(user)}
            className="text-orange-600 hover:text-orange-900"
            title="Edit User"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(user)}
            disabled={loadingStates.deleting === user._id}
            className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              loadingStates.deleting === user._id ? 'cursor-not-allowed' : ''
            }`}
            title="Delete User"
          >
            {loadingStates.deleting === user._id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )
    }
  ], [loadingStates.deleting])

  useEffect(() => {
    fetchUsers()
  }, []) // Empty dependency array to run only once on mount

  const fetchUsers = async (page = 1, sort = '', search = '', filter = {}) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(sort && { sort }),
        ...(search && { search }),
        ...filter
      }
      
      // Handle boolean filters properly
      if (filter.isActive !== undefined && filter.isActive !== '') {
        params.isActive = filter.isActive === 'true' || filter.isActive === true
      }
      
      const response = await adminService.getUsers(params)
      setUsers(response.data || [])
      setPagination(response.pagination || null)
    } catch (error) {
      console.error('Error fetching users:', error)
      // Handle error - could show toast notification
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    fetchUsers(page, '', searchTerm, filters)
  }

  const handleSort = (field, direction) => {
    const sortParam = `${field}:${direction}`
    fetchUsers(1, sortParam, searchTerm, filters)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchUsers(1, '', term, filters)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    fetchUsers(1, '', searchTerm, newFilters)
  }

  const handleBulkSelect = (selectedIds) => {
    setSelectedUsers(selectedIds)
  }

  const handleDeleteClick = (user) => {
    setDeleteTarget(user)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      setLoadingStates(prev => ({ ...prev, deleting: deleteTarget._id }))
      await adminService.deleteUser(deleteTarget._id)
      setShowDeleteModal(false)
      setDeleteTarget(null)
      fetchUsers() // Refresh the list
      if (window.showToast) {
        window.showToast('User deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      if (window.showToast) {
        window.showToast('Failed to delete user. Please try again.', 'error')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: null }))
    }
  }

  const handleViewUser = (user) => {
    setViewingUser(user)
    setShowViewModal(true)
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      isActive: user.isActive !== undefined ? user.isActive : true
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async () => {
    if (!editingUser) return

    // Basic validation
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      if (window.showToast) {
        window.showToast('Please fill in all required fields', 'error')
      }
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editForm.email)) {
      if (window.showToast) {
        window.showToast('Please enter a valid email address', 'error')
      }
      return
    }

    try {
      setLoadingStates(prev => ({ ...prev, updating: true }))
      const response = await adminService.updateUser(editingUser._id, editForm)
      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers() // Refresh the list
      if (window.showToast) {
        window.showToast('User updated successfully!', 'success')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      if (window.showToast) {
        window.showToast('Failed to update user. Please try again.', 'error')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }))
    }
  }

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return
    setShowBulkDeleteModal(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedUsers.length === 0) return

    try {
      setLoadingStates(prev => ({ ...prev, bulkDeleting: true }))
      const response = await adminService.bulkDeleteUsers(selectedUsers)
      setSelectedUsers([])
      setShowBulkDeleteModal(false)
      fetchUsers() // Refresh the list
      if (window.showToast) {
        window.showToast('Users deleted successfully!', 'success')
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      if (window.showToast) {
        window.showToast('Failed to delete users. Please try again.', 'error')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkDeleting: false }))
    }
  }

  const handleBulkStatusUpdate = async (isActive) => {
    if (selectedUsers.length === 0) return

    try {
      setLoadingStates(prev => ({ ...prev, bulkUpdating: true }))
      await Promise.all(
        selectedUsers.map(id => adminService.updateUser(id, { isActive }))
      )
      setSelectedUsers([])
      fetchUsers() // Refresh the list
      if (window.showToast) {
        window.showToast(`Users ${isActive ? 'activated' : 'deactivated'} successfully!`, 'success')
      }
    } catch (error) {
      console.error('Error bulk updating users:', error)
      if (window.showToast) {
        window.showToast('Failed to update users. Please try again.', 'error')
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkUpdating: false }))
    }
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Manage all registered users and their accounts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {selectedUsers.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={loadingStates.bulkUpdating}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates.bulkUpdating ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {loadingStates.bulkUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{loadingStates.bulkUpdating ? 'Updating...' : `Activate Selected (${selectedUsers.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkUpdating ? 'Updating...' : `Activate (${selectedUsers.length})`}</span>
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={loadingStates.bulkUpdating}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates.bulkUpdating ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {loadingStates.bulkUpdating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  ) : (
                    <XMarkIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{loadingStates.bulkUpdating ? 'Updating...' : `Deactivate Selected (${selectedUsers.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkUpdating ? 'Updating...' : `Deactivate (${selectedUsers.length})`}</span>
                </button>
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={loadingStates.bulkDeleting}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates.bulkDeleting ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {loadingStates.bulkDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{loadingStates.bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedUsers.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkDeleting ? 'Deleting...' : `Delete (${selectedUsers.length})`}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
            <div className="flex space-x-2 sm:space-x-0 sm:flex-col sm:space-y-2">
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange({ ...filters, role: e.target.value })}
                className="block w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange({ ...filters, isActive: e.target.value })}
                className="block w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onBulkSelect={handleBulkSelect}
          selectedItems={selectedUsers}
          selectable={true}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={loadingStates.deleting === deleteTarget?._id}
        />

        {/* Bulk Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDeleteConfirm}
          title="Bulk Delete Users"
          message={`Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`}
          confirmText="Delete All"
          confirmVariant="danger"
          isLoading={loadingStates.bulkDeleting}
        />

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
                onClick={() => setShowEditModal(false)}
              ></div>
              
              {/* Modal */}
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Enter last name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-700">
                        Active Account
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-lg">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={loadingStates.updating}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingStates.updating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && viewingUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
                onClick={() => setShowViewModal(false)}
              ></div>
              
              {/* Modal */}
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold text-white">
                        {viewingUser.firstName?.charAt(0)}{viewingUser.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {viewingUser.firstName} {viewingUser.lastName}
                      </h4>
                      <p className="text-gray-600">{viewingUser.email}</p>
                    </div>
                  </div>
                  
                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Role</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        viewingUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        viewingUser.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {viewingUser.role === 'super_admin' ? 'Super Admin' : viewingUser.role}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        viewingUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Joined</span>
                      <span className="text-sm text-gray-900">
                        {new Date(viewingUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {viewingUser.updatedAt && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Last Updated</span>
                        <span className="text-sm text-gray-900">
                          {new Date(viewingUser.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-lg">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      handleEditClick(viewingUser)
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default UserList
