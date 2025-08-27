import httpClient from '../httpClient'
import { API_CONFIG } from '../../config/environment'
import { buildEndpoint } from '../endpoint'

class AuthService {
  // User login
  async login(credentials) {
    return httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
  }

  // User registration
  async register(userData) {
    return httpClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData)
  }

  async verifyEmail(verificationToken) {
    const endpoint = buildEndpoint(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { verificationtoken: verificationToken })
    return httpClient.get(endpoint)
  }

  // Forgot password
  async forgotPassword(email) {
    return httpClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  }

  // Reset password - PUT request with token in URL
  async resetPassword(resetToken, password) {
    const endpoint = buildEndpoint(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { resettoken: resetToken })
    return httpClient.put(endpoint, { password })
  }

  // Get current user profile - GET /auth/me
  async getProfile() {
    return httpClient.get(API_CONFIG.ENDPOINTS.AUTH.ME)
  }

  // Update password - PUT request
  async updatePassword(currentPassword, newPassword) {
    return httpClient.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PASSWORD, {
      currentPassword,
      newPassword
    })
  }

  // Change password - PUT request
  async changePassword(currentPassword, newPassword) {
    return httpClient.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    })
  }


  async resendVerificationEmail(email) {
    return httpClient.put(API_CONFIG.ENDPOINTS.AUTH.RESEND_VERIFICATION, { email })
  }

  // Logout
  async logout() {
    return httpClient.get(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken')
    return httpClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, { refreshToken })
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // Set authentication data
  setAuthData(accessToken, refreshToken, user) {
    localStorage.setItem('token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Get token
  getToken() {
    return localStorage.getItem('token')
  }

  // Handle authentication errors
  handleAuthError(error) {
    if (error.status === 401) {
      this.clearAuthData()
      window.location.href = '/login'
    }
    throw error
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
