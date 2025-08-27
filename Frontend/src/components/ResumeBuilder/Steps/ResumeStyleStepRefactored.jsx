import { Controller } from 'react-hook-form'

const ResumeStyleStepRefactored = ({ control, resumeStyles }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Resume Style</h2>
        <p className="text-gray-600">Select a template that best represents your professional style</p>
      </div>
      
      <Controller
        name="resumeStyle"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resumeStyles.map((style) => (
              <div
                key={style.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover-lift ${
                  field.value === style.id
                    ? 'border-orange-500 bg-orange-50 shadow-lg glow-orange'
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                }`}
                onClick={() => field.onChange(style.id)}
              >
                <div className="text-center">
                  <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center transition-all duration-300 ${
                    style.id === 'modern' 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                      : style.id === 'professional'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                      : style.id === 'creative'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-gray-600 to-gray-800'
                  }`}>
                    <div className="text-center text-white">
                      <div className={`w-12 h-16 bg-white rounded shadow-sm mx-auto mb-2 ${
                        style.id === 'modern' ? 'shadow-gray-200' 
                        : style.id === 'professional' ? 'shadow-blue-200'
                        : style.id === 'creative' ? 'shadow-purple-200'
                        : 'shadow-gray-200'
                      }`}></div>
                      <span className="text-white text-xs font-medium">{style.name}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{style.name}</h3>
                  <p className="text-gray-600 text-xs leading-tight">{style.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  )
}

export default ResumeStyleStepRefactored
