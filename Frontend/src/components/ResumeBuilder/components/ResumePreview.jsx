import React from 'react'
import { getTemplateComponent } from '../templates'

const ResumePreview = ({ 
  formData, 
  setFormData, 
  setShowPreview, 
  isEditing, 
  id, 
  navigate, 
  resumeService, 
  setErrors, 
  setIsLoading, 
  isLoading 
}) => {
  const resumeStyles = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean sidebar layout with dark theme',
      preview: 'modern-preview.png'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Minimal and elegant blue theme design',
      preview: 'professional-preview.png'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Creative design with gradient colors',
      preview: 'creative-preview.png'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional gray design with initials block',
      preview: 'classic-preview.png'
    }
  ]

  const handleSaveResume = async () => {
    try {
      setIsLoading(true)
      // Format data for API
      const formattedData = resumeService.formatResumeData(formData)
      
      let response
      if (isEditing && id) {
        // Update existing resume
        response = await resumeService.update(id, formattedData)
      } else {
        // Create new resume
        response = await resumeService.create(formattedData)
      }
      
      if (response.success) {
        // Navigate to the resume
        const resumeId = isEditing ? id : response.data.id
        navigate(`/resume/${resumeId}`)
      } else {
        setErrors({ general: response.message || 'Failed to save resume' })
      }
    } catch (error) {
      console.error('Error saving resume:', error)
      setErrors({ general: error.message || 'Failed to save resume' })
    } finally {
      setIsLoading(false)
    }
  }

  const TemplateComponent = getTemplateComponent(formData.resumeStyle)
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Resume Preview</h2>
          <p className="text-gray-600">Here's how your resume looks with the {formData.resumeStyle} template</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Edit Resume
          </button>
          <button
            onClick={handleSaveResume}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Resume' : 'Save & Continue')}
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Change Resume Style</h3>
          <p className="text-gray-600 text-sm">Try different templates to see which one looks best for your resume</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resumeStyles.map((style) => (
            <div
              key={style.id}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                formData.resumeStyle === style.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, resumeStyle: style.id }))}
            >
              <div className="text-center">
                <div className={`w-full h-20 rounded-lg mb-2 flex items-center justify-center transition-all duration-300 ${
                  style.id === 'modern' 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                    : style.id === 'professional'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                    : style.id === 'creative'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  <div className="text-center text-white">
                    <div className={`w-8 h-10 bg-white rounded shadow-sm mx-auto mb-1 ${
                      style.id === 'modern' ? 'shadow-gray-200' 
                      : style.id === 'professional' ? 'shadow-blue-200'
                      : style.id === 'creative' ? 'shadow-purple-200'
                      : 'shadow-gray-200'
                    }`}></div>
                    <span className="text-white text-xs font-medium">{style.name}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{style.name}</h4>
                <p className="text-gray-600 text-xs leading-tight">{style.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <TemplateComponent data={formData} />
      </div>
    </div>
  )
}

export default ResumePreview
