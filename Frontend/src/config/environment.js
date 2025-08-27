// Environment Configuration
export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  API_DOCS_URL: import.meta.env.VITE_API_DOCS_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  NODE_ENV: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Geolocation APIs
  NOMINATIM_API_URL: import.meta.env.VITE_NOMINATIM_API_URL,
  PHOTON_API_URL: import.meta.env.VITE_PHOTON_API_URL,
  
  // Google Maps APIs
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_URL: import.meta.env.VITE_GOOGLE_PLACES_API_URL,
  GOOGLE_GEOCODING_API_URL: import.meta.env.VITE_GOOGLE_GEOCODING_API_URL,
  
  // Optional APIs (Require API Keys)
  PLACES_API_URL: import.meta.env.VITE_PLACES_API_URL,
  OPENCAGE_API_KEY: import.meta.env.VITE_OPENCAGE_API_KEY,
  LOCATIONIQ_API_URL: import.meta.env.VITE_LOCATIONIQ_API_URL,
  LOCATIONIQ_API_KEY: import.meta.env.VITE_LOCATIONIQ_API_KEY
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify/:verificationtoken',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword/:resettoken',
    ME: '/auth/me',
    UPDATE_PASSWORD: '/auth/updatepassword',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  ADMIN: {
    // Login uses regular auth endpoint
    LOGIN: '/auth/login',
    
    // Dashboard and statistics
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    
    // User management
    USERS: '/admin/users',
    USER_BY_ID: '/admin/users/:id',
    UPDATE_USER: '/admin/users/:id',
    DELETE_USER: '/admin/users/:id',
    BULK_DELETE_USERS: '/admin/users/bulk-delete',
    
    // Resume management
    RESUMES: '/admin/resumes',
    RESUME_BY_ID: '/admin/resumes/:id',
    DELETE_RESUME: '/admin/resumes/:id',
    APPROVE_RESUME: '/admin/resumes/:id/approve',
    BULK_DELETE_RESUMES: '/admin/resumes/bulk-delete',
    
    // Admin management
    CREATE_ADMIN: '/admin/admins',
    UPDATE_ADMIN_ROLE: '/admin/admins/:id/role',
    
    // Admin profile management
    PROFILE: '/admin/profile',
    UPDATE_PROFILE: '/admin/profile',
    CHANGE_PASSWORD: '/admin/profile/password',
    UPLOAD_PHOTO: '/admin/profile/upload-photo',
    
    // System settings
    SETTINGS: '/admin/settings',
    
    // Export functionality
    EXPORT: '/admin/export',
    EXPORT_RESUMES_CSV: '/admin/resumes/export/csv',
    EXPORT_RESUMES_JSON: '/admin/resumes/export/json',
    
    // Legacy endpoints (keeping for backward compatibility)
    STATS: '/admin/stats',
    BULK_ACTION: '/admin/bulk-action',
    APPROVE_RESUME_LEGACY: '/admin/resumes/:id/approve',
    REJECT_RESUME: '/admin/resumes/:id/reject',
    USER_DETAILS: '/admin/users/:id',
    UPDATE_USER_STATUS: '/admin/users/:id/status',
    RESUME_DETAILS: '/admin/resumes/:id'
  },
  RESUME: {
    CREATE: '/resume/create',
    GET_BY_ID: '/resume/:id',
    GET_ALL: '/resume/user',
    UPDATE: '/resume/:id',
    DELETE: '/resume/:id',
    GENERATE_PDF: '/resume/:id/pdf',
    UPLOAD_PROFILE_PICTURE: '/resume/upload-profile-picture',
    UPLOAD_SCREENSHOT: '/resume/upload-screenshot',
    TEMPLATES: '/resume/templates',
    DUPLICATE: '/resume/:id/duplicate',
    SHARE: '/resume/:id/share',
    ANALYTICS: '/resume/:id/analytics',
    SEARCH: '/resume/search',
    CHANGE_STATUS: '/resume/:id/status'
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_EMAIL: '/users/email',
    DELETE_ACCOUNT: '/users/account',
    STATS: '/users/stats',
    NOTIFICATIONS: '/users/notifications',
    LANGUAGE: '/users/language',
    SECURITY: '/users/security',
    PROFILE_PICTURE: '/users/profile-picture'
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.'
}

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  DOCS_URL: ENV_CONFIG.API_DOCS_URL,
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: API_ENDPOINTS,
  CORS: {
    MODE: 'cors',
    CREDENTIALS: 'include',
    ALLOWED_ORIGINS: [import.meta.env.VITE_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
}
