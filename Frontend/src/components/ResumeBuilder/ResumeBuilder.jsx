import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { resumeService, authService } from '../../api'
import Header from '../Layout/Header'
import { getTemplateComponent } from './templates'
import PDFDownloadButton from '../Common/PDFDownloadButton'

const ResumeBuilder = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const currentUser = authService.getCurrentUser()
  const [isEditing, setIsEditing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // New input states for simplified add functionality
  const [newSkill, setNewSkill] = useState('')
  const [newHobby, setNewHobby] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newTechnology, setNewTechnology] = useState('')
  
  // Screenshot upload states
  const [uploadingScreenshots, setUploadingScreenshots] = useState({})
  const [uploadErrors, setUploadErrors] = useState({})

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      // Resume Title
      title: `${currentUser?.firstName || 'Professional'} Resume`,
      // Resume Style
      resumeStyle: 'modern',
      
      // Personal Information
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      mobileNumber: currentUser?.mobileNumber || '',
      location: '',
      address: {
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
          achievements: [],
          technologies: []
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
      
      // Skills
      skills: [],
      
      // Hobbies
      hobbies: [],
      
      // Social Media
      socialMedia: [
        {
          platform: 'linkedin',
          url: '',
          username: ''
        }
      ],
      
      // Education
      education: [
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: ''
        }
      ],
      
      // Languages
      languages: [],
      
      // Certifications
      certifications: [
        {
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          url: ''
        }
      ]
    }
  })

  const watchedValues = watch()

  // Load existing resume data if editing
  useEffect(() => {
    if (id) {
      loadExistingResume()
    }
  }, [id])

  const loadExistingResume = async () => {
    try {
      setIsLoading(true)
      const response = await resumeService.getById(id)
      const resumeData = response.data
      
      // Convert API data back to form format
      const formDataFromAPI = {
        title: resumeData.title || `${currentUser?.firstName || 'Professional'} Resume`,
        resumeStyle: resumeData.template || 'modern',
        firstName: resumeData.personalInfo?.firstName || '',
        lastName: resumeData.personalInfo?.lastName || '',
        email: resumeData.personalInfo?.email || '',
        mobileNumber: resumeData.personalInfo?.phone || '',
        location: resumeData.personalInfo?.location || '',
        address: typeof resumeData.personalInfo?.address === 'object' 
          ? resumeData.personalInfo.address 
          : {
              street: '',
              city: '',
              state: '',
              country: '',
              zipCode: ''
            },
        summary: resumeData.personalInfo?.summary || '',
        profilePicture: resumeData.personalInfo?.profilePicture || null,
        experiences: resumeData.experiences?.map(exp => ({
          company: exp.company || '',
          role: exp.role || '',
          startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
          endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
          current: !exp.endDate,
          description: exp.description || '',
          achievements: exp.achievements || [],
          technologies: exp.technologies || []
        })) || [],
        projects: resumeData.projects?.map(project => ({
          name: project.name || project.title || '',
          description: project.description || '',
          technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
          githubUrl: project.githubUrl || project.url || '',
          liveUrl: project.liveUrl || '',
          screenshots: project.screenshots || []
        })) || [],
        skills: resumeData.skills?.map(skill => ({
          name: skill.name || '',
          level: skill.level || 'intermediate',
          category: skill.category || 'programming'
        })).filter(skill => skill.name.trim()) || [],
        hobbies: resumeData.hobbies?.map(hobby => ({
          name: hobby.name || '',
          category: 'general',
          description: hobby.description || ''
        })).filter(hobby => hobby.name.trim()) || [],
        socialMedia: resumeData.socialMedia?.map(social => ({
          platform: social.platform || 'linkedin',
          url: social.url || '',
          username: social.username || ''
        })).filter(social => social.url.trim()) || [],
        education: resumeData.education?.map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.field || '',
          startDate: edu.startDate ? edu.startDate.split('T')[0] : '',
          endDate: edu.endDate ? edu.endDate.split('T')[0] : '',
          gpa: edu.gpa || '',
          description: edu.description || ''
        })) || [],
        certifications: resumeData.certifications?.map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate ? cert.issueDate.split('T')[0] : '',
          expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : '',
          credentialId: cert.credentialId || '',
          url: cert.url || ''
        })) || [],
        languages: resumeData.languages?.map(lang => ({
          name: lang.name || '',
          proficiency: lang.proficiency || 'intermediate'
        })).filter(lang => lang.name.trim()) || []
      }
      
      reset(formDataFromAPI)
      setIsEditing(true)
    } catch (error) {
      console.error('Error loading resume:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete resume functionality
  const handleDeleteResume = async () => {
    try {
      setIsLoading(true)
      const response = await resumeService.delete(id)
      if (response.success) {
        navigate('/dashboard')
      } else {
        console.error('Failed to delete resume:', response.message)
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }



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

  const steps = [
    { id: 1, name: 'Title & Style', description: 'Set title and choose template' },
    { id: 2, name: 'Personal Info', description: 'Your basic information' },
    { id: 3, name: 'Experience', description: 'Work history & achievements' },
    { id: 4, name: 'Projects', description: 'Portfolio & projects' },
    { id: 5, name: 'Skills', description: 'Technical & soft skills' },
    { id: 6, name: 'Additional', description: 'Hobbies & social profiles' }
  ]

  // Helper functions for array operations
  const addArrayItem = (arrayName, defaultItem) => {
    const currentArray = getValues(arrayName) || []
    setValue(arrayName, [...currentArray, defaultItem])
  }

  const removeArrayItem = (arrayName, index) => {
    const currentArray = getValues(arrayName) || []
    setValue(arrayName, currentArray.filter((_, i) => i !== index))
  }

  const updateArrayItem = (arrayName, index, field, value) => {
    const currentArray = getValues(arrayName) || []
    const updatedArray = currentArray.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setValue(arrayName, updatedArray)
  }

  // Helper functions for simplified add functionality
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addArrayItem('skills', {
        name: newSkill.trim(),
        level: 'intermediate',
        category: 'programming'
      })
      setNewSkill('')
    }
  }

  const handleAddHobby = () => {
    if (newHobby.trim()) {
      addArrayItem('hobbies', {
        name: newHobby.trim(),
        category: 'general',
        description: ''
      })
      setNewHobby('')
    }
  }

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      addArrayItem('languages', {
        name: newLanguage.trim(),
        proficiency: 'conversational'
      })
      setNewLanguage('')
    }
  }

  const handleAddTechnology = (index) => {
    if (newTechnology.trim()) {
      const currentExperiences = getValues('experiences') || []
      const updatedExperiences = [...currentExperiences]
      if (!updatedExperiences[index].technologies) {
        updatedExperiences[index].technologies = []
      }
      updatedExperiences[index].technologies.push(newTechnology.trim())
      setValue('experiences', updatedExperiences)
      setNewTechnology('')
    }
  }

  const handleScreenshotUpload = async (projectIndex, files) => {
    try {
      setUploadingScreenshots(prev => ({ ...prev, [projectIndex]: true }))
      setUploadErrors(prev => ({ ...prev, [projectIndex]: null }))

      // Upload each file individually
      const uploadPromises = Array.from(files).map(file => resumeService.uploadScreenshot(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // Add uploaded URLs to existing screenshots
      const currentScreenshots = getValues(`projects.${projectIndex}.screenshots`) || []
      const newScreenshots = [...currentScreenshots, ...uploadedUrls]
      
      setValue(`projects.${projectIndex}.screenshots`, newScreenshots)
      
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
    const currentScreenshots = getValues(`projects.${projectIndex}.screenshots`) || []
    const newScreenshots = currentScreenshots.filter((_, i) => i !== screenshotIndex)
    setValue(`projects.${projectIndex}.screenshots`, newScreenshots)
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    // If we're on the last step, create the resume
    if (currentStep === steps.length) {
      setIsLoading(true)
      
      try {
        // Format data for API
        const formattedData = resumeService.formatResumeData(data)
        
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
          console.error('Failed to save resume:', response.message)
        }
      } catch (error) {
        console.error('Error creating resume:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Otherwise, go to next step
      nextStep()
    }
  }

  // Step rendering functions
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Resume Title & Style</h2>
              <p className="text-sm sm:text-base text-gray-600">Give your resume a meaningful title and choose a template</p>
            </div>
            
            {/* Resume Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume Title *</label>
              <Controller
                name="title"
                control={control}
                rules={{ 
                  required: 'Resume title is required',
                  minLength: {
                    value: 3,
                    message: 'Title must be at least 3 characters long'
                  }
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    placeholder="e.g., John Doe - Software Engineer Resume"
                  />
                )}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Choose Your Resume Style</h3>
              <p className="text-sm text-gray-600 mb-4">Select a template that best represents your professional style</p>
            </div>
            
            <Controller
              name="resumeStyle"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {resumeStyles.map((style) => (
                    <div
                      key={style.id}
                      className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-300 hover-lift ${
                        field.value === style.id
                          ? 'border-orange-500 bg-orange-50 shadow-lg glow-orange'
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                      onClick={() => field.onChange(style.id)}
                    >
                      <div className="text-center">
                        <div className={`w-full h-24 sm:h-32 rounded-lg mb-2 sm:mb-3 flex items-center justify-center transition-all duration-300 ${
                          style.id === 'modern' 
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                            : style.id === 'professional'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                            : style.id === 'creative'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-gray-600 to-gray-800'
                        }`}>
                          <div className="text-center text-white">
                            <div className={`w-8 sm:w-12 h-10 sm:h-16 bg-white rounded shadow-sm mx-auto mb-1 sm:mb-2 ${
                              style.id === 'modern' ? 'shadow-gray-200' 
                              : style.id === 'professional' ? 'shadow-blue-200'
                              : style.id === 'creative' ? 'shadow-purple-200'
                              : 'shadow-gray-200'
                            }`}></div>
                            <span className="text-white text-xs font-medium">{style.name}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{style.name}</h3>
                        <p className="text-gray-600 text-xs leading-tight">{style.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-sm sm:text-base text-gray-600">Tell us about yourself</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="Enter your first name"
                    />
                  )}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="Enter your last name"
                    />
                  )}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="your.email@example.com"
                    />
                  )}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  rules={{ 
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="+1 (555) 123-4567"
                    />
                  )}
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>}
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="e.g., New York, NY or Remote"
                    />
                  )}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <Controller
                    name="address.street"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="123 Main Street"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Controller
                    name="address.city"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="New York"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <Controller
                    name="address.state"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="NY"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                  <Controller
                    name="address.zipCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="10001"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <Controller
                    name="address.country"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="United States"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
                <p className="text-sm sm:text-base text-gray-600">Add your professional experience</p>
              </div>
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
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors"
              >
                Add Experience
              </button>
            </div>
            
            {watchedValues.experiences?.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experiences', index)}
                    className="text-red-600 hover:text-red-800 text-sm sm:text-base self-start sm:self-auto"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <Controller
                      name={`experiences.${index}.company`}
                      control={control}
                      rules={{ required: 'Company name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          placeholder="Enter company name"
                        />
                      )}
                    />
                    {errors.experiences?.[index]?.company && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index].company.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <Controller
                      name={`experiences.${index}.role`}
                      control={control}
                      rules={{ required: 'Role is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          placeholder="Enter your role/title"
                        />
                      )}
                    />
                    {errors.experiences?.[index]?.role && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index].role.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <Controller
                      name={`experiences.${index}.startDate`}
                      control={control}
                      rules={{ required: 'Start date is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        />
                      )}
                    />
                    {errors.experiences?.[index]?.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.experiences[index].startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <Controller
                      name={`experiences.${index}.endDate`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="date"
                          disabled={exp.current}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base disabled:bg-gray-100"
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Controller
                    name={`experiences.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="Describe your role and responsibilities..."
                      />
                    )}
                  />
                </div>

                {/* Technologies Section */}
                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 space-y-2 sm:space-y-0">
                    <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology(index)}
                        placeholder="Enter technology (e.g., React, Node.js, AWS)"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTechnology(index)}
                        className="text-sm text-orange-600 hover:text-orange-800 px-2 py-1 whitespace-nowrap"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies?.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">
                        <span className="truncate max-w-32">{tech}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTechnologies = exp.technologies.filter((_, i) => i !== techIndex)
                            updateArrayItem('experiences', index, 'technologies', newTechnologies)
                          }}
                          className="ml-1 text-purple-600 hover:text-purple-800 font-bold flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Projects</h2>
                <p className="text-sm sm:text-base text-gray-600">Showcase your portfolio projects</p>
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
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors"
              >
                Add Project
              </button>
            </div>
            
            {watchedValues.projects?.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900">Project {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('projects', index)}
                    className="text-red-600 hover:text-red-800 text-sm sm:text-base self-start sm:self-auto"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                    <Controller
                      name={`projects.${index}.name`}
                      control={control}
                      rules={{ required: 'Project name is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          placeholder="Enter project name"
                        />
                      )}
                    />
                    {errors.projects?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.projects[index].name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                    <Controller
                      name={`projects.${index}.technologies`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          placeholder="React, Node.js, MongoDB..."
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Controller
                    name={`projects.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                        placeholder="Describe your project..."
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                    <Controller
                      name={`projects.${index}.githubUrl`}
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (!value || !value.trim()) return true // Allow empty
                          try {
                            const url = new URL(value)
                            return url.hostname.includes('github.com') || 'Please enter a valid GitHub URL'
                          } catch {
                            return 'Please enter a valid GitHub URL'
                          }
                        }
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <input
                            {...field}
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="https://github.com/username/project"
                          />
                          {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo URL</label>
                    <Controller
                      name={`projects.${index}.liveUrl`}
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (!value || !value.trim()) return true // Allow empty
                          try {
                            new URL(value)
                            return true
                          } catch {
                            return 'Please enter a valid URL'
                          }
                        }
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <input
                            {...field}
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="https://your-project.com"
                          />
                          {fieldState.error && (
                            <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>

                {/* Screenshots Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Screenshots</label>
                  
                  {/* Upload Error Display */}
                  {uploadErrors[index] && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
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
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">Click to upload screenshots</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {/* Display uploaded screenshots */}
                  {watchedValues.projects?.[index]?.screenshots && watchedValues.projects[index].screenshots.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {watchedValues.projects[index].screenshots.map((screenshot, screenshotIndex) => (
                          <div key={screenshotIndex} className="relative group">
                            <img
                              src={screenshot}
                              alt={`Screenshot ${screenshotIndex + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded border"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0NCA4OC41NDQ0IDgxIDEwMCA4MUMxMTAuNDU2IDgxIDExOSA4OS41NDQ0IDExOSAxMDBDMTE5IDExMC40NTYgMTEwLjQ1NiAxMTkgMTAwIDExOUM4OC41NDQ0IDExOSA4MCAxMTAuNDU2IDgwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzVDMTEwLjQ1NiAxMzUgMTE5IDEyNi40NTYgMTE5IDExNkMxMTkgMTA1LjU0NCAxMTAuNDU2IDk3IDEwMCA5N0M4OC41NDQ0IDk3IDgwIDEwNS41NDQgODAgMTE2QzgwIDEyNi40NTYgODguNTQ0NCAxMzUgMTAwIDEzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index, screenshotIndex)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {watchedValues.projects[index].screenshots.length} screenshot{watchedValues.projects[index].screenshots.length !== 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Skills</h2>
              <p className="text-sm sm:text-base text-gray-600">Add your technical and professional skills</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Enter skill name (e.g., JavaScript, React, Node.js)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors whitespace-nowrap"
              >
                Add Skill
              </button>
            </div>
            
            {watchedValues.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedValues.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
                    <span className="text-sm font-medium truncate max-w-32">{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('skills', index)}
                      className="ml-2 text-orange-600 hover:text-orange-800 font-bold flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {(!watchedValues.skills || watchedValues.skills.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm sm:text-base">No skills added yet. Add your first skill above!</p>
              </div>
            )}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
              <p className="text-sm sm:text-base text-gray-600">Add education, languages, certifications, hobbies and social media links</p>
            </div>
            
            {/* Languages */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                  placeholder="Enter language name (e.g., Spanish, French, German)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  Add Language
                </button>
              </div>
              
              {watchedValues.languages?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.languages.map((lang, index) => (
                    <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                      <span className="text-sm font-medium truncate max-w-32">{lang.name}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('languages', index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {(!watchedValues.languages || watchedValues.languages.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm sm:text-base">No languages added yet. Add your first language above!</p>
                </div>
              )}
            </div>
            
            {/* Hobbies */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hobbies & Interests</h3>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                  type="text"
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHobby()}
                  placeholder="Enter hobby name (e.g., Reading, Swimming, Photography)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={handleAddHobby}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors whitespace-nowrap"
                >
                  Add Hobby
                </button>
              </div>
              
              {watchedValues.hobbies?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.hobbies.map((hobby, index) => (
                    <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      <span className="text-sm font-medium truncate max-w-32">{hobby.name}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('hobbies', index)}
                        className="ml-2 text-green-600 hover:text-green-800 font-bold flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {(!watchedValues.hobbies || watchedValues.hobbies.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm sm:text-base">No hobbies added yet. Add your first hobby above!</p>
                </div>
              )}
            </div>
            
            {/* Education */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Education</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('education', {
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startDate: '',
                    endDate: '',
                    gpa: '',
                    description: ''
                  })}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors"
                >
                  Add Education
                </button>
              </div>
              
              {watchedValues.education?.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', index)}
                      className="text-red-600 hover:text-red-800 text-sm sm:text-base self-start sm:self-auto"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                      <Controller
                        name={`education.${index}.institution`}
                        control={control}
                        rules={{ required: 'Institution name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="University/College name"
                          />
                        )}
                      />
                      {errors.education?.[index]?.institution && (
                        <p className="text-red-500 text-sm mt-1">{errors.education[index].institution.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                      <Controller
                        name={`education.${index}.degree`}
                        control={control}
                        rules={{ required: 'Degree is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="e.g., Bachelor of Science"
                          />
                        )}
                      />
                      {errors.education?.[index]?.degree && (
                        <p className="text-red-500 text-sm mt-1">{errors.education[index].degree.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study *</label>
                      <Controller
                        name={`education.${index}.fieldOfStudy`}
                        control={control}
                        rules={{ required: 'Field of study is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="e.g., Computer Science"
                          />
                        )}
                      />
                      {errors.education?.[index]?.fieldOfStudy && (
                        <p className="text-red-500 text-sm mt-1">{errors.education[index].fieldOfStudy.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                      <Controller
                        name={`education.${index}.gpa`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            max="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="3.8"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <Controller
                        name={`education.${index}.startDate`}
                        control={control}
                        rules={{ required: 'Start date is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          />
                        )}
                      />
                      {errors.education?.[index]?.startDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.education[index].startDate.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <Controller
                        name={`education.${index}.endDate`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Controller
                      name={`education.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          placeholder="Brief description of your education, achievements, relevant coursework..."
                        />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Certifications */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('certifications', {
                    name: '',
                    issuer: '',
                    issueDate: '',
                    expiryDate: '',
                    credentialId: '',
                    url: ''
                  })}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors"
                >
                  Add Certification
                </button>
              </div>
              
              {watchedValues.certifications?.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('certifications', index)}
                      className="text-red-600 hover:text-red-800 text-sm sm:text-base self-start sm:self-auto"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name *</label>
                      <Controller
                        name={`certifications.${index}.name`}
                        control={control}
                        rules={{ required: 'Certification name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="e.g., AWS Certified Solutions Architect"
                          />
                        )}
                      />
                      {errors.certifications?.[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.certifications[index].name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issuer *</label>
                      <Controller
                        name={`certifications.${index}.issuer`}
                        control={control}
                        rules={{ required: 'Issuer is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="e.g., Amazon Web Services"
                          />
                        )}
                      />
                      {errors.certifications?.[index]?.issuer && (
                        <p className="text-red-500 text-sm mt-1">{errors.certifications[index].issuer.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                      <Controller
                        name={`certifications.${index}.issueDate`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <Controller
                        name={`certifications.${index}.expiryDate`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
                      <Controller
                        name={`certifications.${index}.credentialId`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="e.g., AWS-123456"
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                      <Controller
                        name={`certifications.${index}.url`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder="https://verify.aws.com/cert/123456"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Social Media */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
                <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('socialMedia', {
                    platform: 'linkedin',
                    url: '',
                    username: ''
                  })}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base transition-colors"
                >
                  Add Social Media
                </button>
              </div>
              
              {watchedValues.socialMedia?.map((social, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                    <h4 className="font-medium text-gray-900">Social Media {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('socialMedia', index)}
                      className="text-red-600 hover:text-red-800 text-sm sm:text-base self-start sm:self-auto"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                      <Controller
                        name={`socialMedia.${index}.platform`}
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                          >
                            <option value="linkedin">LinkedIn</option>
                            <option value="github">GitHub</option>
                            <option value="twitter">Twitter</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="portfolio">Portfolio</option>
                            <option value="behance">Behance</option>
                            <option value="dribbble">Dribbble</option>
                            <option value="medium">Medium</option>
                            <option value="youtube">YouTube</option>
                          </select>
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <Controller
                        name={`socialMedia.${index}.username`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder={social.platform === 'linkedin' ? 'john-doe' : 
                                       social.platform === 'github' ? 'johndoe' :
                                       social.platform === 'twitter' ? '@johndoe' : 'username'}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                      <Controller
                        name={`socialMedia.${index}.url`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="url"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                            placeholder={social.platform === 'linkedin' ? 'https://linkedin.com/in/john-doe' :
                                       social.platform === 'github' ? 'https://github.com/johndoe' :
                                       social.platform === 'twitter' ? 'https://twitter.com/johndoe' : 'https://example.com'}
                          />
                        )}
                      />
                      {errors.socialMedia?.[index]?.url && (
                        <p className="text-red-500 text-sm mt-1">{errors.socialMedia[index].url.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getBackendTemplate = (uiTemplate) => {
    const templateMapping = {
      'modern': 'ModernTemplate',
      'professional': 'ProfessionalTemplate',
      'creative': 'CreativeTemplate',
      'classic': 'ClassicTemplate'
    }
    return templateMapping[uiTemplate] || 'ProfessionalTemplate'
  }

  const renderPreview = () => {
    const TemplateComponent = getTemplateComponent(watchedValues.resumeStyle)
    
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Resume Preview</h2>
            <p className="text-sm sm:text-base text-gray-600">Here's how your resume looks with the {watchedValues.resumeStyle} template</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm sm:text-base transition-colors"
            >
              Edit Resume
            </button>
            {isEditing && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm sm:text-base transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update Resume' : 'Save & Continue')}
            </button>
            {isEditing && id && (
              <PDFDownloadButton
                resumeId={id}
                template={getBackendTemplate(watchedValues.resumeStyle)}
                method="POST"
                className="px-4 py-2 text-sm sm:text-base"
                onSuccess={() => console.log('PDF downloaded successfully')}
                onError={(error) => console.error('PDF download failed:', error)}
              >
                Download PDF
              </PDFDownloadButton>
            )}
          </div>
        </div>

        {/* Template Selector */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Change Resume Style</h3>
            <p className="text-gray-600 text-sm">Try different templates to see which one looks best for your resume</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {resumeStyles.map((style) => (
              <div
                key={style.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                  watchedValues.resumeStyle === style.id
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setValue('resumeStyle', style.id)}
              >
                <div className="text-center">
                  <div className={`w-full h-16 sm:h-20 rounded-lg mb-2 flex items-center justify-center transition-all duration-300 ${
                    style.id === 'modern' 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                      : style.id === 'professional'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                      : style.id === 'creative'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-gray-600 to-gray-800'
                  }`}>
                    <div className="text-center text-white">
                      <div className={`w-6 sm:w-8 h-8 sm:h-10 bg-white rounded shadow-sm mx-auto mb-1 ${
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
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <TemplateComponent data={watchedValues} />
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Resume' : 'Resume Builder'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {isEditing ? 'Update your professional resume' : `Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]?.name}`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-500">Progress</div>
                <div className="text-base sm:text-lg font-semibold text-orange-600">{Math.round((currentStep / steps.length) * 100)}%</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500 ease-in-out shadow-sm"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Step Indicators */}
            <div className="hidden sm:flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep > step.id 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : currentStep === step.id 
                      ? 'bg-orange-500 text-white ring-4 ring-orange-200 shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </div>
                    <div className={`text-xs ${
                      currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Step Indicators */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep > 1 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : currentStep === 1 
                      ? 'bg-orange-500 text-white ring-4 ring-orange-200 shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 1 ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      1
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {steps[0].name}
                    </div>
                    <div className={`text-xs ${
                      currentStep >= 1 ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {steps[0].description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Step {currentStep} of {steps.length}</div>
                </div>
              </div>
              
              {/* Mobile Step Navigation */}
              <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentStep > step.id 
                          ? 'bg-orange-500' 
                          : currentStep === step.id 
                          ? 'bg-orange-500 ring-2 ring-orange-200' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === steps.length}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {showPreview ? (
            <div className="fade-in">
              {renderPreview()}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="fade-in">
                  {renderStepContent()}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    {currentStep < steps.length ? (
                      <button
                        type="submit"
                        className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                      >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowPreview(true)}
                          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Resume...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {isEditing ? 'Update Resume' : 'Create Resume'}
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Resume</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteResume}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  )
}

export default ResumeBuilder
