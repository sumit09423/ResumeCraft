import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userService, authService } from '../../api'
import Header from '../Layout/Header'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

const UserProfile = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await userService.getProfile()
      if (response.success) {
        setProfile(response.data)
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phone: response.data.mobileNumber || '',
          address: response.data.address || ''
        })
        setPreviewImage(response.data.profilePicture)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      // Update profile data
      const updateResponse = await userService.updateProfile(formData)
      
      // Upload profile picture if changed
      if (profilePicture) {
        await userService.uploadProfilePicture(profilePicture)
      }

      if (updateResponse.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        fetchProfile() // Refresh data
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.mobileNumber || '',
      address: profile?.address || ''
    })
    setProfilePicture(null)
    setPreviewImage(profile?.profilePicture)
    setError(null)
    setSuccess(null)
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      
      const response = await userService.deleteAccount({
        confirm: true,
        reason: 'User requested account deletion'
      })
      
      if (response.success) {
        // Clear auth data and redirect to home
        authService.clearAuthData()
        navigate('/')
      } else {
        setError('Failed to delete account. Please try again.')
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
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
            {/* Profile Picture Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile?.fullName || `${profile?.firstName} ${profile?.lastName}`}
                  </h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile?.firstName || 'Not provided'}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile?.lastName || 'Not provided'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center text-gray-900 py-2">
                    <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {profile?.email}
                    {profile?.isEmailVerified && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Change Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center text-gray-900 py-2">
                    <KeyIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">••••••••</span>
                    <button
                      onClick={() => navigate('/change-password')}
                      className="ml-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900 py-2">
                      <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {profile?.mobileNumber || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <div className="flex items-start text-gray-900 py-2">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      {(() => {
                        const address = profile?.address
                        if (!address) return 'Not provided'
                        
                        // Handle address object
                        if (typeof address === 'object' && address !== null) {
                          const parts = []
                          if (address.street) parts.push(address.street)
                          if (address.city) parts.push(address.city)
                          if (address.state) parts.push(address.state)
                          if (address.zipCode) parts.push(address.zipCode)
                          if (address.country) parts.push(address.country)
                          return parts.length > 0 ? parts.join(', ') : 'Not provided'
                        }
                        
                        // Handle string address
                        return address || 'Not provided'
                      })()}
                    </div>
                  )}
                </div>


              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
              <p className="mt-2 text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <div className="p-6">
              {showDeleteConfirm ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <TrashIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Are you sure you want to delete your account?
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 inline mr-2" />
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserProfile
