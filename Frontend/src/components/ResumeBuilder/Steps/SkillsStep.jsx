import React, { useState } from 'react'

const SkillsStep = ({ formData, addArrayItem, removeArrayItem }) => {
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addArrayItem('skills', {
        name: newSkill.trim(),
        level: 'intermediate',
        category: 'programming'
      })
      setNewSkill('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
        <p className="text-gray-600">Add your technical and professional skills</p>
      </div>
      
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
          placeholder="Enter skill name (e.g., JavaScript, React, Node.js)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Add Skill
        </button>
      </div>
      
      {formData.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded">
              <span className="text-sm font-medium">{skill.name}</span>
              <button
                type="button"
                onClick={() => removeArrayItem('skills', index)}
                className="ml-2 text-orange-600 hover:text-orange-800 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {formData.skills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No skills added yet. Add your first skill above!</p>
        </div>
      )}
    </div>
  )
}

export default SkillsStep
