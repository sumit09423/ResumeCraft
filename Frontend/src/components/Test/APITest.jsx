import { useState } from 'react'
import { api, authService, ENDPOINTS } from '../../api'

const APITest = () => {
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const testAPIConnection = async () => {
    setIsLoading(true)
    addResult('API Connection', 'info', 'Testing API connection...')
    
    try {
      // Test basic API connection
      const response = await api.get('/health')
      addResult('API Connection', 'success', 'API connection successful', response)
    } catch (error) {
      addResult('API Connection', 'error', `API connection failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testCORS = async () => {
    setIsLoading(true)
    addResult('CORS Test', 'info', 'Testing CORS configuration...')
    
    try {
      // Test CORS with a simple request
      const response = await api.get('/auth/profile')
      addResult('CORS Test', 'success', 'CORS configuration working', response)
    } catch (error) {
      if (error.message.includes('CORS')) {
        addResult('CORS Test', 'error', `CORS Error: ${error.message}`)
      } else {
        addResult('CORS Test', 'warning', `Request failed but not CORS related: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testAuthService = async () => {
    setIsLoading(true)
    addResult('Auth Service', 'info', 'Testing authentication service...')
    
    try {
      const isAuth = authService.isAuthenticated()
      const currentUser = authService.getCurrentUser()
      
      addResult('Auth Service', 'success', 'Auth service working', {
        isAuthenticated: isAuth,
        currentUser
      })
    } catch (error) {
      addResult('Auth Service', 'error', `Auth service error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testEndpoints = () => {
    addResult('Endpoints', 'info', 'Testing endpoint configuration...')
    
    try {
      const authEndpoints = Object.keys(ENDPOINTS.AUTH)
      const resumeEndpoints = Object.keys(ENDPOINTS.RESUME)
      const adminEndpoints = Object.keys(ENDPOINTS.ADMIN)
      
      addResult('Endpoints', 'success', 'Endpoint configuration loaded', {
        authEndpoints,
        resumeEndpoints,
        adminEndpoints
      })
    } catch (error) {
      addResult('Endpoints', 'error', `Endpoint configuration error: ${error.message}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Dashboard</h1>
        
        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={testAPIConnection}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              Test API Connection
            </button>
            <button
              onClick={testCORS}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              Test CORS
            </button>
            <button
              onClick={testAuthService}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              Test Auth Service
            </button>
            <button
              onClick={testEndpoints}
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              Test Endpoints
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={clearResults}
              className="text-red-600 hover:text-red-800"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          </div>
          
          {testResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No test results yet. Run a test to see results.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{result.test}</h3>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Structure Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Files Created:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>src/api/api.js</code> - Main API configuration</li>
                <li>• <code>src/api/endpoint.js</code> - Endpoint definitions</li>
                <li>• <code>src/api/Model/authService.js</code> - Auth service model</li>
                <li>• <code>src/api/index.js</code> - Updated exports</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CORS Configuration:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mode: <code>cors</code></li>
                <li>• Credentials: <code>include</code></li>
                <li>• Allowed Origins: localhost:3000, localhost:5173</li>
                <li>• Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APITest
