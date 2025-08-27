import { useState, useRef, useEffect } from 'react'

const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  placeholder,
  suggestions = [],
  isLoading = false,
  className = '',
  disabled = false,
  name = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsOpen(suggestions.length > 0 && !isLoading)
    setHighlightedIndex(-1)
  }, [suggestions, isLoading])

  const handleInputChange = (e) => {
    onChange(e)
    setIsOpen(true)
  }

  const handleSelect = (suggestion) => {
    onSelect(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-orange-50 ${
                index === highlightedIndex ? 'bg-orange-100' : ''
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              <div className="font-medium text-gray-900">
                {suggestion.display || suggestion.name}
              </div>
              {suggestion.street && (
                <div className="text-xs text-gray-500">
                  {suggestion.street}
                </div>
              )}
              {(suggestion.city || suggestion.state || suggestion.country) && (
                <div className="text-xs text-gray-400">
                  {[suggestion.city, suggestion.state, suggestion.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AutocompleteInput
