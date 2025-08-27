import httpClient from '../httpClient'
import { API_CONFIG } from '../../config/environment'
import { buildEndpoint } from '../endpoint'

class UserService {
  // Get user profile
  async getProfile() {
    return httpClient.get(API_CONFIG.ENDPOINTS.USERS.PROFILE)
  }

  // Update user profile
  async updateProfile(profileData) {
    return httpClient.put(API_CONFIG.ENDPOINTS.USERS.PROFILE, profileData)
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    const formData = new FormData()
    formData.append('profilePicture', file)
    return httpClient.post(API_CONFIG.ENDPOINTS.USERS.PROFILE_PICTURE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  // Update email
  async updateEmail(emailData) {
    return httpClient.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_EMAIL, emailData)
  }

  // Delete account
  async deleteAccount(deleteData) {
    return httpClient.delete(API_CONFIG.ENDPOINTS.USERS.DELETE_ACCOUNT, { data: deleteData })
  }

  // Get user statistics
  async getStats() {
    return httpClient.get(API_CONFIG.ENDPOINTS.USERS.STATS)
  }

  // Update notification preferences
  async updateNotifications(notificationData) {
    return httpClient.put(API_CONFIG.ENDPOINTS.USERS.NOTIFICATIONS, notificationData)
  }

  // Update language preferences
  async updateLanguage(languageData) {
    return httpClient.put(API_CONFIG.ENDPOINTS.USERS.LANGUAGE, languageData)
  }

  // Get account security info
  async getSecurityInfo() {
    return httpClient.get(API_CONFIG.ENDPOINTS.USERS.SECURITY)
  }

  handleError(error) {
    if (error.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    throw error
  }
}

// Create singleton instance
const userService = new UserService()

export default userService
