import { useState } from 'react'
import { userService } from '../../api'
import { UserIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ProfilePictureTest = () => {
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        setMessageType('error')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB')
        setMessageType('error')
        return
      }

      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
      setMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!profilePicture) {
      setMessage('Please select an image first')
      setMessageType('error')
      return
    }

    try {
      setIsUploading(true)
      setMessage(null)

      const response = await userService.uploadProfilePicture(profilePicture)
      
      if (response.success) {
        setMessage('Profile picture uploaded successfully!')
        setMessageType('success')
        setProfilePicture(null)
        // Keep the preview for demonstration
      } else {
        setMessage('Failed to upload profile picture')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setMessage('Error uploading profile picture. Please try again.')
      setMessageType('error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setProfilePicture(null)
    setPreviewImage(null)
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Picture Upload Test</h1>
          
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {messageType === 'success' ? (
                <CheckIcon className="w-5 h-5 mr-2" />
              ) : (
                <XMarkIcon className="w-5 h-5 mr-2" />
              )}
              {message}
            </div>
          )}

          {/* Profile Picture Display */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Profile Picture</h2>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {previewImage ? 'Preview of selected image' : 'No profile picture set'}
                </p>
                {profilePicture && (
                  <p className="text-xs text-gray-500 mt-1">
                    File: {profilePicture.name} ({(profilePicture.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Profile Picture</h2>
            
            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    <CameraIcon className="w-4 h-4 mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {profilePicture && (
                    <button
                      onClick={handleRemove}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {/* Upload Button */}
              {profilePicture && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Profile Picture'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How to test:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Choose File" to select an image</li>
              <li>Preview the selected image</li>
              <li>Click "Upload Profile Picture" to upload</li>
              <li>Check the success/error message</li>
              <li>Verify the profile picture appears in Header and Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePictureTest
