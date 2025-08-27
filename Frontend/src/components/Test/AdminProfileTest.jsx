import { useState } from 'react'
import adminService from '../../api/Model/adminService'

const AdminProfileTest = () => {
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])

    try {
      // Test 1: Get Admin Profile
      addResult('Get Profile', 'pending', 'Testing admin profile retrieval...')
      try {
        const profileResponse = await adminService.getProfile()
        if (profileResponse.success) {
          addResult('Get Profile', 'success', 'Profile retrieved successfully', profileResponse.data)
        } else {
          addResult('Get Profile', 'error', 'Failed to retrieve profile', profileResponse)
        }
      } catch (error) {
        addResult('Get Profile', 'error', `Error: ${error.message}`)
      }

      // Test 2: Update Admin Profile
      addResult('Update Profile', 'pending', 'Testing profile update...')
      try {
        const updateData = {
          firstName: 'Test Admin',
          lastName: 'Updated',
          email: 'testadmin@example.com',
          mobileNumber: '+1234567890',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345'
          }
        }
        const updateResponse = await adminService.updateProfile(updateData)
        if (updateResponse.success) {
          addResult('Update Profile', 'success', 'Profile updated successfully', updateResponse.data)
        } else {
          addResult('Update Profile', 'error', 'Failed to update profile', updateResponse)
        }
      } catch (error) {
        addResult('Update Profile', 'error', `Error: ${error.message}`)
      }

      // Test 3: Change Password
      addResult('Change Password', 'pending', 'Testing password change...')
      try {
        const passwordResponse = await adminService.changePassword('oldPassword123', 'newPassword456')
        if (passwordResponse.success) {
          addResult('Change Password', 'success', 'Password changed successfully')
        } else {
          addResult('Change Password', 'error', 'Failed to change password', passwordResponse)
        }
      } catch (error) {
        addResult('Change Password', 'error', `Error: ${error.message}`)
      }

      // Test 4: Toast Functionality
      addResult('Toast System', 'pending', 'Testing toast notifications...')
      try {
        if (window.showToast) {
          window.showToast('Test success message', 'success')
          setTimeout(() => {
            window.showToast('Test error message', 'error')
          }, 1000)
          setTimeout(() => {
            window.showToast('Test warning message', 'warning')
          }, 2000)
          setTimeout(() => {
            window.showToast('Test info message', 'info')
          }, 3000)
          addResult('Toast System', 'success', 'Toast notifications working')
        } else {
          addResult('Toast System', 'error', 'Toast system not available')
        }
      } catch (error) {
        addResult('Toast System', 'error', `Error: ${error.message}`)
      }

    } catch (error) {
      addResult('General', 'error', `General error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Profile API Test</h1>
              <p className="mt-1 text-sm text-gray-600">
                Test the admin profile management functionality
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Running Tests...' : 'Run Tests'}
              </button>
              <button
                onClick={clearResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.success === 'error'
                    ? 'bg-red-50 border-red-200'
                    : result.success === 'pending'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      result.success === 'success'
                        ? 'text-green-800'
                        : result.success === 'error'
                        ? 'text-red-800'
                        : result.success === 'pending'
                        ? 'text-yellow-800'
                        : 'text-gray-800'
                    }`}>
                      {result.test}
                    </h3>
                    <p className={`text-sm ${
                      result.success === 'success'
                        ? 'text-green-600'
                        : result.success === 'error'
                        ? 'text-red-600'
                        : result.success === 'pending'
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm font-medium cursor-pointer">View Data</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.success === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.success === 'error'
                      ? 'bg-red-100 text-red-800'
                      : result.success === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {result.success}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No test results yet. Click "Run Tests" to start testing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfileTest
