import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { authService } from '../../api'
import { useForm } from 'react-hook-form'

const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showResendForm, setShowResendForm] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState({ type: '', text: '' })
  const { verificationtoken } = useParams()
  const params = useParams()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  
  const getTokenFromURL = () => {
    if (verificationtoken) return verificationtoken
    
    const pathname = window.location.pathname
    const match = pathname.match(/\/verify-email\/(.+)/)
    if (match) {
      return match[1]
    }
    return null
  }

  useEffect(() => {
    const verifyEmail = async () => {
      const token = getTokenFromURL()
      
      if (!token) {
        setIsError(true)
        setErrorMessage('Verification token is missing')
        setIsLoading(false)
        return
      }

      try {
        const response = await authService.verifyEmail(token)
        setIsSuccess(true)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 3000)
        
      } catch (error) {
        setIsError(true)
        setErrorMessage(error.message || 'Email verification failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [verificationtoken, navigate])

  const handleResendVerification = async (data) => {
    try {
      setIsResending(true)
      setResendMessage({ type: '', text: '' })
      
      const response = await authService.resendVerificationEmail(data.email)
      
      if (response.success) {
        window.showToast('Verification email sent successfully! Please check your inbox.', 'success')
        setShowResendForm(false)
      } else {
        window.showToast(response.message || 'Failed to send verification email', 'error')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification email. Please try again.'
      window.showToast(errorMessage, 'error')
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
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
              Verifying your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                Verifying your email address...
              </p>
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
              Email verified successfully
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your email address has been verified. You can now sign in to your account.
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
                Welcome to ResumeCraft!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your account is now active. Redirecting to sign in...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (isError) {
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
              Verification failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We couldn't verify your email address.
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
                Verification failed
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowResendForm(!showResendForm)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                >
                  Resend verification email
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Register again
                </Link>
                <div>
                  <Link to="/login" className="text-sm text-orange-500 hover:text-orange-600">
                    Back to sign in
                  </Link>
                </div>
              </div>

              {/* Resend Verification Form */}
              {showResendForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Resend verification email</h4>
                  <form onSubmit={handleSubmit(handleResendVerification)} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {resendMessage.text && (
                      <div className={`p-3 rounded-md text-sm ${
                        resendMessage.type === 'success' 
                          ? 'bg-green-50 border border-green-200 text-green-700' 
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}>
                        {resendMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isResending}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {isResending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        'Send verification email'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}

export default EmailVerification
