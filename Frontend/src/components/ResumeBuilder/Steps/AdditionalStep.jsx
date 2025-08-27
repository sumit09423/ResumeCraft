import React, { useState } from 'react'

const AdditionalStep = ({ formData, handleChange, handleArrayChange, addArrayItem, removeArrayItem, errors }) => {
  const [newHobby, setNewHobby] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Information</h2>
        <p className="text-gray-600">Add education, languages, certifications, hobbies and social media links</p>
      </div>
      
      {/* Education */}
      <div>
        <div className="flex justify-between items-center mb-4">
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
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add Education
          </button>
        </div>
        
        {formData.education.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeArrayItem('education', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="University/College name"
                />
                {errors[`education-${index}-institution`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education-${index}-institution`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Bachelor of Science"
                />
                {errors[`education-${index}-degree`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education-${index}-degree`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study *</label>
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleArrayChange('education', index, 'fieldOfStudy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Computer Science"
                />
                {errors[`education-${index}-fieldOfStudy`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education-${index}-fieldOfStudy`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={edu.gpa}
                  onChange={(e) => handleArrayChange('education', index, 'gpa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="3.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                {errors[`education-${index}-startDate`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`education-${index}-startDate`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={edu.endDate}
                  onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={edu.description}
                onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Brief description of your education, achievements, relevant coursework..."
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Languages */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
            placeholder="Enter language name (e.g., Spanish, French, German)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleAddLanguage}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add Language
          </button>
        </div>
        
        {formData.languages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded">
                <span className="text-sm font-medium">{lang.name}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('languages', index)}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {formData.languages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No languages added yet. Add your first language above!</p>
          </div>
        )}
      </div>
      
      {/* Certifications */}
      <div>
        <div className="flex justify-between items-center mb-4">
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
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add Certification
          </button>
        </div>
        
        {formData.certifications.map((cert, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeArrayItem('certifications', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name *</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
                {errors[`certification-${index}-name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`certification-${index}-name`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuer *</label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => handleArrayChange('certifications', index, 'issuer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Amazon Web Services"
                />
                {errors[`certification-${index}-issuer`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`certification-${index}-issuer`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input
                  type="date"
                  value={cert.issueDate}
                  onChange={(e) => handleArrayChange('certifications', index, 'issueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => handleArrayChange('certifications', index, 'expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
                <input
                  type="text"
                  value={cert.credentialId}
                  onChange={(e) => handleArrayChange('certifications', index, 'credentialId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., AWS-123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={cert.url}
                  onChange={(e) => handleArrayChange('certifications', index, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://verify.aws.com/cert/123456"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Hobbies */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hobbies & Interests</h3>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newHobby}
            onChange={(e) => setNewHobby(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHobby()}
            placeholder="Enter hobby name (e.g., Reading, Swimming, Photography)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleAddHobby}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add Hobby
          </button>
        </div>
        
        {formData.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.hobbies.map((hobby, index) => (
              <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded">
                <span className="text-sm font-medium">{hobby.name}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('hobbies', index)}
                  className="ml-2 text-green-600 hover:text-green-800 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {formData.hobbies.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No hobbies added yet. Add your first hobby above!</p>
          </div>
        )}
      </div>
      
      {/* Social Media */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Social Media</h3>
          <button
            type="button"
            onClick={() => addArrayItem('socialMedia', {
              platform: 'linkedin',
              url: '',
              username: ''
            })}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Add Social Media
          </button>
        </div>
        
        {formData.socialMedia.map((social, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Social Media {index + 1}</h4>
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
                  <option value="behance">Behance</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="medium">Medium</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={social.username}
                  onChange={(e) => handleArrayChange('socialMedia', index, 'username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder={social.platform === 'linkedin' ? 'john-doe' : 
                             social.platform === 'github' ? 'johndoe' :
                             social.platform === 'twitter' ? '@johndoe' : 'username'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => handleArrayChange('socialMedia', index, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder={social.platform === 'linkedin' ? 'https://linkedin.com/in/john-doe' :
                             social.platform === 'github' ? 'https://github.com/johndoe' :
                             social.platform === 'twitter' ? 'https://twitter.com/johndoe' : 'https://example.com'}
                />
                {errors[`social-${index}-url`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`social-${index}-url`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdditionalStep
