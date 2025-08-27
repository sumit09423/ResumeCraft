import React, { useState } from 'react'

const ExperienceStep = ({ formData, handleArrayChange, addArrayItem, removeArrayItem, errors }) => {
  const [newTechnology, setNewTechnology] = useState('')

  const handleAddTechnology = (index) => {
    if (newTechnology.trim()) {
      const updatedExperiences = [...formData.experiences]
      if (!updatedExperiences[index].technologies) {
        updatedExperiences[index].technologies = []
      }
      updatedExperiences[index].technologies.push(newTechnology.trim())
      handleArrayChange('experiences', index, 'technologies', updatedExperiences[index].technologies)
      setNewTechnology('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
          <p className="text-gray-600">Add your professional experience</p>
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
            achievements: [],
            technologies: []
          })}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Add Experience
        </button>
      </div>
      
      {formData.experiences.map((exp, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeArrayItem('experiences', index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleArrayChange('experiences', index, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter company name"
              />
              {errors[`experience-${index}-company`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`experience-${index}-company`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <input
                type="text"
                value={exp.role}
                onChange={(e) => handleArrayChange('experiences', index, 'role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your role/title"
              />
              {errors[`experience-${index}-role`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`experience-${index}-role`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                value={exp.startDate}
                onChange={(e) => handleArrayChange('experiences', index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              {errors[`experience-${index}-startDate`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`experience-${index}-startDate`]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={exp.endDate}
                onChange={(e) => handleArrayChange('experiences', index, 'endDate', e.target.value)}
                disabled={exp.current}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => handleArrayChange('experiences', index, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe your role and responsibilities..."
            />
          </div>

          {/* Achievements Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Key Achievements</label>
              <button
                type="button"
                onClick={() => {
                  const newAchievements = [...exp.achievements, '']
                  handleArrayChange('experiences', index, 'achievements', newAchievements)
                }}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                + Add Achievement
              </button>
            </div>
            {exp.achievements.map((achievement, achievementIndex) => (
              <div key={achievementIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => {
                    const newAchievements = [...exp.achievements]
                    newAchievements[achievementIndex] = e.target.value
                    handleArrayChange('experiences', index, 'achievements', newAchievements)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter a key achievement..."
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAchievements = exp.achievements.filter((_, i) => i !== achievementIndex)
                    handleArrayChange('experiences', index, 'achievements', newAchievements)
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Technologies Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology(index)}
                  placeholder="Enter technology (e.g., React, Node.js, AWS)"
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddTechnology(index)}
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  + Add
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {exp.technologies?.map((tech, techIndex) => (
                <div key={techIndex} className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newTechnologies = exp.technologies.filter((_, i) => i !== techIndex)
                      handleArrayChange('experiences', index, 'technologies', newTechnologies)
                    }}
                    className="ml-1 text-purple-600 hover:text-purple-800 font-bold"
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
}

export default ExperienceStep
