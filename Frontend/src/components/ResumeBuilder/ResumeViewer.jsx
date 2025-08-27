import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { resumeService, adminService } from '../../api'
import Header from '../Layout/Header'
import AdminLayout from '../Admin/Layout/AdminLayout'
import { getTemplateComponent } from './templates'
import ToastContainer from '../Common/ToastContainer'
import PDFDownloadButton from '../Common/PDFDownloadButton'

const ResumeViewer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showActions, setShowActions] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Check if this is an admin view
  const isAdminView = location.pathname.startsWith('/admin/')

  useEffect(() => {
    loadResume()
  }, [id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.dropdown-container')) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const loadResume = async () => {
    try {
      setLoading(true)
      let response
      
      if (isAdminView) {
        // Use admin service for admin view
        response = await adminService.getResumeById(id)
      } else {
        // For user view, use resume service
        response = await resumeService.getById(id)
      }
      
      const resumeData = response.data
      
      // Convert backend data to template-compatible format
      const templateData = {
        title: resumeData.title || 'Professional Resume',
        resumeStyle: resumeData.template || 'modern',
        firstName: resumeData.personalInfo?.firstName || '',
        lastName: resumeData.personalInfo?.lastName || '',
        email: resumeData.personalInfo?.email || '',
        mobileNumber: resumeData.personalInfo?.phone || '',
        location: resumeData.personalInfo?.location || 
          (resumeData.personalInfo?.address ? 
            `${resumeData.personalInfo.address.city || ''}${resumeData.personalInfo.address.city && resumeData.personalInfo.address.state ? ', ' : ''}${resumeData.personalInfo.address.state || ''}`.trim() 
            : ''),
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
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: !exp.endDate,
          description: exp.description || '',
          achievements: exp.achievements || [],
          technologies: exp.technologies || []
        })).filter(exp => exp.company && exp.company.trim()) || [],
        projects: resumeData.projects?.map(project => ({
          name: project.name || project.title || '',
          description: project.description || '',
          technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
          githubUrl: project.githubUrl || project.url || '',
          liveUrl: project.liveUrl || '',
          screenshots: project.screenshots || []
        })).filter(project => project.name && project.name.trim()) || [],
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
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          description: edu.description || ''
        })).filter(edu => edu.institution && edu.institution.trim()) || [],
        certifications: resumeData.certifications?.map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || '',
          expiryDate: cert.expiryDate || '',
          credentialId: cert.credentialId || '',
          url: cert.url || ''
        })).filter(cert => cert.name && cert.name.trim()) || [],
        languages: resumeData.languages?.map(lang => ({
          name: lang.name || '',
          proficiency: lang.proficiency || 'intermediate'
        })).filter(lang => lang.name.trim()) || [],
        primaryColor: resumeData.templateConfig?.colors?.primary || '#FF5C00',
        secondaryColor: resumeData.templateConfig?.colors?.secondary || '#FFFFFF',
        fontFamily: resumeData.templateConfig?.fonts?.heading || 'Arial',
        fontSize: '12px',
        layout: resumeData.templateConfig?.layout || 'modern'
      }
      
      const finalResume = {
        ...resumeData,
        templateData // Add the converted data for templates
      }
      

      
      setResume(finalResume)
    } catch (err) {
      console.error('Error loading resume:', err)
      
      // Provide more specific error messages
      if (err.status === 401) {
        setError('You are not authorized to view this resume. Please log in.')
      } else if (err.status === 403) {
        setError('You do not have permission to view this resume.')
      } else if (err.status === 404) {
        setError('Resume not found. It may have been deleted or moved.')
      } else if (err.message) {
        setError(`Failed to load resume: ${err.message}`)
      } else {
        setError('Failed to load resume. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (isAdminView) {
      navigate(`/admin/resumes/${id}/edit`)
    } else {
      navigate(`/resume-builder/${id}`)
    }
  }





  const handleDelete = async () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      if (isAdminView) {
        await adminService.deleteResume(id)
        window.showToast('Resume deleted successfully!', 'success')
        navigate('/admin/resumes')
      } else {
        await resumeService.delete(id)
        window.showToast('Resume deleted successfully!', 'success')
        navigate('/dashboard')
      }
    } catch (err) {
      window.showToast('Failed to delete resume. Please try again.', 'error')
      console.error('Error deleting resume:', err)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }



  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded ${statusClasses[status] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTemplateIcon = (template) => {
    const icons = {
      modern: '🎨',
      professional: '💼',
      creative: '✨',
      classic: '📄'
    }
    return icons[template] || '📄'
  }

  if (loading) {
    const LoadingContent = () => (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-8">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )

    if (isAdminView) {
      return (
        <AdminLayout title="Resume Preview">
          <LoadingContent />
        </AdminLayout>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingContent />
      </div>
    )
  }

  if (error || !resume) {
    const ErrorContent = () => (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resume not found</h3>
          <p className="text-gray-600 mb-6">{error || 'The resume you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(isAdminView ? '/admin/resumes' : '/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isAdminView ? 'Back to Resumes' : 'Back to Dashboard'}
          </button>
        </div>
      </div>
    )

    if (isAdminView) {
      return (
        <AdminLayout title="Resume Preview">
          <ErrorContent />
        </AdminLayout>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ErrorContent />
      </div>
    )
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

  const TemplateComponent = getTemplateComponent(resume.template)

  const MainContent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{getTemplateIcon(resume.template)}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
                <p className="text-gray-600 capitalize">{resume.template} Template</p>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  <span>Created: {new Date(resume.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  {resume.adminApproval && (
                    <span className={`px-3 py-1 rounded text-xs ${resume.adminApproval.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {resume.adminApproval.status} by Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
                {getStatusBadge(resume.status)}
                
                {/* PDF Download Button - Always visible */}
                <PDFDownloadButton
                  resumeId={id}
                  template={getBackendTemplate(resume.template)}
                  method="POST"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                  onSuccess={() => console.log('PDF downloaded successfully')}
                  onError={(error) => console.error('PDF download failed:', error)}
                >
                  Download PDF
                </PDFDownloadButton>
                
                {/* Only show Actions dropdown for user view, not admin view */}
                {!isAdminView && (
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Actions
                      <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {showActions && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={handleEdit}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            role="menuitem"
                          >
                            <svg className="mr-3 h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Resume
                          </button>

                          <button
                            onClick={handleDelete}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            role="menuitem"
                          >
                            <svg className="mr-3 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Resume Preview */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
            <p className="text-sm text-gray-600">This is how your resume will appear to others</p>
          </div>
          <div className="p-8">
            {TemplateComponent ? (
              <TemplateComponent 
                data={resume.templateData || resume}
                isPreview={true}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Template not found: {resume.template}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Comments */}
        {resume.adminApproval && resume.adminApproval.comments && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Feedback</h3>
            <p className="text-blue-800">{resume.adminApproval.comments}</p>
            <div className="mt-2 text-sm text-blue-600">
              Reviewed by {resume.adminApproval.reviewedBy} on {new Date(resume.adminApproval.reviewedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Only show for user view */}
        {showDeleteModal && !isAdminView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Resume</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{resume?.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )

  return (
    <>
      <ToastContainer />
      {isAdminView ? (
        <AdminLayout title="Resume Preview">
          <MainContent />
        </AdminLayout>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <MainContent />
        </div>
      )}
    </>
  )
}

export default ResumeViewer

