import ModernTemplate from './ModernTemplate'
import ProfessionalTemplate from './ProfessionalTemplate'
import CreativeTemplate from './CreativeTemplate'
import ClassicTemplate from './ClassicTemplate'

// Template selector function
export const getTemplateComponent = (templateName) => {
  switch (templateName) {
    case 'modern':
      return ModernTemplate
    case 'professional':
      return ProfessionalTemplate
    case 'creative':
      return CreativeTemplate
    case 'classic':
      return ClassicTemplate
    default:
      return ModernTemplate
  }
}

export { ModernTemplate, ProfessionalTemplate, CreativeTemplate, ClassicTemplate }
