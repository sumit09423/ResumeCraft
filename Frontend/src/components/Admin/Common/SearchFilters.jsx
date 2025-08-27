import { useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SearchFilters = ({
  onSearch = () => {},
  onFilter = () => {},
  filters = [],
  searchPlaceholder = 'Search...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters }
    if (value) {
      newFilters[filterKey] = value
    } else {
      delete newFilters[filterKey]
    }
    setActiveFilters(newFilters)
    onFilter(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
    onFilter({})
    onSearch('')
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
            hasActiveFilters ? 'ring-2 ring-orange-500 border-orange-500' : ''
          }`}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {Object.keys(activeFilters).length + (searchTerm ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                ) : filter.type === 'dateRange' ? (
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      placeholder="From"
                      value={activeFilters[`${filter.key}From`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}From`, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      value={activeFilters[`${filter.key}To`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}To`, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Search: {searchTerm}
                <button
                  onClick={() => handleSearch('')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {Object.entries(activeFilters).map(([key, value]) => {
              const filter = filters.find(f => f.key === key)
              const label = filter ? filter.label : key
              return (
                <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {label}: {value}
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
