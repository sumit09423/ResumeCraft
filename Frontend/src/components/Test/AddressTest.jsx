import { useState } from 'react'
import addressService from '../../api/Model/addressService'
import { ENV_CONFIG } from '../../config/environment'

const AddressTest = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const testStreetSuggestions = async () => {
    if (!query) return
    
    setLoading(true)
    console.log('Testing street suggestions for:', query)
    
    try {
      const suggestions = await addressService.getStreetSuggestions(query)
      console.log('Test results:', suggestions)
      setResults(suggestions)
    } catch (error) {
      console.error('Test error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Address Suggestions Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Environment Variables:</h3>
        <div className="bg-gray-100 p-3 rounded">
          <p><strong>PHOTON_API_URL:</strong> {ENV_CONFIG.PHOTON_API_URL || 'Not set'}</p>
          <p><strong>GOOGLE_MAPS_API_KEY:</strong> {ENV_CONFIG.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'}</p>
          <p><strong>GOOGLE_PLACES_API_URL:</strong> {ENV_CONFIG.GOOGLE_PLACES_API_URL || 'Not set'}</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Query:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter street name (e.g., prahlad nagar)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={testStreetSuggestions}
        disabled={loading || !query}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Street Suggestions'}
      </button>

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Results ({results.length}):</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border">
                <p><strong>Display:</strong> {result.display}</p>
                <p><strong>Street:</strong> {result.street}</p>
                <p><strong>City:</strong> {result.city}</p>
                <p><strong>State:</strong> {result.state}</p>
                <p><strong>Country:</strong> {result.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <div className="mt-4 text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}

export default AddressTest
