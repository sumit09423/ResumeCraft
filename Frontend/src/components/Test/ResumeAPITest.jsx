import { useState } from 'react'
import { resumeService } from '../../api'
import Header from '../Layout/Header'

const ResumeAPITest = () => {
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults([])

    try {
      // Test 1: Get all resumes
      try {
        addResult('Get All Resumes', 'running', 'Testing get all resumes...')
        const response = await resumeService.getAll()
        addResult('Get All Resumes', 'success', 'Successfully retrieved resumes', response)
      } catch (error) {
        addResult('Get All Resumes', 'error', `Failed: ${error.message}`)
      }

      // Test 2: Get templates
      try {
        addResult('Get Templates', 'running', 'Testing get available templates...')
        const response = await resumeService.getTemplates()
        addResult('Get Templates', 'success', 'Successfully retrieved templates', response)
      } catch (error) {
        addResult('Get Templates', 'error', `Failed: ${error.message}`)
      }

      // Test 3: Create resume
      try {
        addResult('Create Resume', 'running', 'Testing create resume...')
        const testResume = {
          title: 'Test Resume',
          template: 'modern',
          description: 'Test summary',
          tags: ['JavaScript', 'React'],
          personalInfo: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+1234567890',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'TC',
              country: 'Test Country',
              zipCode: '12345'
            },
            summary: 'Test summary'
          },
          education: [
            {
              institution: 'Test University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2019-09-01',
              endDate: '2023-06-15',
              gpa: 3.8,
              description: 'Graduated with honors'
            }
          ],
          experiences: [
            {
              company: 'Test Company',
              role: 'Software Developer',
              startDate: '2023-07-01',
              endDate: null,
              description: 'Developed web applications',
              achievements: ['Improved performance by 50%'],
              technologies: ['React', 'Node.js']
            }
          ],
          skills: [
            {
              name: 'JavaScript',
              level: 'intermediate',
              category: 'programming'
            }
          ],
          projects: [
            {
              name: 'Test Project',
              description: 'A test project description',
              technologies: ['React', 'Node.js'],
              githubUrl: 'https://github.com/test/project',
              liveUrl: 'https://test-project.com',
              startDate: '2023-01-01',
              endDate: '2023-06-01',
              screenshots: []
            }
          ],
          certifications: [
            {
              name: 'Test Certification',
              issuer: 'Test Issuer',
              issueDate: '2023-01-01',
              expiryDate: '2026-01-01',
              credentialId: 'TEST-123',
              url: 'https://test-cert.com'
            }
          ],
          languages: [
            {
              name: 'English',
              proficiency: 'native'
            },
            {
              name: 'Spanish',
              proficiency: 'conversational'
            }
          ],
          hobbies: [
            {
              name: 'Reading',
              category: 'general',
              description: 'Tech blogs and books'
            }
          ],
          socialMedia: [
            {
              platform: 'linkedin',
              url: 'https://linkedin.com/in/testuser',
              username: 'testuser'
            }
          ]
        }
        const response = await resumeService.create(testResume)
        addResult('Create Resume', 'success', 'Successfully created resume', response)
        
        // Test 4: Get resume by ID
        if (response.success && response.data.id) {
          try {
            addResult('Get Resume by ID', 'running', 'Testing get resume by ID...')
            const getResponse = await resumeService.getById(response.data.id)
            addResult('Get Resume by ID', 'success', 'Successfully retrieved resume', getResponse)
            
                         // Test 5: Update resume
             try {
               addResult('Update Resume', 'running', 'Testing update resume...')
               const updateData = { title: 'Updated Test Resume' }
               const updateResponse = await resumeService.update(response.data.id, updateData)
               addResult('Update Resume', 'success', 'Successfully updated resume', updateResponse)
               
               // Test 6: Change status
               try {
                 addResult('Change Status', 'running', 'Testing change resume status...')
                 const statusResponse = await resumeService.changeStatus(response.data.id, 'published')
                 addResult('Change Status', 'success', 'Successfully changed resume status', statusResponse)
                 
                 // Test 7: Duplicate resume
                 try {
                   addResult('Duplicate Resume', 'running', 'Testing duplicate resume...')
                   const duplicateResponse = await resumeService.duplicate(response.data.id)
                   addResult('Duplicate Resume', 'success', 'Successfully duplicated resume', duplicateResponse)
                   
                   // Test 8: Delete resume
                   try {
                     addResult('Delete Resume', 'running', 'Testing delete resume...')
                     await resumeService.delete(response.data.id)
                     addResult('Delete Resume', 'success', 'Successfully deleted resume')
                   } catch (error) {
                     addResult('Delete Resume', 'error', `Failed: ${error.message}`)
                   }
                 } catch (error) {
                   addResult('Duplicate Resume', 'error', `Failed: ${error.message}`)
                 }
               } catch (error) {
                 addResult('Change Status', 'error', `Failed: ${error.message}`)
               }
             } catch (error) {
               addResult('Update Resume', 'error', `Failed: ${error.message}`)
             }
          } catch (error) {
            addResult('Get Resume by ID', 'error', `Failed: ${error.message}`)
          }
        }
      } catch (error) {
        addResult('Create Resume', 'error', `Failed: ${error.message}`)
      }

    } catch (error) {
      addResult('Test Suite', 'error', `Test suite failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume API Test</h1>
              <p className="text-gray-600">Test the Resume API integration</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={clearResults}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Clear Results
              </button>
              <button
                onClick={runAllTests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.success === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${
                      result.success === 'success'
                        ? 'text-green-800'
                        : result.success === 'error'
                        ? 'text-red-800'
                        : 'text-yellow-800'
                    }`}>
                      {result.test}
                    </h3>
                    <p className={`text-sm ${
                      result.success === 'success'
                        ? 'text-green-600'
                        : result.success === 'error'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}>
                      {result.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-medium ${
                    result.success === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.success === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.success}
                  </div>
                </div>
                {result.data && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No test results yet. Click "Run All Tests" to start testing the API.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeAPITest
