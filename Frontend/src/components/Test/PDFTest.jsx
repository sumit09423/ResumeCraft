import { useState } from 'react'
import { resumeService } from '../../api'
import PDFDownloadButton from '../Common/PDFDownloadButton'

const PDFTest = () => {
  const [resumeId, setResumeId] = useState('')
  const [template, setTemplate] = useState('ProfessionalTemplate')
  const [method, setMethod] = useState('POST')
  const [testResult, setTestResult] = useState('')

  const handleTestPDF = async () => {
    if (!resumeId) {
      setTestResult('Please enter a resume ID')
      return
    }

    setTestResult('Testing PDF generation...')
    try {
      let result
      if (method === 'POST') {
        result = await resumeService.generatePDFPost(resumeId, template)
      } else {
        result = await resumeService.generatePDF(resumeId, template)
      }
      setTestResult(`PDF generated successfully! Filename: ${result.filename}`)
    } catch (error) {
      setTestResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">PDF Generation Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume ID
          </label>
          <input
            type="text"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            placeholder="Enter resume ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ProfessionalTemplate">Professional</option>
            <option value="ModernTemplate">Modern</option>
            <option value="CreativeTemplate">Creative</option>
            <option value="ClassicTemplate">Classic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleTestPDF}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Test PDF Generation
          </button>

          {resumeId && (
            <PDFDownloadButton
              resumeId={resumeId}
              template={template}
              method={method}
              onSuccess={() => setTestResult('PDF downloaded successfully!')}
              onError={(error) => setTestResult(`Download error: ${error.message}`)}
            >
              Download PDF
            </PDFDownloadButton>
          )}
        </div>

        {testResult && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFTest
