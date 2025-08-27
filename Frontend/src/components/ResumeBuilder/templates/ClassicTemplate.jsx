import React from 'react'

const ClassicTemplate = ({ data }) => {
  // Get initials from first and last name
  const getInitials = () => {
    const first = data.firstName ? data.firstName.charAt(0).toUpperCase() : ''
    const last = data.lastName ? data.lastName.charAt(0).toUpperCase() : ''
    return { first, last }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Get current role from experiences
  const getCurrentRole = () => {
    if (data.experiences && data.experiences.length > 0) {
      return data.experiences[0].role || 'Professional'
    }
    return 'Professional'
  }

  const initials = getInitials()

  return (
    <main className="font-jost hyphens-manual">
      <section className="p-2 mx-auto max-w-3xl bg-gray-100 rounded-2xl border-4 border-gray-700 sm:p-6 md:p-8 lg:mt-6 print:border-0 page print:max-w-letter print:max-h-letter print:mx-0 print:my-0 xsm:p-8 print:bg-white md:max-w-letter max-h-screen overflow-y-auto">
        {/* Header with name and initials */}
        <header className="inline-flex justify-between items-baseline mb-2 w-full align-top border-b-4 border-gray-300">
          <section className="block">
            <h1 className="mb-0 text-5xl font-bold text-gray-700">
              {data.firstName} {data.lastName}
            </h1>
            <h2 className="m-0 ml-2 text-2xl font-semibold text-gray-700 leading-snugish">
              {getCurrentRole()}
            </h2>
            {data.location && (
              <h3 className="m-0 mt-2 ml-2 text-xl font-semibold text-gray-500 leading-snugish">
                {data.location}
              </h3>
            )}
          </section>
          
          {/* Initials Block */}
          <section className="justify-between px-3 mt-0 mb-5 text-4xl font-black leading-none text-white bg-gray-700 initials-container print:bg-black" style={{ paddingBottom: '1.5rem', paddingTop: '1.5rem' }}>
            <section className="text-center initial">{initials.first}</section>
            <section className="text-center initial">{initials.last}</section>
          </section>
        </header>

        {/* Single Column Layout - Step by Step */}
        <section className="w-full">
          {/* Contact Information */}
          <section className="pb-2 mt-2 mb-0 first:mt-0">
            <section className="break-inside-avoid">
              <section className="pb-3 mb-2 border-b-4 border-gray-300 break-inside-avoid">
                <ul className="pr-7 list-inside">
                  {data.socialMedia && data.socialMedia.length > 0 && data.socialMedia.find(s => s.platform.toLowerCase() === 'linkedin') && (
                    <li className="mt-1 leading-normal text-black text-gray-500 transition duration-100 ease-in hover:text-gray-700 text-md print:">
                      <a href={data.socialMedia.find(s => s.platform.toLowerCase() === 'linkedin').url} className="group" target="_blank" rel="noopener noreferrer">
                        <span className="mr-2 text-lg font-semibold text-gray-700 leading-snugish">
                          Portfolio:
                        </span>
                        {data.socialMedia.find(s => s.platform.toLowerCase() === 'linkedin').username}
                        <span className="inline-block font-normal text-black text-gray-500 transition duration-100 ease-in group-hover:text-gray-700 print:text-black print:">
                          ↗
                        </span>
                      </a>
                    </li>
                  )}
                  {data.socialMedia && data.socialMedia.length > 0 && data.socialMedia.find(s => s.platform.toLowerCase() === 'github') && (
                    <li className="mt-1 leading-normal text-gray-500 transition duration-100 ease-in hover:text-gray-700 text-md">
                      <a href={data.socialMedia.find(s => s.platform.toLowerCase() === 'github').url} className="group" target="_blank" rel="noopener noreferrer">
                        <span className="mr-5 text-lg font-semibold text-gray-700 leading-snugish">
                          Github:
                        </span>
                        {data.socialMedia.find(s => s.platform.toLowerCase() === 'github').username}
                        <span className="inline-block font-normal text-black text-gray-500 transition duration-100 ease-in group-hover:text-gray-700 print:text-black print:">
                          ↗
                        </span>
                      </a>
                    </li>
                  )}
                  {data.email && (
                    <li className="mt-1 leading-normal text-gray-500 transition duration-100 ease-in hover:text-gray-700 text-md">
                      <a href={`mailto:${data.email}`} className="group">
                        <span className="mr-8 text-lg font-semibold text-gray-700 leading-snugish">
                          Email:
                        </span>
                        {data.email}
                        <span className="inline-block font-normal text-gray-500 transition duration-100 ease-in group-hover:text-gray-700 print:text-black">
                          ↗
                        </span>
                      </a>
                    </li>
                  )}
                  {data.mobileNumber && (
                    <li className="mt-1 leading-normal text-gray-500 transition duration-100 ease-in hover:text-gray-700 text-md">
                      <a href={`tel:${data.mobileNumber}`}>
                        <span className="mr-5 text-lg font-semibold text-gray-700 leading-snugish">
                          Phone:
                        </span>
                        {data.mobileNumber}
                      </a>
                    </li>
                  )}
                </ul>
              </section>
            </section>
          </section>

          {/* Summary */}
          {data.summary && (
            <section className="pb-2 pb-3 mt-0 border-b-4 border-gray-300 first:mt-0">
              <section className="break-inside-avoid">
                <h2 className="mb-1 text-xl font-bold tracking-widest text-gray-700 print:font-normal">
                  SUMMARY
                </h2>
                <section className="mb-1 break-inside-avoid">
                  <p className="mt-1 leading-normal text-gray-700 text-md">
                    {data.summary}
                  </p>
                </section>
              </section>
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && data.education[0].institution && (
            <section className="pb-0 mt-1 border-b-4 border-gray-300 first:mt-0 break-inside-avoid">
              <section className="break-inside-avoid">
                <h2 className="mb-1 text-lg font-bold tracking-widest text-gray-700 print:font-normal">
                  EDUCATION
                </h2>
                {data.education.map((edu, index) => (
                  <section key={index} className={`mt-2 ${index < data.education.length - 1 ? 'border-b-2' : ''} break-inside-avoid`}>
                    <header>
                      <h3 className="text-lg font-semibold text-gray-700 leading-snugish">
                        {edu.institution}
                      </h3>
                      <p className="leading-normal text-gray-500 text-md">
                        {formatDate(edu.startDate)} &ndash; {edu.endDate ? formatDate(edu.endDate) : 'Present'} | {edu.degree}
                      </p>
                    </header>
                    {edu.major && (
                      <ul className="mt-2 list-disc list-inside text-gray-800 text-md">
                        <li>
                          <span className="font-semibold text-md">Major:</span> {edu.major}
                        </li>
                        {edu.minor && (
                          <li>
                            <span className="font-semibold text-md">Minor:</span> {edu.minor}
                          </li>
                        )}
                        {edu.gpa && (
                          <li>
                            <span className="font-semibold text-md">GPA:</span> {edu.gpa}
                          </li>
                        )}
                        {edu.skills && (
                          <li>
                            <span className="font-semibold text-md">Skills:</span> {edu.skills}
                          </li>
                        )}
                      </ul>
                    )}
                  </section>
                ))}
              </section>
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && data.skills.some(skill => skill.name && skill.name.trim()) && (
            <section className="pb-3 mt-0 mb-2 border-b-4 border-gray-300 first:mt-0 break-inside-avoid">
              <section className="break-inside-avoid">
                <h2 className="mb-1 text-lg font-bold tracking-widest text-gray-700 print:font-normal">
                  SKILLS
                </h2>
                <section className="mb-0 break-inside-avoid">
                  <section className="mt-1 last:pb-1">
                    <ul className="flex flex-wrap gap-2 font-bold leading-relaxed text-md">
                      {data.skills.filter(skill => skill.name && skill.name.trim()).map((skill, index) => (
                        <li key={index} className="p-2 leading-relaxed text-gray-800 bg-transparent border border-gray-400 rounded print:bg-white print:border-inset">
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  </section>
                </section>
              </section>
            </section>
          )}

          {/* Experience Section */}
          {data.experiences && data.experiences.length > 0 && data.experiences[0].company && (
            <section className="pb-2 pb-3 mt-2 border-b-4 border-gray-300 first:mt-0">
              <section className="break-inside-avoid">
                <h2 className="mb-1 text-xl font-black tracking-widest text-gray-800 print:font-normal">
                  EXPERIENCE
                </h2>
                {data.experiences.map((exp, index) => (
                  <section key={index} className={`mb-2 ${index < data.experiences.length - 1 ? 'border-b-2 border-gray-300' : 'border-b-0 border-gray-300'} break-inside-avoid`}>
                    <header>
                      <h3 className="font-semibold text-gray-800 text-md leading-snugish">
                        {exp.role}
                      </h3>
                      <p className="text-sm leading-normal text-gray-500">
                        {formatDate(exp.startDate)} &ndash; {exp.current ? 'Present' : formatDate(exp.endDate)} | {exp.company}
                      </p>
                    </header>
                    <ul className="pl-3 mt-2 font-normal text-gray-700 text-md leading-snugish">
                      {exp.description && (
                        <li>
                          <span className="text-gray-500 transform -translate-y-px select-none">
                            &rsaquo;
                          </span>
                          {exp.description}
                        </li>
                      )}
                      {exp.achievements && exp.achievements.map((achievement, idx) => (
                        <li key={idx}>
                          <span className="text-gray-500 transform -translate-y-px select-none">
                            &rsaquo;
                          </span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </section>
            </section>
          )}

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && data.projects[0].name && (
            <section className="pb-2 pb-3 mt-2 border-b-4 border-gray-300 first:mt-0">
              <section className="break-inside-avoid">
                <h2 className="mb-1 text-xl font-bold tracking-widest text-gray-700 print:font-normal">
                  PROJECTS
                </h2>
                {data.projects.map((project, index) => (
                  <section key={index} className="mb-2 border-b-2 border-gray-300 break-inside-avoid">
                    <header>
                      <h3 className="font-semibold text-gray-800 text-md leading-snugish">
                        {project.name}
                      </h3>
                    </header>
                    <p className="text-gray-700 mb-2 leading-relaxed text-sm">{project.description}</p>
                    {project.technologies && (
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="font-semibold">Technologies:</span> {project.technologies}
                      </p>
                    )}
                    <ul className="pl-3 mt-2 font-normal text-gray-700 text-md leading-snugish">
                      {project.githubUrl && (
                        <li>
                          <span className="text-gray-500 transform -translate-y-px select-none">&rsaquo;</span>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                            GitHub Repository
                          </a>
                        </li>
                      )}
                      {project.liveUrl && (
                        <li>
                          <span className="text-gray-500 transform -translate-y-px select-none">&rsaquo;</span>
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                            Live Demo
                          </a>
                        </li>
                      )}
                    </ul>
                    
                    {/* Project Screenshots */}
                    {project.screenshots && project.screenshots.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Screenshots:</p>
                        <ul className="pl-3 mt-2 font-normal text-gray-700 text-md leading-snugish">
                          {project.screenshots.map((screenshot, screenshotIndex) => (
                            <li key={screenshotIndex}>
                              <span className="text-gray-500 transform -translate-y-px select-none">&rsaquo;</span>
                              <a 
                                href={screenshot.url || screenshot} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-700 hover:text-gray-900"
                              >
                                Screenshot {screenshotIndex + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}
              </section>
            </section>
          )}
        </section>
      </section>
    </main>
  )
}

export default ClassicTemplate
