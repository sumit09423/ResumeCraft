import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/environment'

class HttpClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Create timeout promise
  createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(ERROR_MESSAGES.TIMEOUT)), this.timeout)
    })
  }

  // Handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || this.getErrorMessage(response.status))
      error.status = response.status
      error.data = errorData
      throw error
    }
    return response.json()
  }

  // Get error message based on status
  getErrorMessage(status) {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR
      default:
        return ERROR_MESSAGES.NETWORK_ERROR
    }
  }

  // Make request with retry logic
  async makeRequest(url, options, attempt = 1) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await Promise.race([
        fetch(url, {
          ...options,
          signal: controller.signal
        }),
        this.createTimeoutPromise()
      ])

      clearTimeout(timeoutId)
      return await this.handleResponse(response)

    } catch (error) {
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        await this.delay(1000 * attempt)
        return this.makeRequest(url, options, attempt + 1)
      }

      throw error
    }
  }

  // Check if error is retryable
  isRetryableError(error) {
    return error.name === 'AbortError' || 
           error.message.includes('Network') ||
           error.message.includes('timeout')
  }

  // Delay function for retry
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
      if (data instanceof FormData) {
        delete options.headers['Content-Type'] // Let browser set it for FormData
        options.body = data
      } else {
        options.body = JSON.stringify(data)
      }
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

  // PATCH request
  async patch(endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`
    const options = {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    return this.makeRequest(url, options)
  }

  // Upload file
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`
    
    return this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
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
      throw new Error(this.getErrorMessage(response.status))
    }

    return response.blob()
  }
}

// Create singleton instance
const httpClient = new HttpClient()

export default httpClient
