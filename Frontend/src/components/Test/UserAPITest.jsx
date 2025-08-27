import { useState } from 'react'
import { userService } from '../../api'
import Header from '../Layout/Header'

const UserAPITest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [error, setError] = useState({})

  const testEndpoint = async (endpointName, testFunction) => {
    setLoading(prev => ({ ...prev, [endpointName]: true }))
    setError(prev => ({ ...prev, [endpointName]: null }))
    
    try {
      const result = await testFunction()
      setResults(prev => ({ ...prev, [endpointName]: result }))
    } catch (err) {
      setError(prev => ({ ...prev, [endpointName]: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, [endpointName]: false }))
    }
  }

  const testGetProfile = () => testEndpoint('getProfile', () => userService.getProfile())
  const testGetStats = () => testEndpoint('getStats', () => userService.getStats())
  const testGetSecurityInfo = () => testEndpoint('getSecurityInfo', () => userService.getSecurityInfo())

  const testUpdateProfile = () => testEndpoint('updateProfile', () => 
    userService.updateProfile({
      firstName: 'Test',
      lastName: 'User',
      phone: '+1-555-0123',
      address: '123 Test St, Test City, TS 12345',
      bio: 'This is a test bio for API testing'
    })
  )

  const testUpdateEmail = () => testEndpoint('updateEmail', () => 
    userService.updateEmail({
      email: 'test@example.com',
      password: 'testpassword'
    })
  )

  const testUpdateNotifications = () => testEndpoint('updateNotifications', () => 
    userService.updateNotifications({
      emailNotifications: {
        resumeUpdates: true,
        adminReviews: true,
        systemUpdates: false,
        marketing: false
      },
      pushNotifications: {
        resumeUpdates: true,
        adminReviews: true
      }
    })
  )

  const testUpdateLanguage = () => testEndpoint('updateLanguage', () => 
    userService.updateLanguage({
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    })
  )

  const testDeleteAccount = () => testEndpoint('deleteAccount', () => 
    userService.deleteAccount({
      password: 'testpassword',
      confirmation: 'I understand this action cannot be undone'
    })
  )

  const endpoints = [
    { name: 'Get Profile', test: testGetProfile, method: 'GET' },
    { name: 'Get Stats', test: testGetStats, method: 'GET' },
    { name: 'Get Security Info', test: testGetSecurityInfo, method: 'GET' },
    { name: 'Update Profile', test: testUpdateProfile, method: 'PUT' },
    { name: 'Update Email', test: testUpdateEmail, method: 'PUT' },
    { name: 'Update Notifications', test: testUpdateNotifications, method: 'PUT' },
    { name: 'Update Language', test: testUpdateLanguage, method: 'PUT' },
    { name: 'Delete Account', test: testDeleteAccount, method: 'DELETE' }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User API Test</h1>
            <p className="mt-2 text-gray-600">Test all user management endpoints</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {endpoints.map((endpoint) => (
              <div key={endpoint.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{endpoint.name}</h3>
                    <p className="text-sm text-gray-500">{endpoint.method}</p>
                  </div>
                  <button
                    onClick={endpoint.test}
                    disabled={loading[endpoint.name]}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {loading[endpoint.name] ? 'Testing...' : 'Test'}
                  </button>
                </div>

                {error[endpoint.name] && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{error[endpoint.name]}</p>
                  </div>
                )}

                {results[endpoint.name] && (
                  <div className="bg-gray-50 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(results[endpoint.name], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default UserAPITest
