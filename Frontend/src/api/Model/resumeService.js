import { api, ENDPOINTS } from '../index'
import { API_CONFIG } from '../../config/environment'

class ResumeService {
  // Create resume
  async create(resumeData) {
    // Log any unmapped values for backend enum updates
    this.logUnmappedValues(resumeData)
    return api.post(ENDPOINTS.RESUME.CREATE, resumeData)
  }

  // Get all resumes for user with filtering
  async getAll(params = {}) {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key])
      }
    })
    
    const endpoint = queryParams.toString() 
      ? `${ENDPOINTS.RESUME.GET_ALL}?${queryParams.toString()}`
      : ENDPOINTS.RESUME.GET_ALL
    
    return api.get(endpoint)
  }

  // Get resume by ID
  async getById(resumeId) {
    const endpoint = ENDPOINTS.RESUME.GET_BY_ID.replace(':id', resumeId)
    return api.get(endpoint)
  }

  // Update resume
  async update(resumeId, resumeData) {
    const endpoint = ENDPOINTS.RESUME.UPDATE.replace(':id', resumeId)
    return api.put(endpoint, resumeData)
  }

  // Delete resume
  async delete(resumeId) {
    const endpoint = ENDPOINTS.RESUME.DELETE.replace(':id', resumeId)
    return api.delete(endpoint)
  }

  // Duplicate resume
  async duplicate(resumeId, title = null) {
    const endpoint = ENDPOINTS.RESUME.DUPLICATE.replace(':id', resumeId)
    const data = title ? { title } : {}
    return api.post(endpoint, data)
  }

  // Change resume status
  async changeStatus(resumeId, status) {
    const endpoint = ENDPOINTS.RESUME.CHANGE_STATUS.replace(':id', resumeId)
    return api.put(endpoint, { status })
  }

  // Get available templates
  async getTemplates() {
    return api.get(ENDPOINTS.RESUME.TEMPLATES)
  }

  // Search resumes
  async search(query, params = {}) {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key])
      }
    })
    
    const endpoint = `${ENDPOINTS.RESUME.SEARCH}?${searchParams.toString()}`
    return api.get(endpoint)
  }

  // Validate resume data
  validateResumeData(resumeData) {
    const errors = []

    // Basic validation
    if (!resumeData.title?.trim()) {
      errors.push({ field: 'title', message: 'Title is required' })
    }
    if (!resumeData.template) {
      errors.push({ field: 'template', message: 'Template is required' })
    }

    // Personal info validation
    if (resumeData.personalInfo) {
      const { personalInfo } = resumeData
      if (!personalInfo.firstName?.trim()) {
        errors.push({ field: 'personalInfo.firstName', message: 'First name is required' })
      }
      if (!personalInfo.lastName?.trim()) {
        errors.push({ field: 'personalInfo.lastName', message: 'Last name is required' })
      }
      if (!personalInfo.email?.trim()) {
        errors.push({ field: 'personalInfo.email', message: 'Email is required' })
      } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
        errors.push({ field: 'personalInfo.email', message: 'Email is invalid' })
      }
      if (!personalInfo.phone?.trim()) {
        errors.push({ field: 'personalInfo.phone', message: 'Phone is required' })
      }
    }

    // Experience validation
    if (resumeData.experiences && resumeData.experiences.length > 0) {
      resumeData.experiences.forEach((exp, index) => {
        if (!exp.company?.trim()) {
          errors.push({ field: `experiences.${index}.company`, message: 'Company is required' })
        }
        if (!exp.role?.trim()) {
          errors.push({ field: `experiences.${index}.role`, message: 'Role is required' })
        }
        if (!exp.startDate) {
          errors.push({ field: `experiences.${index}.startDate`, message: 'Start date is required' })
        }
      })
    }

    // Education validation
    if (resumeData.education && resumeData.education.length > 0) {
      resumeData.education.forEach((edu, index) => {
        if (!edu.institution?.trim()) {
          errors.push({ field: `education.${index}.institution`, message: 'Institution name is required' })
        }
        if (!edu.degree?.trim()) {
          errors.push({ field: `education.${index}.degree`, message: 'Degree is required' })
        }
        if (!edu.field?.trim()) {
          errors.push({ field: `education.${index}.field`, message: 'Field of study is required' })
        }
        if (!edu.startDate) {
          errors.push({ field: `education.${index}.startDate`, message: 'Start date is required' })
        }
      })
    }

    // Skills validation
    if (resumeData.skills && resumeData.skills.length > 0) {
      resumeData.skills.forEach((skill, index) => {
        if (!skill.name?.trim()) {
          errors.push({ field: `skills.${index}.name`, message: 'Skill name is required' })
        }
        // Validate skill level enum
        const validLevels = ['beginner', 'intermediate', 'advanced', 'expert']
        if (skill.level && !validLevels.includes(skill.level.toLowerCase())) {
          errors.push({ field: `skills.${index}.level`, message: 'Skill level must be beginner, intermediate, advanced, or expert' })
        }
        // Validate skill category enum - based on backend error, these are the valid categories
        const validCategories = ['programming', 'database', 'framework', 'tool', 'language', 'soft']
        if (skill.category && !validCategories.includes(skill.category.toLowerCase())) {
          errors.push({ field: `skills.${index}.category`, message: 'Skill category must be programming, database, framework, tool, language, or soft' })
        }
      })
    }

    // Projects validation
    if (resumeData.projects && resumeData.projects.length > 0) {
      resumeData.projects.forEach((project, index) => {
        if (!project.name?.trim()) {
          errors.push({ field: `projects.${index}.name`, message: 'Project name is required' })
        }
        if (!project.description?.trim()) {
          errors.push({ field: `projects.${index}.description`, message: 'Project description is required' })
        }
        // URL validations are now handled by React Hook Form
      })
    }

    // Social Media validation
    if (resumeData.socialMedia && resumeData.socialMedia.length > 0) {
      resumeData.socialMedia.forEach((social, index) => {
        // Validate social media platform enum - based on backend error, these are the valid platforms
        const validPlatforms = ['linkedin', 'github', 'twitter', 'facebook', 'instagram', 'portfolio']
        if (social.platform && !validPlatforms.includes(social.platform.toLowerCase())) {
          errors.push({ field: `socialMedia.${index}.platform`, message: 'Platform must be linkedin, github, twitter, facebook, instagram, or portfolio' })
        }
      })
    }

    // Languages validation
    if (resumeData.languages && resumeData.languages.length > 0) {
      resumeData.languages.forEach((lang, index) => {
        if (!lang.name?.trim()) {
          errors.push({ field: `languages.${index}.name`, message: 'Language name is required' })
        }
        // Validate proficiency enum - based on backend error, these are the valid proficiencies
        const validProficiencies = ['basic', 'conversational', 'fluent', 'native']
        if (lang.proficiency && !validProficiencies.includes(lang.proficiency.toLowerCase())) {
          errors.push({ field: `languages.${index}.proficiency`, message: 'Proficiency must be basic, conversational, fluent, or native' })
        }
      })
    }

    // Certifications validation
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      resumeData.certifications.forEach((cert, index) => {
        if (!cert.name?.trim()) {
          errors.push({ field: `certifications.${index}.name`, message: 'Certification name is required' })
        }
        if (!cert.issuer?.trim()) {
          errors.push({ field: `certifications.${index}.issuer`, message: 'Issuer is required' })
        }
      })
    }

    return errors
  }

  // Helper function to log unmapped values for backend enum updates
  logUnmappedValues(formData) {
    const unmappedValues = {
      skillCategories: new Set(),
      socialPlatforms: new Set()
    }

    // Check skill categories
    formData.skills?.forEach(skill => {
      const category = skill.category?.toLowerCase()
      const validCategories = ['programming', 'database', 'framework', 'tool', 'language', 'soft']
      if (category && !validCategories.includes(category)) {
        unmappedValues.skillCategories.add(category)
      }
    })

    // Check social media platforms
    formData.socialMedia?.forEach(social => {
      const platform = social.platform?.toLowerCase()
      const validPlatforms = ['linkedin', 'github', 'twitter', 'facebook', 'instagram', 'youtube', 'portfolio']
      if (platform && !validPlatforms.includes(platform)) {
        unmappedValues.socialPlatforms.add(platform)
      }
    })

    if (unmappedValues.skillCategories.size > 0) {
    }
    if (unmappedValues.socialPlatforms.size > 0) {
    }

    return unmappedValues
  }

  // Helper function to format date for backend
  formatDate(dateString) {
    if (!dateString) return null
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
  }

  // Format resume data for API
  formatResumeData(formData) {
    return {
      title: formData.title || `${formData.firstName || 'Professional'} Resume`,
      template: formData.resumeStyle || 'modern',
      status: 'pending', // Set default status to pending
      description: formData.summary || '',
      tags: formData.skills?.map(skill => skill.name).filter(Boolean) || [],
      personalInfo: {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: formData.mobileNumber || '',
        address: {
          street: formData.address?.street || '',
          city: formData.address?.city || '',
          state: formData.address?.state || '',
          country: formData.address?.country || '',
          zipCode: formData.address?.zipCode || '',
          coordinates: formData.address?.coordinates || null
        },
        summary: formData.summary || ''
      },
      education: formData.education?.map(edu => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.fieldOfStudy || '',
        startDate: this.formatDate(edu.startDate),
        endDate: this.formatDate(edu.endDate),
        gpa: edu.gpa ? parseFloat(edu.gpa) : null,
        description: edu.description || ''
      })).filter(edu => edu.institution && edu.degree && edu.field) || [],
      experiences: formData.experiences?.map(exp => ({
        company: exp.company || '',
        role: exp.role || '',
        startDate: this.formatDate(exp.startDate),
        endDate: exp.current ? null : this.formatDate(exp.endDate),
        description: exp.description || '',
        achievements: exp.achievements || [],
        technologies: exp.technologies || []
      })).filter(exp => exp.company && exp.role) || [],
      projects: formData.projects?.map(project => ({
        name: project.name || '',
        description: project.description || '',
        technologies: typeof project.technologies === 'string' 
          ? project.technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
          : Array.isArray(project.technologies) 
            ? project.technologies.filter(tech => tech && tech.trim().length > 0)
            : [],
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
        startDate: this.formatDate(project.startDate),
        endDate: this.formatDate(project.endDate),
        screenshots: project.screenshots || []
      })).filter(project => project.name && project.description) || [],
      skills: formData.skills?.map(skill => {
        // Map UI category values to backend enum values
        const categoryMapping = {
          'technical': 'programming',
          'programming': 'programming',
          'database': 'database',
          'framework': 'framework',
          'tool': 'tool',
          'language': 'language',
          'soft': 'soft'
        }
        
        return {
          name: skill.name || '',
          level: skill.level || 'intermediate',
          category: categoryMapping[skill.category?.toLowerCase()] || 'programming'
        }
      }).filter(skill => skill.name && skill.name.trim()) || [],
      hobbies: formData.hobbies?.map(hobby => ({
        name: hobby.name || '',
        category: hobby.category || 'general',
        description: hobby.description || ''
      })).filter(hobby => hobby.name && hobby.name.trim()) || [],
      socialMedia: formData.socialMedia?.map(social => {
        // Map UI platform values to backend enum values
        const platformMapping = {
          'linkedin': 'linkedin',
          'github': 'github',
          'twitter': 'twitter',
          'facebook': 'facebook',
          'instagram': 'instagram',
          'portfolio': 'portfolio',
          'medium': 'portfolio', // Map medium to portfolio since it's not in backend enum
          'youtube': 'portfolio' // Map youtube to portfolio since it's not in backend enum
        }
        
        return {
          platform: platformMapping[social.platform?.toLowerCase()] || 'linkedin',
          url: social.url || '',
          username: social.username || ''
        }
      }).filter(social => social.url && social.url.trim()) || [],
      languages: formData.languages?.map(lang => {
        // Map UI proficiency values to backend enum values
        const proficiencyMapping = {
          'beginner': 'basic',
          'intermediate': 'conversational',
          'advanced': 'fluent',
          'native': 'native',
          'fluent': 'fluent'
        }
        
        return {
          name: lang.name || '',
          proficiency: proficiencyMapping[lang.proficiency?.toLowerCase()] || 'conversational'
        }
      }).filter(lang => lang.name && lang.name.trim()) || [],
      certifications: formData.certifications?.map(cert => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: this.formatDate(cert.issueDate),
        expiryDate: this.formatDate(cert.expiryDate),
        credentialId: cert.credentialId || '',
        url: cert.url || ''
      })).filter(cert => cert.name && cert.issuer) || []
    }
  }

  // Upload project screenshot
  async uploadScreenshot(file) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      // Create FormData
      const formData = new FormData()
      formData.append('screenshot', file)

      // Upload to backend
      const response = await api.post(ENDPOINTS.RESUME.UPLOAD_SCREENSHOT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.success) {
        return response.data.url || response.data.screenshotUrl
      } else {
        throw new Error(response.message || 'Failed to upload screenshot')
      }
    } catch (error) {
      throw error
    }
  }

  // Upload multiple screenshots
  async uploadMultipleScreenshots(files) {
    try {
      const uploadPromises = files.map(file => this.uploadScreenshot(file))
      const uploadedUrls = await Promise.all(uploadPromises)
      return uploadedUrls
    } catch (error) {
      throw error
    }
  }

  // Generate PDF for resume (GET method)
  async generatePDF(resumeId, template = 'ProfessionalTemplate') {
    try {
      const endpoint = ENDPOINTS.RESUME.GENERATE_PDF.replace(':id', resumeId)
      const url = `${endpoint}?template=${template}`
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`)
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'resume.pdf'

      // Create blob and return download info
      const blob = await response.blob()
      return {
        blob,
        filename,
        success: true
      }
    } catch (error) {
      throw error
    }
  }

  // Generate PDF for resume (POST method)
  async generatePDFPost(resumeId, template = 'ProfessionalTemplate') {
    try {
      const endpoint = ENDPOINTS.RESUME.GENERATE_PDF_POST.replace(':id', resumeId)
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template })
      })

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.status}`)
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'resume.pdf'

      // Create blob and return download info
      const blob = await response.blob()
      return {
        blob,
        filename,
        success: true
      }
    } catch (error) {
      throw error
    }
  }

  // Download PDF file
  downloadPDF(blob, filename) {
    try {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      throw error
    }
  }
}

// Create singleton instance
const resumeService = new ResumeService()

export default resumeService
