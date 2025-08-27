import { useState } from 'react'
import { adminService } from '../../api'

const AdminExportTest = () => {
  const [filters, setFilters] = useState({
    status: '',
    template: '',
    startDate: '',
    endDate: '',
    includeUserData: true
  })
  const [isExporting, setIsExporting] = useState(false)
  const [testResult, setTestResult] = useState('')

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExport = async (format) => {
    setIsExporting(true)
    setTestResult(`Exporting ${format.toUpperCase()}...`)
    
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
        setTestResult(`${format.toUpperCase()} export completed successfully!`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      setTestResult(`Export failed: ${error.message}`)
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
    setTestResult('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Admin Export Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Template Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template
          </label>
          <select
            value={filters.template}
            onChange={(e) => handleFilterChange('template', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Templates</option>
            <option value="modern">Modern</option>
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="classic">Classic</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? 'Exporting...' : 'Export JSON'}
        </button>

        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">{testResult}</p>
        </div>
      )}

      {/* Current Filters Display */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Current Filters:</h4>
        <pre className="text-xs text-blue-800 overflow-x-auto">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default AdminExportTest
