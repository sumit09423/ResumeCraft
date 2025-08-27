import { useState } from 'react'
import { resumeService } from '../../api'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const PDFDownloadButton = ({ 
  resumeId, 
  template = 'ProfessionalTemplate', 
  method = 'GET', // 'GET' or 'POST'
  className = '',
  children,
  onSuccess,
  onError 
}) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (!resumeId) {
      return
    }

    setIsGenerating(true)
    try {
      let result
      
      if (method === 'POST') {
        result = await resumeService.generatePDFPost(resumeId, template)
      } else {
        result = await resumeService.generatePDF(resumeId, template)
      }
      
      if (result.success) {
        resumeService.downloadPDF(result.blob, result.filename)
        if (onSuccess) {
          onSuccess(result)
        }
      }
    } catch (error) {
      if (onError) {
        onError(error)
      } else if (window.showToast) {
        window.showToast('Failed to generate PDF. Please try again.', 'error')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating || !resumeId}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating PDF...' : children || 'Download PDF'}
    </button>
  )
}

export default PDFDownloadButton
