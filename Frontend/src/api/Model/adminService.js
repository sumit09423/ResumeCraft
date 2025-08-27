import httpClient from '../httpClient'
import { API_CONFIG } from '../../config/environment'
import { ENDPOINTS } from '../endpoint'

// Custom httpClient for admin requests that uses adminToken
class AdminHttpClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  // Get admin auth headers
  getAuthHeaders() {
    const adminToken = localStorage.getItem('adminToken')
    return {
      'Content-Type': 'application/json',
      ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
    }
  }

  // Handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || 'Admin request failed')
      error.status = response.status
      error.data = errorData
      throw error
    }
    return response.json()
  }

  // Make request
  async makeRequest(url, options) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await Promise.race([
        fetch(url, {
          ...options,
          signal: controller.signal
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        })
      ])

      clearTimeout(timeoutId)
      return await this.handleResponse(response)
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    return this.makeRequest(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
  }

  // POST request
  async post(endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`
    const options = {
      method: 'POST',
      headers: this.getAuthHeaders()
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    return this.makeRequest(url, options)
  }

  // PUT request
  async put(endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`
    const options = {
      method: 'PUT',
      headers: this.getAuthHeaders()
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    return this.makeRequest(url, options)
  }

  // DELETE request
  async delete(endpoint) {
    const url = `${this.baseURL}${endpoint}`
    
    return this.makeRequest(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
  }

  // Download file
  async download(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Download failed')
    }

    return response.blob()
  }
}

// Create admin httpClient instance
const adminHttpClient = new AdminHttpClient()

class AdminService {
  // Admin login - uses same endpoint as regular user login
  async login(credentials) {
    return httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
  }

  // Get admin dashboard stats
  async getDashboardStats() {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD)
  }

  // Get admin analytics
  async getAnalytics(params = {}) {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS, params)
  }

  // Get system settings
  async getSettings() {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS)
  }

  // Update system settings
  async updateSettings(settings) {
    return adminHttpClient.put(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS, settings)
  }

  // Get admin stats (legacy - keeping for backward compatibility)
  async getStats() {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.STATS)
  }

  // ===== USER MANAGEMENT =====
  
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, params)
  }

  // Get a specific user by ID
  async getUserById(userId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.USER_BY_ID.replace(':id', userId)
    return adminHttpClient.get(endpoint)
  }

  // Update a user
  async updateUser(userId, userData) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.UPDATE_USER.replace(':id', userId)
    return adminHttpClient.put(endpoint, userData)
  }

  // Delete a user
  async deleteUser(userId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.DELETE_USER.replace(':id', userId)
    return adminHttpClient.delete(endpoint)
  }

  // Bulk delete users
  async bulkDeleteUsers(userIds) {
    return adminHttpClient.post(API_CONFIG.ENDPOINTS.ADMIN.BULK_DELETE_USERS, { userIds })
  }

  // ===== RESUME MANAGEMENT =====

  // Get all resumes with pagination and filters
  async getResumes(params = {}) {
    return adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.RESUMES, params)
  }

  // Get a specific resume by ID
  async getResumeById(resumeId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.RESUME_BY_ID.replace(':id', resumeId)
    return adminHttpClient.get(endpoint)
  }

  // Delete a resume
  async deleteResume(resumeId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.DELETE_RESUME.replace(':id', resumeId)
    return adminHttpClient.delete(endpoint)
  }

  // Approve or reject a resume
  async approveResume(resumeId, status, comments = '') {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.APPROVE_RESUME.replace(':id', resumeId)
    return adminHttpClient.put(endpoint, { status, comments })
  }

  // Bulk delete resumes
  async bulkDeleteResumes(resumeIds) {
    return adminHttpClient.post(API_CONFIG.ENDPOINTS.ADMIN.BULK_DELETE_RESUMES, { resumeIds })
  }

  // ===== ADMIN MANAGEMENT =====

  // Create a new admin (super admin only)
  async createAdmin(adminData) {
    return adminHttpClient.post(API_CONFIG.ENDPOINTS.ADMIN.CREATE_ADMIN, adminData)
  }

  // Update admin role (super admin only)
  async updateAdminRole(adminId, role) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.UPDATE_ADMIN_ROLE.replace(':id', adminId)
    return adminHttpClient.put(endpoint, { role })
  }

  // ===== BULK ACTIONS =====

  // Generic bulk actions (legacy - keeping for backward compatibility)
  async bulkAction(action, items) {
    return adminHttpClient.post(API_CONFIG.ENDPOINTS.ADMIN.BULK_ACTION, {
      action,
      items
    })
  }

  // ===== EXPORT FUNCTIONALITY =====

  // Export resumes as CSV
  async exportResumesCSV(params = {}) {
    try {
      const response = await adminHttpClient.download(ENDPOINTS.ADMIN.EXPORT_RESUMES_CSV, params)
      return response
    } catch (error) {
      throw error
    }
  }

  // Export resumes as JSON
  async exportResumesJSON(params = {}) {
    try {
      const response = await adminHttpClient.download(ENDPOINTS.ADMIN.EXPORT_RESUMES_JSON, params)
      return response
    } catch (error) {
      throw error
    }
  }

  // Export data (legacy)
  async exportData(format, params = {}) {
    // Use the correct endpoint based on format
    const endpoint = format === 'csv' 
      ? API_CONFIG.ENDPOINTS.ADMIN.EXPORT_RESUMES_CSV 
      : API_CONFIG.ENDPOINTS.ADMIN.EXPORT_RESUMES_JSON
    return adminHttpClient.download(endpoint, params)
  }

  // Download file helper
  downloadFile(blob, filename) {
    try {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      throw error
    }
  }

  // ===== LEGACY METHODS (keeping for backward compatibility) =====

  // Approve resume (legacy)
  async approveResumeLegacy(resumeId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.APPROVE_RESUME.replace(':id', resumeId)
    return httpClient.post(endpoint)
  }

  // Reject resume (legacy)
  async rejectResume(resumeId, reason = '') {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.REJECT_RESUME.replace(':id', resumeId)
    return httpClient.post(endpoint, { reason })
  }

  // Get user details (legacy)
  async getUserDetails(userId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.USER_DETAILS.replace(':id', userId)
    return httpClient.get(endpoint)
  }

  // Update user status (legacy)
  async updateUserStatus(userId, status) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.UPDATE_USER_STATUS.replace(':id', userId)
    return httpClient.patch(endpoint, { status })
  }

  // Get resume details (legacy)
  async getResumeDetails(resumeId) {
    const endpoint = API_CONFIG.ENDPOINTS.ADMIN.RESUME_DETAILS.replace(':id', resumeId)
    return httpClient.get(endpoint)
  }

  // ===== AUTHENTICATION & SESSION MANAGEMENT =====

  // Check if user is admin
  isAdmin() {
    const adminToken = localStorage.getItem('adminToken')
    const adminRole = localStorage.getItem('adminRole')
    return !!(adminToken || adminRole)
  }

  // Check if user is super admin
  isSuperAdmin() {
    const adminRole = localStorage.getItem('adminRole')
    return adminRole === 'super_admin'
  }

  // Get admin role
  getAdminRole() {
    return localStorage.getItem('adminRole')
  }

  // Set admin data
  setAdminData(accessToken, refreshToken, admin, role) {
    localStorage.setItem('adminToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('adminRefreshToken', refreshToken)
    }
    if (admin) {
      localStorage.setItem('adminUser', JSON.stringify(admin))
    }
    if (role) {
      localStorage.setItem('adminRole', role)
    }
  }

  // Clear admin data
  clearAdminData() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminRole')
  }

  // Get admin user
  getAdminUser() {
    const adminStr = localStorage.getItem('adminUser')
    return adminStr ? JSON.parse(adminStr) : null
  }

  // Handle admin errors
  handleAdminError(error) {
    if (error.status === 401) {
      this.clearAdminData()
      window.location.href = '/admin/login'
    }
    throw error
  }

  // ===== ADMIN PROFILE MANAGEMENT =====

  // Get admin profile
  async getProfile() {
    try {
      const result = await adminHttpClient.get(API_CONFIG.ENDPOINTS.ADMIN.PROFILE)
      
      // Update admin user data in localStorage if successful
      if (result.success && result.data) {
        this.updateAdminUserData(result.data)
      }
      
      return result
    } catch (error) {
      return this.handleAdminError(error)
    }
  }

  // Update admin profile
  async updateProfile(profileData) {
    try {
      const result = await adminHttpClient.put(API_CONFIG.ENDPOINTS.ADMIN.UPDATE_PROFILE, profileData)
      
      // Update admin user data in localStorage if successful
      if (result.success && result.data) {
        this.updateAdminUserData(result.data)
      }
      
      return result
    } catch (error) {
      return this.handleAdminError(error)
    }
  }

  // Change admin password
  async changePassword(currentPassword, newPassword) {
    try {
      return await adminHttpClient.put(API_CONFIG.ENDPOINTS.ADMIN.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      })
    } catch (error) {
      return this.handleAdminError(error)
    }
  }

  // Upload admin profile photo
  async uploadProfilePhoto(file) {
    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)

      const url = `${adminHttpClient.baseURL}${API_CONFIG.ENDPOINTS.ADMIN.UPLOAD_PHOTO}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.message || 'Upload failed')
        error.status = response.status
        error.data = errorData
        throw error
      }

      const result = await response.json()
      
      // Update admin user data in localStorage if successful
      if (result.success && result.data?.admin) {
        localStorage.setItem('adminUser', JSON.stringify(result.data.admin))
      } else if (result.success && result.data) {
        // Handle direct profile data (not nested in admin object)
        localStorage.setItem('adminUser', JSON.stringify(result.data))
      }

      return result
    } catch (error) {
      return this.handleAdminError(error)
    }
  }

  // Update admin user data in localStorage
  updateAdminUserData(adminData) {
    if (adminData) {
      localStorage.setItem('adminUser', JSON.stringify(adminData))
    }
  }

  // Refresh admin user data from server
  async refreshAdminUserData() {
    try {
      const result = await this.getProfile()
      if (result.success && result.data) {
        this.updateAdminUserData(result.data)
        return result.data
      }
    } catch (error) {
    }
    return null
  }


}

// Create singleton instance
const adminService = new AdminService()

export default adminService
