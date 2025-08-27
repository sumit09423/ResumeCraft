import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, authService } from '../../api'
import Header from '../Layout/Header'
import { 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  TrashIcon,
  BellIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const UserSettings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Email update state
  const [emailData, setEmailData] = useState({
    email: '',
    password: ''
  })
  
  // Account deletion state
  const [deleteData, setDeleteData] = useState({
    password: '',
    confirmation: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: {
      resumeUpdates: true,
      adminReviews: true,
      systemUpdates: false,
      marketing: false
    },
    pushNotifications: {
      resumeUpdates: true,
      adminReviews: true
    }
  })
  
  // Language preferences state
  const [languagePrefs, setLanguagePrefs] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  })

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await userService.updateEmail(emailData)
      if (response.success) {
        setSuccess('Email updated successfully! Please check your new email for verification.')
        setEmailData({ email: '', password: '' })
      }
    } catch (error) {
      console.error('Error updating email:', error)
      setError('Failed to update email. Please check your password and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeletion = async (e) => {
    e.preventDefault()
    if (deleteData.confirmation !== 'I understand this action cannot be undone') {
      setError('Please type the confirmation text exactly as shown.')
      return
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await userService.deleteAccount(deleteData)
      if (response.success) {
        authService.clearAuthData()
        navigate('/')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account. Please check your password and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await userService.updateNotifications(notifications)
      if (response.success) {
        setSuccess('Notification preferences updated successfully!')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      setError('Failed to update notification preferences.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageUpdate = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await userService.updateLanguage(languagePrefs)
      if (response.success) {
        setSuccess('Language preferences updated successfully!')
      }
    } catch (error) {
      console.error('Error updating language preferences:', error)
      setError('Failed to update language preferences.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Update Email Address</h3>
        <p className="mt-1 text-sm text-gray-600">
          Change your email address. You'll need to verify the new email address.
        </p>
      </div>
      
      <form onSubmit={handleEmailUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Email Address
          </label>
          <input
            type="email"
            value={emailData.email}
            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter new email address"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={emailData.password}
            onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your current password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
    </div>
  )

  const renderDeleteTab = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
            <p className="mt-1 text-sm text-red-700">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleAccountDeletion} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={deleteData.password}
            onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your current password"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmation
          </label>
          <input
            type="text"
            value={deleteData.confirmation}
            onChange={(e) => setDeleteData({ ...deleteData, confirmation: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Type: I understand this action cannot be undone"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Type exactly: "I understand this action cannot be undone"
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Deleting...' : 'Delete Account'}
        </button>
      </form>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <p className="mt-1 text-sm text-gray-600">
          Choose how you want to be notified about important updates.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-3">
            {Object.entries(notifications.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-xs text-gray-500">
                    Receive email notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    emailNotifications: {
                      ...notifications.emailNotifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h4>
          <div className="space-y-3">
            {Object.entries(notifications.pushNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-xs text-gray-500">
                    Receive push notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    pushNotifications: {
                      ...notifications.pushNotifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleNotificationUpdate}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </div>
  )

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Language & Regional Preferences</h3>
        <p className="mt-1 text-sm text-gray-600">
          Customize your language and regional settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={languagePrefs.language}
            onChange={(e) => setLanguagePrefs({ ...languagePrefs, language: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={languagePrefs.timezone}
            onChange={(e) => setLanguagePrefs({ ...languagePrefs, timezone: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={languagePrefs.dateFormat}
            onChange={(e) => setLanguagePrefs({ ...languagePrefs, dateFormat: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={languagePrefs.currency}
            onChange={(e) => setLanguagePrefs({ ...languagePrefs, currency: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={handleLanguageUpdate}
        disabled={isLoading}
        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Language Preferences'}
      </button>
    </div>
  )

  const tabs = [
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'language', name: 'Language', icon: GlobeAltIcon },
    { id: 'delete', name: 'Delete Account', icon: TrashIcon }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account preferences and security</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-orange-500 font-medium transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XMarkIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'email' && renderEmailTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'language' && renderLanguageTab()}
              {activeTab === 'delete' && renderDeleteTab()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserSettings
