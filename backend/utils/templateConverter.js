const fs = require('fs').promises;
const path = require('path');

class TemplateConverter {
  constructor() {
    this.templates = {};
    this.templatesPath = path.join(__dirname, '../templates');
  }

  async initializeTemplates() {
    try {
      const templateFiles = [
        'ModernTemplate.jsx',
        'ProfessionalTemplate.jsx', 
        'CreativeTemplate.jsx',
        'ClassicTemplate.jsx'
      ];

      for (const file of templateFiles) {
        const templateName = file.replace('Template.jsx', '').toLowerCase();
        const filePath = path.join(this.templatesPath, file);
        
        try {
          const jsxContent = await fs.readFile(filePath, 'utf8');
          this.templates[templateName] = this.convertJSXToHTML(jsxContent, templateName);
        } catch (error) {
          console.warn(`Warning: Could not load template ${file}:`, error.message);
          this.templates[templateName] = this.getOriginalTemplate(templateName);
        }
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
      this.templates = {
        modern: this.getOriginalModernTemplate(),
        professional: this.getOriginalProfessionalTemplate(),
        creative: this.getOriginalCreativeTemplate(),
        classic: this.getOriginalClassicTemplate()
      };
    }
  }

  convertJSXToHTML(jsxContent, templateName) {
    return this.getFallbackTemplate(templateName);
  }

  convertJSXSyntax(content) {
    content = content.replace(/className=/g, 'class=');
    content = content.replace(/<(\w+)\s*\/>/g, '<$1></$1>');
    content = content.replace(/\{([^}]+)\}/g, '${$1}');
    content = content.replace(/\{([^}]+)\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g, '${$1 ? $2 : $3}');
    content = content.replace(/\.map\(([^)]+)\)\.join\(''\)/g, '.map($1).join("")');
    
    return content;
  }

  generateFullHTML(templateContent, resumeData, templateName) {
    const css = this.getTemplateCSS(templateName);
    const data = this.mapResumeData(resumeData);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume - ${data.firstName || ''} ${data.lastName || ''}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${this.processTemplateContent(templateContent, data)}
      </body>
      </html>
    `;
  }

  mapResumeData(resumeData) {
    return {
      // Personal info mapping
      firstName: resumeData.personalInfo?.firstName || '',
      lastName: resumeData.personalInfo?.lastName || '',
      email: resumeData.personalInfo?.email || '',
      phone: resumeData.personalInfo?.phone || '',
      mobileNumber: resumeData.personalInfo?.phone || '',
      address: resumeData.personalInfo?.address || {},
      location: this.formatAddress(resumeData.personalInfo?.address),
      summary: resumeData.personalInfo?.summary || '',
      
      // Direct mappings
      experiences: resumeData.experiences || [],
      education: resumeData.education || [],
      projects: resumeData.projects || [],
      skills: resumeData.skills || [],
      hobbies: resumeData.hobbies || [],
      socialMedia: resumeData.socialMedia || [],
      languages: resumeData.languages || [],
      certifications: resumeData.certifications || [],
      
      // Template info
      template: resumeData.template,
      title: resumeData.title,
      status: resumeData.status,
      
      // Helper functions
      formatDate: this.formatDate,
      formatDateRange: this.formatDateRange,
      getSocialIcon: this.getSocialIcon,
      formatAddress: this.formatAddress
    };
  }

  processTemplateContent(content, data) {
    try {
      const templateFunction = new Function('data', `
        const { formatDate, formatDateRange, getSocialIcon, formatAddress } = data;
        return \`${content}\`;
      `);
      
      return templateFunction(data);
    } catch (error) {
      console.error('Error processing template:', error);
      return `<div>Error processing template: ${error.message}</div>`;
    }
  }

  formatAddress(address) {
    if (!address) return '';
    const parts = [address.street, address.city, address.state, address.zipCode, address.country];
    return parts.filter(part => part && part !== 'undefined' && part !== 'null').join(', ');
  }

  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  formatDateRange(startDate, endDate, current = false) {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = current ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
    return start && end ? `${start} - ${end}` : start || end;
  }

  getSocialIcon(platform) {
    const icons = {
      linkedin: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
      github: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>`,
      twitter: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>`
    };
    return icons[platform] || `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 101.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
    </svg>`;
  }

  getTemplateCSS(templateName) {
    const baseCSS = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', 'Jost', sans-serif; line-height: 1.6; color: #333; }
      .bg-white { background-color: white; }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      .rounded-lg { border-radius: 0.5rem; }
      .overflow-hidden { overflow: hidden; }
      .max-w-5xl { max-width: 64rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .lg\\:flex-row { flex-direction: row; }
      .w-full { width: 100%; }
      .lg\\:w-1\\/3 { width: 33.333333%; }
      .lg\\:w-2\\/3 { width: 66.666667%; }
      .bg-gray-900 { background-color: #111827; }
      .text-white { color: white; }
      .p-6 { padding: 1.5rem; }
      .lg\\:p-8 { padding: 2rem; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mb-8 { margin-bottom: 2rem; }
      .text-center { text-align: center; }
      .text-2xl { font-size: 1.5rem; }
      .lg\\:text-3xl { font-size: 1.875rem; }
      .font-bold { font-weight: 700; }
      .text-gray-300 { color: #d1d5db; }
      .text-base { font-size: 1rem; }
      .lg\\:text-lg { font-size: 1.125rem; }
      .break-words { word-wrap: break-word; }
      .text-lg { font-size: 1.125rem; }
      .lg\\:text-xl { font-size: 1.25rem; }
      .font-semibold { font-weight: 600; }
      .border-b { border-bottom-width: 1px; }
      .border-gray-700 { border-color: #374151; }
      .pb-2 { padding-bottom: 0.5rem; }
      .space-y-3 > * + * { margin-top: 0.75rem; }
      .items-start { align-items: flex-start; }
      .w-4 { width: 1rem; }
      .h-4 { height: 1rem; }
      .mr-3 { margin-right: 0.75rem; }
      .text-gray-400 { color: #9ca3af; }
      .flex-shrink-0 { flex-shrink: 0; }
      .mt-0\\.5 { margin-top: 0.125rem; }
      .text-sm { font-size: 0.875rem; }
      .text-xl { font-size: 1.25rem; }
      .lg\\:text-2xl { font-size: 1.5rem; }
      .text-gray-800 { color: #1f2937; }
      .border-b-2 { border-bottom-width: 2px; }
      .border-gray-300 { border-color: #d1d5db; }
      .text-gray-700 { color: #374151; }
      .leading-relaxed { line-height: 1.625; }
      .lg\\:justify-between { justify-content: space-between; }
      .lg\\:items-start { align-items: flex-start; }
      .gap-2 { gap: 0.5rem; }
      .text-gray-600 { color: #4b5563; }
      .font-medium { font-weight: 500; }
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 0.75rem; }
      .list-disc { list-style-type: disc; }
      .list-inside { list-style-position: inside; }
      .space-y-1 > * + * { margin-top: 0.25rem; }
      .flex-wrap { flex-wrap: wrap; }
      .bg-gray-200 { background-color: #e5e7eb; }
      .text-gray-800 { color: #1f2937; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .rounded-full { border-radius: 9999px; }
      .gap-4 { gap: 1rem; }
      .text-blue-600 { color: #2563eb; }
      .hover\\:text-blue-700:hover { color: #1d4ed8; }
      
      /* Classic template specific styles */
      .font-jost { font-family: 'Jost', sans-serif; }
      .hyphens-manual { hyphens: manual; }
      .max-w-3xl { max-width: 48rem; }
      .bg-gray-100 { background-color: #f3f4f6; }
      .border-4 { border-width: 4px; }
      .border-gray-700 { border-color: #374151; }
      .rounded-2xl { border-radius: 1rem; }
      .print\\:border-0 { border: 0; }
      .page { page-break-after: always; }
      .print\\:max-w-letter { max-width: 8.5in; }
      .print\\:max-h-letter { max-height: 11in; }
      .print\\:mx-0 { margin-left: 0; margin-right: 0; }
      .print\\:my-0 { margin-top: 0; margin-bottom: 0; }
      .print\\:bg-white { background-color: white; }
      .max-h-screen { max-height: 100vh; }
      .overflow-y-auto { overflow-y: auto; }
      .inline-flex { display: inline-flex; }
      .justify-between { justify-content: space-between; }
      .items-baseline { align-items: baseline; }
      .align-top { vertical-align: top; }
      .border-b-4 { border-bottom-width: 4px; }
      .border-gray-300 { border-color: #d1d5db; }
      .block { display: block; }
      .mb-0 { margin-bottom: 0; }
      .text-5xl { font-size: 3rem; }
      .text-gray-700 { color: #374151; }
      .m-0 { margin: 0; }
      .ml-2 { margin-left: 0.5rem; }
      .text-2xl { font-size: 1.5rem; }
      .leading-snugish { line-height: 1.375; }
      .mt-2 { margin-top: 0.5rem; }
      .text-xl { font-size: 1.25rem; }
      .text-gray-500 { color: #6b7280; }
      .justify-between { justify-content: space-between; }
      .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
      .mt-0 { margin-top: 0; }
      .mb-5 { margin-bottom: 1.25rem; }
      .text-4xl { font-size: 2.25rem; }
      .font-black { font-weight: 900; }
      .leading-none { line-height: 1; }
      .text-white { color: white; }
      .bg-gray-700 { background-color: #374151; }
      .initials-container { min-width: 4rem; }
      .print\\:bg-black { background-color: black; }
      .text-center { text-align: center; }
      .initial { font-size: 2rem; font-weight: 900; }
      
      @media print {
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        .resume-container { box-shadow: none; border-radius: 0; }
      }
    `;

    return baseCSS;
  }

  getTemplate(templateName) {
    return this.templates[templateName] || this.templates.modern;
  }

  getAvailableTemplates() {
    return Object.keys(this.templates);
  }

  getFallbackTemplate(templateName) {
    switch (templateName) {
      case 'modern': return this.getModernTemplate();
      case 'professional': return this.getProfessionalTemplate();
      case 'creative': return this.getCreativeTemplate();
      case 'classic': return this.getClassicTemplate();
      default: return this.getModernTemplate();
    }
  }

  getModernTemplate() {
    return {
      name: 'modern',
      generateHTML: (resumeData) => {
        const data = this.mapResumeData(resumeData);
        const css = this.getTemplateCSS('modern');
        
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume - ${data.firstName} ${data.lastName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>${css}</style>
          </head>
          <body>
            <div class="bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl mx-auto">
              <div class="flex flex-col lg:flex-row">
                <!-- Left Sidebar -->
                <div class="w-full lg:w-1/3 bg-gray-900 text-white p-6 lg:p-8">
                  <!-- Name and Title -->
                  <div class="text-center mb-8">
                    <h1 class="text-2xl lg:text-3xl font-bold mb-2 break-words">
                      ${data.firstName} ${data.lastName}
                    </h1>
                    <p class="text-gray-300 text-base lg:text-lg break-words">
                      ${data.experiences[0]?.role || 'Professional'}
                    </p>
                  </div>

                  <!-- Contact Information -->
                  <div class="mb-8">
                    <h3 class="text-lg lg:text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Contact</h3>
                    <div class="space-y-3">
                      ${data.email ? `
                        <div class="flex items-start">
                          <svg class="w-4 h-4 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span class="text-sm break-words">${data.email}</span>
                        </div>
                      ` : ''}
                      ${data.phone ? `
                        <div class="flex items-start">
                          <svg class="w-4 h-4 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span class="text-sm break-words">${data.phone}</span>
                        </div>
                      ` : ''}
                      ${data.location ? `
                        <div class="flex items-start">
                          <svg class="w-4 h-4 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                          </svg>
                          <span class="text-sm break-words">${data.location}</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Skills -->
                  ${data.skills && data.skills.length > 0 ? `
                    <div class="mb-8">
                      <h3 class="text-lg lg:text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Skills</h3>
                      <div class="flex flex-wrap gap-2">
                        ${data.skills.map(skill => `
                          <span class="inline-block bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs break-words">
                            ${skill.name}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Right Content -->
                <div class="w-full lg:w-2/3 p-6 lg:p-8">
                  <!-- Professional Summary -->
                  ${data.summary ? `
                    <div class="mb-8">
                      <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                        Professional Summary
                      </h2>
                      <p class="text-gray-700 leading-relaxed text-sm lg:text-base break-words">${data.summary}</p>
                    </div>
                  ` : ''}

                  <!-- Work Experience -->
                  ${data.experiences && data.experiences.length > 0 ? `
                    <div class="mb-8">
                      <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                        Work Experience
                      </h2>
                      ${data.experiences.map(exp => `
                        <div class="mb-6">
                          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2">
                            <h3 class="text-lg lg:text-xl font-semibold text-gray-800 break-words">${exp.role}</h3>
                            <span class="text-gray-600 text-sm flex-shrink-0">
                              ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                            </span>
                          </div>
                          <h4 class="text-base lg:text-lg font-medium text-gray-600 mb-2 break-words">${exp.company}</h4>
                          <p class="text-gray-700 mb-3 leading-relaxed text-sm lg:text-base break-words">${exp.description}</p>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  <!-- Education -->
                  ${data.education && data.education.length > 0 ? `
                    <div class="mb-8">
                      <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                        Education
                      </h2>
                      ${data.education.map(edu => `
                        <div class="mb-6">
                          <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2">
                            <h3 class="text-lg lg:text-xl font-semibold text-gray-800 break-words">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</h3>
                            <span class="text-gray-600 text-sm flex-shrink-0">
                              ${this.formatDateRange(edu.startDate, edu.endDate)}
                            </span>
                          </div>
                          <h4 class="text-base lg:text-lg font-medium text-gray-600 mb-2 break-words">${edu.institution}</h4>
                          ${edu.gpa ? `<p class="text-gray-700 text-sm">GPA: ${edu.gpa}</p>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      }
    };
  }

  getProfessionalTemplate() {
    return {
      name: 'professional',
      generateHTML: (resumeData) => {
        const data = this.mapResumeData(resumeData);
        const css = this.getTemplateCSS('professional');
        
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume - ${data.firstName} ${data.lastName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>${css}</style>
          </head>
          <body>
            <div class="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
              <!-- Header -->
              <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 lg:p-8">
                <div class="text-center">
                  <h1 class="text-2xl lg:text-4xl font-bold mb-2 break-words">
                    ${data.firstName} ${data.lastName}
                  </h1>
                  <p class="text-lg lg:text-xl opacity-90 mb-6 break-words">
                    ${data.experiences[0]?.role || 'Professional'}
                  </p>
                  <div class="flex flex-col lg:flex-row justify-center lg:space-x-8 space-y-2 lg:space-y-0 text-sm">
                    ${data.email ? `
                      <div class="flex items-center justify-center">
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span class="break-words">${data.email}</span>
                      </div>
                    ` : ''}
                    ${data.phone ? `
                      <div class="flex items-center justify-center">
                        <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span class="break-words">${data.phone}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>

              <div class="p-6 lg:p-8">
                <!-- Professional Summary -->
                ${data.summary ? `
                  <div class="mb-8">
                    <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <div class="w-8 h-1 bg-blue-600 mr-4"></div>
                      About Me
                    </h2>
                    <p class="text-gray-700 leading-relaxed text-base lg:text-lg break-words">${data.summary}</p>
                  </div>
                ` : ''}

                <!-- Work Experience -->
                ${data.experiences && data.experiences.length > 0 ? `
                  <div class="mb-8">
                    <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <div class="w-8 h-1 bg-blue-600 mr-4"></div>
                      Experience
                    </h2>
                    ${data.experiences.map(exp => `
                      <div class="mb-6 border-l-4 border-blue-200 pl-6">
                        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2">
                          <h3 class="text-lg lg:text-xl font-semibold text-gray-800 break-words">${exp.role}</h3>
                          <span class="text-blue-600 font-medium text-sm flex-shrink-0">
                            ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                          </span>
                        </div>
                        <h4 class="text-base lg:text-lg font-medium text-blue-600 mb-2 break-words">${exp.company}</h4>
                        <p class="text-gray-700 mb-3 leading-relaxed text-sm lg:text-base break-words">${exp.description}</p>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <!-- Skills -->
                ${data.skills && data.skills.length > 0 ? `
                  <div class="mb-8">
                    <h2 class="text-xl lg:text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <div class="w-8 h-1 bg-blue-600 mr-4"></div>
                      Skills
                    </h2>
                    <div class="flex flex-wrap gap-3">
                      ${data.skills.map(skill => `
                        <span class="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium break-words border border-blue-200">
                          ${skill.name}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </body>
          </html>
        `;
      }
    };
  }

  getCreativeTemplate() {
    return {
      name: 'creative',
      generateHTML: (resumeData) => {
        const data = this.mapResumeData(resumeData);
        const css = this.getTemplateCSS('creative');
        
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume - ${data.firstName} ${data.lastName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>${css}</style>
          </head>
          <body>
            <div class="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
              <!-- Header with creative design -->
              <div class="relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white p-6 lg:p-8 overflow-hidden">
                <div class="relative z-10">
                  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex-1">
                      <h1 class="text-3xl lg:text-5xl font-bold mb-2 tracking-tight break-words">
                        ${data.firstName} <span class="text-purple-200">${data.lastName}</span>
                      </h1>
                      <p class="text-xl lg:text-2xl opacity-90 mb-6 font-light break-words">
                        ${data.experiences[0]?.role || 'Creative Professional'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 lg:p-8">
                <!-- Professional Summary -->
                ${data.summary ? `
                  <div class="mb-8">
                    <h2 class="text-lg lg:text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-300 pb-2">
                      About Me
                    </h2>
                    <p class="text-gray-700 leading-relaxed text-base lg:text-lg break-words">${data.summary}</p>
                  </div>
                ` : ''}

                <!-- Work Experience -->
                ${data.experiences && data.experiences.length > 0 ? `
                  <div class="mb-8">
                    <h2 class="text-lg lg:text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-300 pb-2">
                      Experience
                    </h2>
                    ${data.experiences.map(exp => `
                      <div class="mb-6 bg-purple-50 border-l-4 border-purple-400 pl-6">
                        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2">
                          <h3 class="text-lg lg:text-xl font-semibold text-gray-800 break-words">${exp.role}</h3>
                          <span class="text-purple-600 font-medium text-sm flex-shrink-0">
                            ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                          </span>
                        </div>
                        <h4 class="text-base lg:text-lg font-medium text-purple-600 mb-2 break-words">${exp.company}</h4>
                        <p class="text-gray-700 mb-3 leading-relaxed text-sm lg:text-base break-words">${exp.description}</p>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <!-- Skills -->
                ${data.skills && data.skills.length > 0 ? `
                  <div class="mb-8">
                    <h2 class="text-lg lg:text-xl font-semibold text-gray-800 mb-4 border-b-2 border-purple-300 pb-2">
                      Skills
                    </h2>
                    <div class="flex flex-wrap gap-3">
                      ${data.skills.map(skill => `
                        <span class="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium break-words border border-purple-200">
                          ${skill.name}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </body>
          </html>
        `;
      }
    };
  }

  getClassicTemplate() {
    return {
      name: 'classic',
      generateHTML: (resumeData) => {
        const data = this.mapResumeData(resumeData);
        const css = this.getTemplateCSS('classic');
        
        return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume - ${data.firstName} ${data.lastName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>${css}</style>
          </head>
          <body>
            <div class="resume-container">
              <!-- Header -->
              <div class="header">
                <h1 class="name">${data.firstName} ${data.lastName}</h1>
                <p class="title">${data.experiences[0]?.role || 'Professional'}</p>
                <div class="contact-info">
                  ${data.email ? `<div class="contact-item">${data.email}</div>` : ''}
                  ${data.phone ? `<div class="contact-item">${data.phone}</div>` : ''}
                  ${data.location ? `<div class="contact-item">${data.location}</div>` : ''}
                </div>
              </div>

              <!-- Summary -->
              ${data.summary ? `
                <div class="section">
                  <h2 class="section-title">Professional Summary</h2>
                  <p>${data.summary}</p>
                </div>
              ` : ''}

              <!-- Experience -->
              ${data.experiences && data.experiences.length > 0 ? `
                <div class="section">
                  <h2 class="section-title">Professional Experience</h2>
                  ${data.experiences.map(exp => `
                    <div class="experience-item">
                      <div class="item-header">
                        <div>
                          <div class="item-title">${exp.role}</div>
                          <div class="item-subtitle">${exp.company}</div>
                        </div>
                        <div class="item-date">${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}</div>
                      </div>
                      <div class="item-description">${exp.description}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Education -->
              ${data.education && data.education.length > 0 ? `
                <div class="section">
                  <h2 class="section-title">Education</h2>
                  ${data.education.map(edu => `
                    <div class="education-item">
                      <div class="item-header">
                        <div>
                          <div class="item-title">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</div>
                          <div class="item-subtitle">${edu.institution}</div>
                        </div>
                        <div class="item-date">${this.formatDateRange(edu.startDate, edu.endDate)}</div>
                      </div>
                      ${edu.gpa ? `<div class="item-description"><strong>GPA:</strong> ${edu.gpa}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Skills -->
              ${data.skills && data.skills.length > 0 ? `
                <div class="section">
                  <h2 class="section-title">Skills</h2>
                  <div class="skills-grid">
                    ${data.skills.map(skill => `
                      <div class="skill-item">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-level">${skill.level}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </body>
          </html>
        `;
      }
    };
  }
}

module.exports = TemplateConverter;
