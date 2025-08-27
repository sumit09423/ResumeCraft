import React from 'react'

const CreativeTemplate = ({ data }) => {
  // Social media icons mapping
  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )
      case 'github':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        )
      case 'twitter':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        )
      case 'instagram':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      case 'youtube':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      case 'medium':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
        )
      case 'behance':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.561-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H13.96c.13 3.211 3.483 3.312 4.588 2.029h3.178zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h4.976c4.37 0 6.976 2.888 6.976 6.988 0 4.098-2.605 6.988-6.976 6.988zM2.977 9.955h1.942c2.128 0 3.444-1.455 3.444-3.466 0-2.013-1.316-3.466-3.444-3.466H2.977v6.932z"/>
          </svg>
        )
      case 'dribbble':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-2.17-.9-2.17-.9s2.54-1.643 2.986-6.706c1.98 1.988 1.98 5.71.184 7.606zM12 2.04c-2.834 0-5.286 1.646-6.45 3.783A5.95 5.95 0 018.54 12c0 3.314-2.686 6-6 6a5.95 5.95 0 01-6.29-2.96C2.04 18.354 6.166 22 12 22c5.514 0 10-4.486 10-10 0-5.514-4.486-10-10-10z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 101.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header with creative design */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white p-6 lg:p-8 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-8 right-8 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-8 left-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-5xl font-bold mb-2 tracking-tight break-words">
                {data.firstName} <span className="text-purple-200">{data.lastName}</span>
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 mb-6 font-light break-words">
                {data.experiences[0]?.role || 'Creative Professional'}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                {data.email && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="break-words">{data.email}</span>
                  </div>
                )}
                {data.mobileNumber && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="break-words">{data.mobileNumber}</span>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-200 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="break-words">{data.location}</span>
                  </div>
                )}
              </div>
            </div>
            {data.profilePicture && (
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-purple-200 mt-4 lg:mt-0 lg:ml-6">
                <img 
                  src={data.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Professional Summary */}
        {data.summary && (
          <div className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
              About Me
            </h2>
            <p className="text-gray-700 leading-relaxed text-base lg:text-lg italic break-words">{data.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.experiences && data.experiences.length > 0 && data.experiences[0].company && (
          <div className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
              Experience
            </h2>
            {data.experiences.map((exp, index) => (
              <div key={index} className="mb-6 relative">
                <div className="absolute left-0 top-0 w-3 h-3 bg-purple-500 rounded-full -ml-6 mt-2"></div>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 break-words">{exp.role}</h3>
                  <span className="text-purple-600 font-medium text-sm flex-shrink-0">
                    {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {exp.endDate && ` - ${new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    {exp.current && ' - Present'}
                  </span>
                </div>
                <h4 className="text-base lg:text-lg font-medium text-purple-600 mb-2 break-words">{exp.company}</h4>
                <p className="text-gray-700 mb-3 leading-relaxed text-sm lg:text-base break-words">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-none space-y-1">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-purple-500 mr-2 flex-shrink-0">▸</span>
                        <span className="break-words">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && data.skills.some(skill => skill.name && skill.name.trim()) && (
          <div className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.filter(skill => skill.name && skill.name.trim()).map((skill, index) => (
                <span
                  key={index}
                  className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium break-words border border-purple-200 hover:shadow-md transition-all duration-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && data.projects[0].name && (
          <div className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
              Creative Projects
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.projects.map((project, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 break-words">{project.name}</h3>
                  <p className="text-gray-700 mb-3 text-sm leading-relaxed break-words">{project.description}</p>
                  {project.technologies && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Tools & Technologies: </span>
                      <span className="text-sm text-gray-700 break-words">{project.technologies}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium break-words"
                      >
                        View Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium break-words"
                      >
                        Live Project
                      </a>
                    )}
                  </div>
                  
                  {/* Project Screenshots */}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshots:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.screenshots.map((screenshot, screenshotIndex) => (
                          <a
                            key={screenshotIndex}
                            href={screenshot.url || screenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium break-words"
                          >
                            Screenshot {screenshotIndex + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && data.hobbies[0].name && (
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
                Passions & Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded text-sm font-medium break-words"
                  >
                    {hobby.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media */}
          {data.socialMedia && data.socialMedia.length > 0 && data.socialMedia[0].platform && (
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-4">
                Connect With Me
              </h2>
              <div className="space-y-3">
                {data.socialMedia.map((social, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0">
                      {getSocialIcon(social.platform)}
                    </div>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm break-words"
                    >
                      {social.username}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreativeTemplate
