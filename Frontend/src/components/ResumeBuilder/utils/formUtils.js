// Validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateCurrentStep = (currentStep, formData) => {
  const newErrors = {}

  switch (currentStep) {
    case 1:
      // Resume style step - no validation needed
      break
    
    case 2:
      // Personal info step
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required'
      } else if (!validatePhone(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid phone number'
      }
      break
    
    case 3:
      // Experience step - only validate if at least one field is filled
      formData.experiences.forEach((exp, index) => {
        const hasAnyData = exp.company.trim() || exp.role.trim() || exp.startDate
        if (hasAnyData) {
          if (!exp.company.trim()) {
            newErrors[`experience-${index}-company`] = 'Company name is required'
          }
          if (!exp.role.trim()) {
            newErrors[`experience-${index}-role`] = 'Role is required'
          }
          if (!exp.startDate) {
            newErrors[`experience-${index}-startDate`] = 'Start date is required'
          }
        }
      })
      break
    
    case 4:
      // Projects step
      formData.projects.forEach((project, index) => {
        if (!project.name.trim()) {
          newErrors[`project-${index}-name`] = 'Project name is required'
        }
        if (project.githubUrl && !project.githubUrl.includes('github.com')) {
          newErrors[`project-${index}-githubUrl`] = 'Please enter a valid GitHub URL'
        }
        if (project.liveUrl && !validateUrl(project.liveUrl)) {
          newErrors[`project-${index}-liveUrl`] = 'Please enter a valid live demo URL'
        }
      })
      break
    
    case 5:
      // Skills step
      formData.skills.forEach((skill, index) => {
        if (!skill.name.trim()) {
          newErrors[`skill-${index}-name`] = 'Skill name is required'
        }
      })
      break
    
    case 6:
      // Additional step (hobbies, social media, education, languages, certifications)
      formData.socialMedia.forEach((social, index) => {
        if (social.url && !validateUrl(social.url)) {
          newErrors[`social-${index}-url`] = 'Please enter a valid URL'
        }
      })
      
      // Education validation - only validate if at least one field is filled
      formData.education.forEach((edu, index) => {
        const hasAnyData = edu.institution.trim() || edu.degree.trim() || edu.fieldOfStudy.trim()
        if (hasAnyData) {
          if (!edu.institution.trim()) {
            newErrors[`education-${index}-institution`] = 'Institution name is required'
          }
          if (!edu.degree.trim()) {
            newErrors[`education-${index}-degree`] = 'Degree is required'
          }
          if (!edu.fieldOfStudy.trim()) {
            newErrors[`education-${index}-fieldOfStudy`] = 'Field of study is required'
          }
        }
      })
      
      // Languages validation - only validate if name is filled
      formData.languages.forEach((lang, index) => {
        // Languages are optional, so no validation needed if empty
      })
      
      // Certifications validation - only validate if at least one field is filled
      formData.certifications.forEach((cert, index) => {
        const hasAnyData = cert.name.trim() || cert.issuer.trim()
        if (hasAnyData) {
          if (!cert.name.trim()) {
            newErrors[`certification-${index}-name`] = 'Certification name is required'
          }
          if (!cert.issuer.trim()) {
            newErrors[`certification-${index}-issuer`] = 'Issuer is required'
          }
        }
      })
      break
  }

  return newErrors
}

export const validateForm = (formData) => {
  const newErrors = {}

  // Required fields validation
  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required'
  }
  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required'
  }
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!validateEmail(formData.email)) {
    newErrors.email = 'Please enter a valid email address'
  }
  if (!formData.mobileNumber.trim()) {
    newErrors.mobileNumber = 'Mobile number is required'
  } else if (!validatePhone(formData.mobileNumber)) {
    newErrors.mobileNumber = 'Please enter a valid phone number'
  }

  // Experience validation
  formData.experiences.forEach((exp, index) => {
    if (!exp.company.trim()) {
      newErrors[`experience-${index}-company`] = 'Company name is required'
    }
    if (!exp.role.trim()) {
      newErrors[`experience-${index}-role`] = 'Role is required'
    }
    if (!exp.startDate) {
      newErrors[`experience-${index}-startDate`] = 'Start date is required'
    }
  })

  // Project validation
  formData.projects.forEach((project, index) => {
    if (!project.name.trim()) {
      newErrors[`project-${index}-name`] = 'Project name is required'
    }
    if (project.githubUrl && !project.githubUrl.includes('github.com')) {
      newErrors[`project-${index}-githubUrl`] = 'Please enter a valid GitHub URL'
    }
    if (project.liveUrl && !validateUrl(project.liveUrl)) {
      newErrors[`project-${index}-liveUrl`] = 'Please enter a valid live demo URL'
    }
  })

  // Skills validation
  formData.skills.forEach((skill, index) => {
    if (!skill.name.trim()) {
      newErrors[`skill-${index}-name`] = 'Skill name is required'
    }
  })

  // Education validation
  formData.education.forEach((edu, index) => {
    if (!edu.institution.trim()) {
      newErrors[`education-${index}-institution`] = 'Institution name is required'
    }
    if (!edu.degree.trim()) {
      newErrors[`education-${index}-degree`] = 'Degree is required'
    }
    if (!edu.fieldOfStudy.trim()) {
      newErrors[`education-${index}-fieldOfStudy`] = 'Field of study is required'
    }
    if (!edu.startDate) {
      newErrors[`education-${index}-startDate`] = 'Start date is required'
    }
  })

  // Languages validation
  formData.languages.forEach((lang, index) => {
    if (!lang.name.trim()) {
      newErrors[`language-${index}-name`] = 'Language name is required'
    }
  })

  // Certifications validation
  formData.certifications.forEach((cert, index) => {
    if (!cert.name.trim()) {
      newErrors[`certification-${index}-name`] = 'Certification name is required'
    }
    if (!cert.issuer.trim()) {
      newErrors[`certification-${index}-issuer`] = 'Issuer is required'
    }
  })

  // Social media validation
  formData.socialMedia.forEach((social, index) => {
    if (social.url && !validateUrl(social.url)) {
      newErrors[`social-${index}-url`] = 'Please enter a valid URL'
    }
  })

  return newErrors
}
