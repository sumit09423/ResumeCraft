import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeService, authService } from '../../api'
import Header from '../Layout/Header'
import { 
  XMarkIcon, 
  EyeIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline'

const ResumeForm = () => {
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    mobileNumber: currentUser?.mobileNumber || '',
    address: currentUser?.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    profilePicture: null,
    
    // Professional Summary
    summary: '',
    
    // Experiences
    experiences: [
      {
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: []
      }
    ],
    
    // Projects
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        screenshots: []
      }
    ],
    
    // Hobbies
    hobbies: [
      {
        name: '',
        category: 'general',
        description: ''
      }
    ],
    
    // Social Media
    socialMedia: [
      {
        platform: 'linkedin',
        url: '',
        username: ''
      }
    ],
    
    // Template
    template: 'modern'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [templates, setTemplates] = useState([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const templatesData = await resumeService.getTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }))
  }

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }))
  }

  const addAchievement = (expIndex) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: [...exp.achievements, ''] }
          : exp
      )
    }))
  }

  const removeAchievement = (expIndex, achievementIndex) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === expIndex 
          ? { ...exp, achievements: exp.achievements.filter((_, ai) => ai !== achievementIndex) }
          : exp
      )
    }))
  }

  const handleAchievementChange = (expIndex, achievementIndex, value) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) => 
        i === expIndex 
          ? { 
              ...exp, 
              achievements: exp.achievements.map((ach, ai) => 
                ai === achievementIndex ? value : ach
              )
            }
          : exp
      )
    }))
  }

  const addProjectScreenshot = async (projectIndex, file) => {
    try {
      const uploadedUrl = await resumeService.uploadProjectScreenshot(file, projectIndex)
      setFormData(prev => ({
        ...prev,
        projects: prev.projects.map((project, i) => 
          i === projectIndex 
            ? { ...project, screenshots: [...project.screenshots, uploadedUrl] }
            : project
        )
      }))
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      if (window.showToast) {
        window.showToast('Failed to upload screenshot', 'error')
      }
    }
  }

  const removeProjectScreenshot = (projectIndex, screenshotIndex) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex 
          ? { ...project, screenshots: project.screenshots.filter((_, si) => si !== screenshotIndex) }
          : project
      )
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.summary.trim()) newErrors.summary = 'Professional summary is required'
    
    // Validate experiences
    formData.experiences.forEach((exp, index) => {
      if (!exp.company.trim()) newErrors[`experiences.${index}.company`] = 'Company is required'
      if (!exp.role.trim()) newErrors[`experiences.${index}.role`] = 'Role is required'
      if (!exp.startDate) newErrors[`experiences.${index}.startDate`] = 'Start date is required'
      if (!exp.current && !exp.endDate) newErrors[`experiences.${index}.endDate`] = 'End date is required'
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Upload profile picture if selected
      let profilePictureUrl = null
      if (formData.profilePicture) {
        profilePictureUrl = await resumeService.uploadProfilePicture(formData.profilePicture)
      }
      
      const resumeData = {
        ...formData,
        profilePicture: profilePictureUrl
      }
      
      const response = await resumeService.create(resumeData)
      
      // Navigate to preview
      navigate(`/resume/preview/${response._id}`)
      
    } catch (error) {
      console.error('Error creating resume:', error)
      setErrors({ general: error.message || 'Failed to create resume' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    if (validateForm()) {
      setPreviewMode(true)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Resume</h1>
            <p className="mt-2 text-gray-600">Fill in your information to create a professional resume</p>
          </div>

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                  >
                    <div className="text-center">
                      <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                        <span className="text-gray-500">{template.name}</span>
                      </div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload a professional headshot (JPG, PNG, max 5MB)
                </p>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                  errors.summary ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Write a compelling professional summary..."
              />
              {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
            </div>

            {/* Experiences */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('experiences', {
                    company: '',
                    role: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                    achievements: []
                  })}
                  className="btn-secondary"
                >
                  Add Experience
                </button>
              </div>

              {formData.experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('experiences', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleArrayChange('experiences', index, 'company', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors[`experiences.${index}.company`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`experiences.${index}.company`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`experiences.${index}.company`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleArrayChange('experiences', index, 'role', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors[`experiences.${index}.role`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`experiences.${index}.role`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`experiences.${index}.role`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => handleArrayChange('experiences', index, 'startDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          errors[`experiences.${index}.startDate`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[`experiences.${index}.startDate`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`experiences.${index}.startDate`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleArrayChange('experiences', index, 'endDate', e.target.value)}
                          disabled={exp.current}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                            errors[`experiences.${index}.endDate`] ? 'border-red-300' : 'border-gray-300'
                          } ${exp.current ? 'bg-gray-100' : ''}`}
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => handleArrayChange('experiences', index, 'current', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Current</span>
                        </label>
                      </div>
                      {errors[`experiences.${index}.endDate`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`experiences.${index}.endDate`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleArrayChange('experiences', index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Achievements</label>
                      <button
                        type="button"
                        onClick={() => addAchievement(index)}
                        className="text-sm text-orange-600 hover:text-orange-800"
                      >
                        Add Achievement
                      </button>
                    </div>
                    {exp.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => handleAchievementChange(index, achievementIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Enter achievement..."
                        />
                        <button
                          type="button"
                          onClick={() => removeAchievement(index, achievementIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
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
                  className="btn-secondary"
                >
                  Add Project
                </button>
              </div>

              {formData.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => handleArrayChange('projects', index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                      <input
                        type="url"
                        value={project.githubUrl}
                        onChange={(e) => handleArrayChange('projects', index, 'githubUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Live URL</label>
                      <input
                        type="url"
                        value={project.liveUrl}
                        onChange={(e) => handleArrayChange('projects', index, 'liveUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Screenshots</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          addProjectScreenshot(index, e.target.files[0])
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                    {project.screenshots.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.screenshots.map((screenshot, screenshotIndex) => (
                          <div key={screenshotIndex} className="relative">
                            <img
                              src={screenshot}
                              alt={`Screenshot ${screenshotIndex + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeProjectScreenshot(index, screenshotIndex)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hobbies */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Hobbies & Interests</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('hobbies', {
                    name: '',
                    category: 'general',
                    description: ''
                  })}
                  className="btn-secondary"
                >
                  Add Hobby
                </button>
              </div>

              {formData.hobbies.map((hobby, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Hobby {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('hobbies', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hobby Name</label>
                      <input
                        type="text"
                        value={hobby.name}
                        onChange={(e) => handleArrayChange('hobbies', index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={hobby.category}
                        onChange={(e) => handleArrayChange('hobbies', index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="general">General</option>
                        <option value="sports">Sports</option>
                        <option value="arts">Arts</option>
                        <option value="technology">Technology</option>
                        <option value="travel">Travel</option>
                        <option value="music">Music</option>
                        <option value="reading">Reading</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={hobby.description}
                      onChange={(e) => handleArrayChange('hobbies', index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Brief description of your hobby..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Social Media</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem('socialMedia', {
                    platform: 'linkedin',
                    url: '',
                    username: ''
                  })}
                  className="btn-secondary"
                >
                  Add Social Media
                </button>
              </div>

              {formData.socialMedia.map((social, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Social Media {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('socialMedia', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      <select
                        value={social.platform}
                        onChange={(e) => handleArrayChange('socialMedia', index, 'platform', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="portfolio">Portfolio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={social.username}
                        onChange={(e) => handleArrayChange('socialMedia', index, 'username', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => handleArrayChange('socialMedia', index, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center btn-secondary"
                title="Cancel"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="inline-flex items-center justify-center btn-secondary"
                  title="Preview"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center btn-primary"
                  title={isLoading ? 'Creating Resume...' : 'Create Resume'}
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ResumeForm
