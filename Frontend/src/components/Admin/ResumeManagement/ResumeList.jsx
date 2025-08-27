import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  EyeIcon, 
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { adminService } from '../../../api'
import AdminLayout from '../Layout/AdminLayout'
import DataTable from '../Common/DataTable'
import SearchFilters from '../Common/SearchFilters'
import ConfirmationModal from '../Common/ConfirmationModal'

const ResumeList = () => {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [selectedResumes, setSelectedResumes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalTarget, setApprovalTarget] = useState(null)
  const [approvalAction, setApprovalAction] = useState('')
  
  // Loading states for different actions
  const [loadingStates, setLoadingStates] = useState({
    deleting: null,
    approving: null,
    bulkApproving: false,
    bulkRejecting: false,
    bulkDeleting: false,
    exporting: false
  })

  // Memoize table columns configuration
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Resume',
      sortable: true,
      render: (value, resume) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {resume.firstName} {resume.lastName}
            </div>
            <div className="text-sm text-gray-500">{resume.email}</div>
            <div className="text-xs text-gray-400">{resume.template || 'Modern'} Template</div>
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Created By',
      sortable: true,
      render: (value, resume) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {resume.user?.firstName} {resume.user?.lastName}
          </div>
          <div className="text-gray-500">{resume.user?.email}</div>
        </div>
      )
    },
    {
      key: 'template',
      label: 'Template',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {value || 'Modern'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'approved' 
            ? 'bg-green-100 text-green-800'
            : value === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value || 'pending'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, resume) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/resumes/${resume._id}`}
            className="text-orange-600 hover:text-orange-900"
            title="View Resume"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          {resume.status !== 'approved' && (
            <button
              onClick={() => handleApprovalClick(resume, 'approve')}
              disabled={loadingStates.approving === resume._id}
              className={`text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                loadingStates.approving === resume._id ? 'cursor-not-allowed' : ''
              }`}
              title="Approve Resume"
            >
              {loadingStates.approving === resume._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </button>
          )}
          {resume.status !== 'rejected' && (
            <button
              onClick={() => handleApprovalClick(resume, 'reject')}
              disabled={loadingStates.approving === resume._id}
              className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                loadingStates.approving === resume._id ? 'cursor-not-allowed' : ''
              }`}
              title="Reject Resume"
            >
              {loadingStates.approving === resume._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <XMarkIcon className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={() => handleDeleteClick(resume)}
            disabled={loadingStates.deleting === resume._id}
            className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
              loadingStates.deleting === resume._id ? 'cursor-not-allowed' : ''
            }`}
            title="Delete Resume"
          >
            {loadingStates.deleting === resume._id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )
    }
  ], [])

  // Memoize filter options
  const filterOptions = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'template',
      label: 'Template',
      type: 'select',
      options: [
        { value: 'modern', label: 'Modern' },
        { value: 'classic', label: 'Classic' },
        { value: 'creative', label: 'Creative' },
        { value: 'professional', label: 'Professional' }
      ]
    }
  ], [])

  useEffect(() => {
    fetchResumes()
  }, []) // Empty dependency array to run only once on mount

  const fetchResumes = async (page = 1, sort = '', search = '', filter = {}) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(sort && { sort }),
        ...(search && { search }),
        ...filter
      }
      
      const response = await adminService.getResumes(params)
      setResumes(response.data || [])
      setPagination(response.pagination || null)
    } catch (error) {
      console.error('Error fetching resumes:', error)
      // Handle error - could show toast notification
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    fetchResumes(page, '', searchTerm, filters)
  }

  const handleSort = (field, direction) => {
    const sortParam = `${field}:${direction}`
    fetchResumes(1, sortParam, searchTerm, filters)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    fetchResumes(1, '', term, filters)
  }

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    fetchResumes(1, '', searchTerm, newFilters)
  }

  const handleBulkSelect = (selectedIds) => {
    setSelectedResumes(selectedIds)
  }

  const handleDeleteClick = (resume) => {
    setDeleteTarget(resume)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      setLoadingStates(prev => ({ ...prev, deleting: deleteTarget._id }))
      await adminService.deleteResume(deleteTarget._id)
      setShowDeleteModal(false)
      setDeleteTarget(null)
      fetchResumes() // Refresh the list
    } catch (error) {
      console.error('Error deleting resume:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: null }))
    }
  }

  const handleApprovalClick = (resume, action) => {
    setApprovalTarget(resume)
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  const handleApprovalConfirm = async () => {
    if (!approvalTarget) return

    try {
      setLoadingStates(prev => ({ ...prev, approving: approvalTarget._id }))
      // Convert action to proper status format
      const status = approvalAction === 'approve' ? 'approved' : 'rejected'
      await adminService.approveResume(approvalTarget._id, status)
      setShowApprovalModal(false)
      setApprovalTarget(null)
      setApprovalAction('')
      fetchResumes() // Refresh the list
    } catch (error) {
      console.error('Error updating resume status:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, approving: null }))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedResumes.length === 0) return

    try {
      setLoadingStates(prev => ({ ...prev, bulkApproving: true }))
      await Promise.all(
        selectedResumes.map(id => adminService.approveResume(id, 'approved'))
      )
      setSelectedResumes([])
      fetchResumes() // Refresh the list
    } catch (error) {
      console.error('Error bulk approving resumes:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkApproving: false }))
    }
  }

  const handleBulkReject = async () => {
    if (selectedResumes.length === 0) return

    try {
      setLoadingStates(prev => ({ ...prev, bulkRejecting: true }))
      await Promise.all(
        selectedResumes.map(id => adminService.approveResume(id, 'rejected'))
      )
      setSelectedResumes([])
      fetchResumes() // Refresh the list
    } catch (error) {
      console.error('Error bulk rejecting resumes:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkRejecting: false }))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedResumes.length === 0) return

    try {
      setLoadingStates(prev => ({ ...prev, bulkDeleting: true }))
      await adminService.bulkDeleteResumes(selectedResumes)
      setSelectedResumes([])
      fetchResumes() // Refresh the list
    } catch (error) {
      console.error('Error bulk deleting resumes:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, bulkDeleting: false }))
    }
  }

  const handleExport = async (format) => {
    try {
      setLoadingStates(prev => ({ ...prev, exporting: true }))
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...filters
      }
      
      // Use the correct export method based on format
      const blob = format === 'csv' 
        ? await adminService.exportResumesCSV(params)
        : await adminService.exportResumesJSON(params)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumes.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting resumes:', error)
      // Handle error
    } finally {
      setLoadingStates(prev => ({ ...prev, exporting: false }))
    }
  }

  return (
    <AdminLayout title="Resume Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Resumes</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Review and manage all user resumes
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {selectedResumes.length > 0 && (
              <>
                <button
                  onClick={handleBulkApprove}
                  disabled={loadingStates.bulkApproving}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates.bulkApproving ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {loadingStates.bulkApproving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{loadingStates.bulkApproving ? 'Approving...' : `Approve Selected (${selectedResumes.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkApproving ? 'Approving...' : `Approve (${selectedResumes.length})`}</span>
                </button>
                <button
                  onClick={handleBulkReject}
                  disabled={loadingStates.bulkRejecting}
                  className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates.bulkRejecting ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {loadingStates.bulkRejecting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  ) : (
                    <XMarkIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{loadingStates.bulkRejecting ? 'Rejecting...' : `Reject Selected (${selectedResumes.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkRejecting ? 'Rejecting...' : `Reject (${selectedResumes.length})`}</span>
                </button>
                <button
                  onClick={handleBulkDelete}
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
                  <span className="hidden sm:inline">{loadingStates.bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedResumes.length})`}</span>
                  <span className="sm:hidden">{loadingStates.bulkDeleting ? 'Deleting...' : `Delete (${selectedResumes.length})`}</span>
                </button>
              </>
            )}
            <button
              onClick={() => handleExport('csv')}
              disabled={loadingStates.exporting}
              className={`inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                loadingStates.exporting ? 'cursor-not-allowed' : ''
              }`}
            >
              {loadingStates.exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1 sm:mr-2"></div>
              ) : null}
              <span className="hidden sm:inline">{loadingStates.exporting ? 'Exporting...' : 'Export CSV'}</span>
              <span className="sm:hidden">{loadingStates.exporting ? 'Exporting...' : 'CSV'}</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={loadingStates.exporting}
              className={`inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                loadingStates.exporting ? 'cursor-not-allowed' : ''
              }`}
            >
              {loadingStates.exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1 sm:mr-2"></div>
              ) : null}
              <span className="hidden sm:inline">{loadingStates.exporting ? 'Exporting...' : 'Export JSON'}</span>
              <span className="sm:hidden">{loadingStates.exporting ? 'Exporting...' : 'JSON'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filterOptions}
          searchPlaceholder="Search resumes by name, email, or creator..."
        />

        {/* Resumes Table */}
        <DataTable
          data={resumes}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onBulkSelect={handleBulkSelect}
          selectedItems={selectedResumes}
          selectable={true}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Resume"
          message={`Are you sure you want to delete the resume for ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          isLoading={loadingStates.deleting === deleteTarget?._id}
        />

        {/* Approval Confirmation Modal */}
        <ConfirmationModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onConfirm={handleApprovalConfirm}
          title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Resume`}
          message={`Are you sure you want to ${approvalAction} the resume for ${approvalTarget?.firstName} ${approvalTarget?.lastName}?`}
          confirmText={approvalAction === 'approve' ? 'Approve' : 'Reject'}
          confirmVariant={approvalAction === 'approve' ? 'primary' : 'warning'}
          isLoading={loadingStates.approving === approvalTarget?._id}
        />
      </div>
    </AdminLayout>
  )
}

export default ResumeList
