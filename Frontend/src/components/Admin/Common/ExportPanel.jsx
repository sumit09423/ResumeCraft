import { useState } from 'react'
import { adminService } from '../../../api'
import { 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

const ExportPanel = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    template: '',
    startDate: '',
    endDate: '',
    includeUserData: true
  })

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const templateOptions = [
    { value: '', label: 'All Templates' },
    { value: 'modern', label: 'Modern' },
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative' },
    { value: 'classic', label: 'Classic' }
  ]

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExport = async (format) => {
    setIsExporting(true)
    try {
      // Remove empty filters
      const exportFilters = Object.keys(filters).reduce((acc, key) => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          acc[key] = filters[key]
        }
        return acc
      }, {})

      let blob, filename

      if (format === 'csv') {
        blob = await adminService.exportResumesCSV(exportFilters)
        filename = `resumes_export_${new Date().toISOString().split('T')[0]}.csv`
      } else if (format === 'json') {
        blob = await adminService.exportResumesJSON(exportFilters)
        filename = `resumes_export_${new Date().toISOString().split('T')[0]}.json`
      }

      if (blob) {
        adminService.downloadFile(blob, filename)
      }
    } catch (error) {
      console.error('Export failed:', error)
      if (window.showToast) {
        window.showToast('Export failed. Please try again.', 'error')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      template: '',
      startDate: '',
      endDate: '',
      includeUserData: true
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export Resumes</h3>
          <p className="text-sm text-gray-600">Export resume data in CSV or JSON format</p>
        </div>
        <FunnelIcon className="h-5 w-5 text-gray-400" />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Template Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template
          </label>
          <select
            value={filters.template}
            onChange={(e) => handleFilterChange('template', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {templateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.includeUserData}
            onChange={(e) => handleFilterChange('includeUserData', e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Include user data in export</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export JSON'}
        </button>

        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Export Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>CSV Export:</strong> Contains resume data in spreadsheet format for analysis in Excel or similar tools.
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>JSON Export:</strong> Contains complete resume data in structured format for data processing or backup.
        </p>
      </div>
    </div>
  )
}

export default ExportPanel
