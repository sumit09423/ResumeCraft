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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Preview</h1>
              <p className="mt-2 text-gray-600">
                Preview your resume before downloading
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Resume
              </button>
              
              <PDFDownloadButton
                resumeId={resumeId}
                template={getBackendTemplate(selectedTemplate)}
                method="POST"
                onSuccess={() => console.log('PDF downloaded successfully')}
                onError={(error) => console.error('PDF download failed:', error)}
              >
                Download PDF
              </PDFDownloadButton>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTemplate('modern')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTemplate === 'modern'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setSelectedTemplate('professional')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTemplate === 'professional'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => setSelectedTemplate('creative')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTemplate === 'creative'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Creative
            </button>
            <button
              onClick={() => setSelectedTemplate('classic')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedTemplate === 'classic'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Classic
            </button>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderTemplate()}
        </div>
      </div>
    </div>
  )
}

export default ResumePreview
