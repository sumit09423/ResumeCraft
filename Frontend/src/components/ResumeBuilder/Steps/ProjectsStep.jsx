import React, { useState } from 'react'
import { resumeService } from '../../../api'
import { 
  PhotoIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ProjectsStep = ({ formData, handleArrayChange, addArrayItem, removeArrayItem, errors }) => {
  const [uploadingScreenshots, setUploadingScreenshots] = useState({})
  const [uploadErrors, setUploadErrors] = useState({})

  const handleScreenshotUpload = async (projectIndex, files) => {
    try {
      setUploadingScreenshots(prev => ({ ...prev, [projectIndex]: true }))
      setUploadErrors(prev => ({ ...prev, [projectIndex]: null }))

      // Upload each file individually
      const uploadPromises = Array.from(files).map(file => resumeService.uploadScreenshot(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // Add uploaded URLs to existing screenshots
      const currentScreenshots = formData.projects[projectIndex].screenshots || []
      const newScreenshots = [...currentScreenshots, ...uploadedUrls]
      
      handleArrayChange('projects', projectIndex, 'screenshots', newScreenshots)
      
    } catch (error) {
      console.error('Error uploading screenshots:', error)
      setUploadErrors(prev => ({ 
        ...prev, 
        [projectIndex]: error.message || 'Failed to upload screenshots' 
      }))
    } finally {
      setUploadingScreenshots(prev => ({ ...prev, [projectIndex]: false }))
    }
  }

  const removeScreenshot = (projectIndex, screenshotIndex) => {
    const currentScreenshots = formData.projects[projectIndex].screenshots || []
    const newScreenshots = currentScreenshots.filter((_, i) => i !== screenshotIndex)
    handleArrayChange('projects', projectIndex, 'screenshots', newScreenshots)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600">Showcase your portfolio projects</p>
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('projects', {
            name: '',
            description: '',
            technologies: '',
            githubUrl: '',
            liveUrl: '',
            screenshots: []
          })}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Add Project
        </button>
      </div>
      
      {formData.projects.map((project, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeArrayItem('projects', index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter project name"
              />
              {errors[`project-${index}-name`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`project-${index}-name`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => handleArrayChange('projects', index, 'technologies', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="React, Node.js, MongoDB..."
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
              <input
                type="url"
                value={project.githubUrl}
                onChange={(e) => handleArrayChange('projects', index, 'githubUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://github.com/username/project"
              />
              {errors[`project-${index}-githubUrl`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`project-${index}-githubUrl`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo URL</label>
              <input
                type="url"
                value={project.liveUrl}
                onChange={(e) => handleArrayChange('projects', index, 'liveUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://your-project.com"
              />
              {errors[`project-${index}-liveUrl`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`project-${index}-liveUrl`]}</p>
              )}
            </div>
          </div>

          {/* Screenshots Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Screenshots</label>
            
            {/* Upload Error Display */}
            {uploadErrors[index] && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{uploadErrors[index]}</span>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    handleScreenshotUpload(index, e.target.files)
                  }
                }}
                className="hidden"
                id={`screenshots-${index}`}
                disabled={uploadingScreenshots[index]}
              />
              <label htmlFor={`screenshots-${index}`} className={`cursor-pointer ${uploadingScreenshots[index] ? 'opacity-50' : ''}`}>
                {uploadingScreenshots[index] ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">Click to upload screenshots</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </>
                )}
              </label>
            </div>
            
            {/* Display uploaded screenshots */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {project.screenshots.map((screenshot, screenshotIndex) => (
                    <div key={screenshotIndex} className="relative group">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${screenshotIndex + 1}`}
                        className="w-full h-24 object-cover rounded border"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NCA4OC41NDQ0IDgxIDEwMCA4MUMxMTAuNDU2IDgxIDExOSA4OS41NDQ0IDExOSAxMDBDMTE5IDExMC40NTYgMTEwLjQ1NiAxMTkgMTAwIDExOUM4OC41NDQ0IDExOSA4MCAxMTAuNDU2IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTEwLjQ1NiAxMzUgMTE5IDEyNi40NTYgMTE5IDExNkMxMTkgMTA1LjU0NCAxMTAuNDU2IDk3IDEwMCA5N0M4OC41NDQ0IDk3IDgwIDEwNS41NDQgODAgMTE2QzgwIDEyNi40NTYgODguNTQ0NCAxMzUgMTAwIDEzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index, screenshotIndex)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {project.screenshots.length} screenshot{project.screenshots.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectsStep
