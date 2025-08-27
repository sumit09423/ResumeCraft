import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { authService } from '../../api'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(true)
  const { resettoken } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Validate token format (basic check)
    if (!resettoken || resettoken.length < 10) {
      setIsTokenValid(false)
    }
  }, [resettoken])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await authService.resetPassword(resettoken, formData.password)
      
      // Store new token and user data
      authService.setAuthData(response.token, null, response.data)
      
      setIsSuccess(true)
      console.log('Password reset successful:', response.message)
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 3000)
      
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors({ 
        general: error.message || 'Failed to reset password. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
    return (
      <>
        {/* Main Page Header */}
        <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    ResumeCraft
                  </h1>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Home</Link>
                <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Sign In</Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-primary text-sm px-4 py-2">Sign In</Link>
              </div>
            </div>
          </div>
        </header>
        
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Invalid reset link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Link expired or invalid
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Password reset links expire after 1 hour. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
              >
                Request new reset link
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isSuccess) {
    return (
      <>
        {/* Main Page Header */}
        <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">
                    ResumeCraft
                  </h1>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Home</Link>
                <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Sign In</Link>
              </nav>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-primary text-sm px-4 py-2">Sign In</Link>
              </div>
            </div>
          </div>
        </header>
        
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Password reset successful
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been updated successfully.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="text-green-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome back!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You're now signed in with your new password. Redirecting to dashboard...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Main Page Header */}
      <header className="relative z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center border border-orange-300">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  ResumeCraft
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Home</Link>
              <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors text-sm">Sign In</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-primary text-sm px-4 py-2">Sign In</Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm new password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset password'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-orange-500 hover:text-orange-600">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
