import { useState, useEffect } from 'react'
import { adminService } from '../../api'

const AdminAuthTest = () => {
  const [authStatus, setAuthStatus] = useState({})
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const adminToken = localStorage.getItem('adminToken')
    const adminRole = localStorage.getItem('adminRole')
    const adminUser = localStorage.getItem('adminUser')
    
    setAuthStatus({
      adminToken: adminToken ? 'Present' : 'Missing',
      adminRole: adminRole || 'Missing',
      adminUser: adminUser ? 'Present' : 'Missing',
      isAdmin: adminService.isAdmin(),
      isSuperAdmin: adminService.isSuperAdmin(),
      adminUserData: adminService.getAdminUser()
    })
  }

  const testAdminResumeAccess = async () => {
    setLoading(true)
    try {
      // Test with a sample resume ID - you can change this
      const resumeId = '68aedd894066774f56b00948'
      const response = await adminService.getResumeById(resumeId)
      setTestResult({
        success: true,
        data: response,
        message: 'Admin resume access successful'
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        status: error.status,
        data: error.data,
        message: 'Admin resume access failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const clearAdminData = () => {
    adminService.clearAdminData()
    checkAuthStatus()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Authentication Test</h1>
        
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Admin Token:</strong> {authStatus.adminToken}
            </div>
            <div>
              <strong>Admin Role:</strong> {authStatus.adminRole}
            </div>
            <div>
              <strong>Admin User:</strong> {authStatus.adminUser}
            </div>
            <div>
              <strong>Is Admin:</strong> {authStatus.isAdmin ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is Super Admin:</strong> {authStatus.isSuperAdmin ? 'Yes' : 'No'}
            </div>
          </div>
          {authStatus.adminUserData && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <strong>Admin User Data:</strong>
              <pre className="text-sm mt-2">{JSON.stringify(authStatus.adminUserData, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={testAdminResumeAccess}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Admin Resume Access'}
            </button>
            <button
              onClick={clearAdminData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-4"
            >
              Clear Admin Data
            </button>
            <button
              onClick={checkAuthStatus}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded ml-4"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className={`p-4 rounded ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <strong>{testResult.message}</strong>
              {testResult.error && (
                <div className="mt-2">
                  <strong>Error:</strong> {testResult.error}
                </div>
              )}
              {testResult.status && (
                <div className="mt-2">
                  <strong>Status:</strong> {testResult.status}
                </div>
              )}
              {testResult.data && (
                <div className="mt-2">
                  <strong>Response Data:</strong>
                  <pre className="text-sm mt-2 bg-white p-2 rounded border">{JSON.stringify(testResult.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAuthTest
