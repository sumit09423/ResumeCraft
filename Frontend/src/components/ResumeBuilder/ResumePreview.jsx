import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline'
import { getTemplateComponent } from './templates'
import { resumeService } from '../../api'
import PDFDownloadButton from '../Common/PDFDownloadButton'

const ResumePreview = () => {
  const { resumeId } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  useEffect(() => {
    fetchResume()
  }, [resumeId])

  const fetchResume = async () => {
    try {
      const response = await resumeService.getById(resumeId)
      
      if (response.success && response.data) {
        setResume(response.data)
      } else {
        setResume(response)
      }
    } catch (error) {
      console.error('Error fetching resume:', error)
    } finally {
      setLoading(false)
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

  const renderTemplate = () => {
    const TemplateComponent = getTemplateComponent(selectedTemplate)
    return <TemplateComponent data={resume} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h2>
          <p className="text-gray-600">The resume you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resume Preview</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Preview your resume before downloading
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Resume
                </button>
                
                <PDFDownloadButton
                  resumeId={resumeId}
                  template={getBackendTemplate(selectedTemplate)}
                  method="POST"
                  className="w-full sm:w-auto"
                  onSuccess={() => console.log('PDF downloaded successfully')}
                  onError={(error) => console.error('PDF download failed:', error)}
                >
                  Download PDF
                </PDFDownloadButton>
              </div>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-3">Change Template</h3>
              <p className="text-sm text-gray-600">Try different templates to see which one looks best</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {resumeStyles.map((style) => (
                <div
                  key={style.id}
                  className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedTemplate === style.id
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setSelectedTemplate(style.id)}
                >
                  <div className="text-center">
                    <div className={`w-full h-16 sm:h-20 rounded-lg mb-2 sm:mb-3 flex items-center justify-center transition-all duration-300 ${
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
        </div>

        {/* Resume Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
            <p className="text-sm text-gray-600">This is how your resume will appear to others</p>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
            <div className="min-w-0">
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumePreview
