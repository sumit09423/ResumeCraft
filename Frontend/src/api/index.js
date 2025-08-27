// Export environment configuration
export { 
  ENV_CONFIG, 
  API_CONFIG, 
  API_ENDPOINTS, 
  HTTP_STATUS, 
  ERROR_MESSAGES 
} from '../config/environment'

// Export new API structure
export { default as api } from './api'
export { ENDPOINTS, buildEndpoint } from './endpoint'

// Export services from Model folder
export { default as authService } from './Model/authService'
export { default as adminService } from './Model/adminService'
export { default as resumeService } from './Model/resumeService'
export { default as userService } from './Model/userService'
export { default as httpClient } from './httpClient'

// Export utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    return !!token
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Set tokens
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  },

  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  handleError: (error) => {
    if (error.message.includes('401')) {
      apiUtils.clearTokens()
      window.location.href = '/login'
    }
    throw error
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Set user data
  setUserData: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }
}
