// API Endpoints Configuration
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify/:verificationtoken',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword/:resettoken',
    ME: '/auth/me',
    UPDATE_PASSWORD: '/auth/updatepassword',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  ADMIN: {
    LOGIN: '/admin/login',
    STATS: '/admin/stats',
    USERS: '/admin/users',
    RESUMES: '/admin/resumes',
    BULK_ACTION: '/admin/bulk-action',
    EXPORT: '/admin/export',
    EXPORT_RESUMES_CSV: '/admin/resumes/export/csv',
    EXPORT_RESUMES_JSON: '/admin/resumes/export/json',
    APPROVE_RESUME: '/admin/resumes/:id/approve',
    REJECT_RESUME: '/admin/resumes/:id/reject',
    USER_DETAILS: '/admin/users/:id',
    UPDATE_USER_STATUS: '/admin/users/:id/status',
    DELETE_USER: '/admin/users/:id',
    RESUME_DETAILS: '/admin/resumes/:id',
    DELETE_RESUME: '/admin/resumes/:id'
  },
  RESUME: {
    CREATE: '/resumes',
    GET_ALL: '/resumes',
    GET_BY_ID: '/resumes/:id',
    UPDATE: '/resumes/:id',
    DELETE: '/resumes/:id',
    GENERATE_PDF: '/resumes/:id/pdf',
    GENERATE_PDF_POST: '/resumes/:id/generate',
    DUPLICATE: '/resumes/:id/duplicate',
    CHANGE_STATUS: '/resumes/:id/status',
    TEMPLATES: '/resumes/templates',
    SEARCH: '/resumes/search',
    UPLOAD_SCREENSHOT: '/resumes/upload-screenshot',
    UPLOAD_PROFILE_PICTURE: '/resumes/upload-profile-picture',
    SHARE: '/resumes/:id/share',
    ANALYTICS: '/resumes/:id/analytics'
  },
  USER: {
    DASHBOARD: '/user/dashboard',
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    NOTIFICATIONS: '/user/notifications'
  }
}

// Helper function to replace URL parameters
export const buildEndpoint = (endpoint, params = {}) => {
  let url = endpoint
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key])
  })
  return url
}

// Export individual endpoint groups for easier access
export const AUTH_ENDPOINTS = ENDPOINTS.AUTH
export const ADMIN_ENDPOINTS = ENDPOINTS.ADMIN
export const RESUME_ENDPOINTS = ENDPOINTS.RESUME
export const USER_ENDPOINTS = ENDPOINTS.USER
