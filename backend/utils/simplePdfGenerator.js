const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class SimplePDFGenerator {
  constructor() {
    this.browser = null;
    this.templatesPath = path.join(__dirname, '../pdfhtml');
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async loadHTMLTemplate(templateName) {
    const templatePath = path.join(this.templatesPath, `${templateName}.html`);
    try {
      const htmlContent = await fs.readFile(templatePath, 'utf8');
      return htmlContent;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error.message);
      return null;
    }
  }

  populateTemplateWithData(htmlContent, resumeData) {
    let populatedHTML = htmlContent;

    const fullName = `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim();
    populatedHTML = populatedHTML.replace(/John Doe/g, fullName);
    populatedHTML = populatedHTML.replace(/John <span style="color: #e9d5ff;">Doe<\/span>/g, fullName);
    populatedHTML = populatedHTML.replace(/johndoe@example\.com/g, resumeData.personalInfo?.email || '');
    populatedHTML = populatedHTML.replace(/john\.doe@email\.com/g, resumeData.personalInfo?.email || '');
    populatedHTML = populatedHTML.replace(/\+91 9876543210/g, resumeData.personalInfo?.phone || '');
    populatedHTML = populatedHTML.replace(/\+91-98765-43210/g, resumeData.personalInfo?.phone || '');
    
    const location = this.formatAddress(resumeData.personalInfo?.address);
    populatedHTML = populatedHTML.replace(/New Delhi, India/g, location);
    populatedHTML = populatedHTML.replace(/New York, USA/g, location);
    populatedHTML = populatedHTML.replace(/Ahmedabad, India/g, location);
    populatedHTML = populatedHTML.replace(/New York, USA/g, location);

    if (resumeData.personalInfo?.summary) {
      const summaryPlaceholders = [
        /Experienced software engineer with a passion for building scalable web applications and working across the full stack\./g,
        /Passionate designer with experience in creative branding and UI\/UX solutions\./g,
        /Experienced software engineer with a strong background in web development and UI\/UX design\. Skilled in modern frameworks and passionate about delivering high-quality digital solutions\./g,
        /Passionate designer with experience in creative branding and UI\/UX solutions\./g
      ];
      
      summaryPlaceholders.forEach(placeholder => {
        populatedHTML = populatedHTML.replace(placeholder, resumeData.personalInfo.summary);
      });
    }

    if (resumeData.experiences && resumeData.experiences.length > 0) {
      const exp = resumeData.experiences[0];
      
      populatedHTML = populatedHTML.replace(/Senior Developer/g, exp.role || '');
      populatedHTML = populatedHTML.replace(/UI\/UX Designer/g, exp.role || '');
      populatedHTML = populatedHTML.replace(/Front-End Developer/g, exp.role || '');
      populatedHTML = populatedHTML.replace(/ABC Technologies/g, exp.company || '');
      populatedHTML = populatedHTML.replace(/ABC Design Studio/g, exp.company || '');
      populatedHTML = populatedHTML.replace(/Influx Worldwide/g, exp.company || '');
      populatedHTML = populatedHTML.replace(/Creative Professional/g, exp.role || '');
      
      const dateRange = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}`;
      populatedHTML = populatedHTML.replace(/Jan 2020 - Present/g, dateRange);
      populatedHTML = populatedHTML.replace(/Mar 2022 -/g, dateRange);
      populatedHTML = populatedHTML.replace(/Aug 2024 – Present/g, dateRange);
      populatedHTML = populatedHTML.replace(/Jan 2020 - Present/g, dateRange);
      
      if (exp.description) {
        populatedHTML = populatedHTML.replace(
          /Leading a team of developers to build enterprise-level applications using MERN stack\./g,
          exp.description
        );
        populatedHTML = populatedHTML.replace(
          /Led design projects for international clients, focusing on user-centric solutions\./g,
          exp.description
        );
        populatedHTML = populatedHTML.replace(
          /Building dynamic user interfaces with React, implementing responsive design, and integrating APIs for seamless user experience\./g,
          exp.description
        );
      }
      
      if (resumeData.experiences.length > 1) {
        const exp2 = resumeData.experiences[1];
        populatedHTML = populatedHTML.replace(/Frontend Developer/g, exp2.role || '');
        populatedHTML = populatedHTML.replace(/UI Designer/g, exp2.role || '');
        populatedHTML = populatedHTML.replace(/XYZ Solutions/g, exp2.company || '');
        populatedHTML = populatedHTML.replace(/SS Studio/g, exp2.company || '');
        
        const dateRange2 = `${this.formatDate(exp2.startDate)} - ${this.formatDate(exp2.endDate)}`;
        populatedHTML = populatedHTML.replace(/Jul 2018 - Dec 2019/g, dateRange2);
        populatedHTML = populatedHTML.replace(/Jan 2021 – Jan 2022/g, dateRange2);
      }
    }

    if (resumeData.skills && resumeData.skills.length > 0) {
      const skillNames = resumeData.skills.map(skill => skill.name || skill);
      
      populatedHTML = populatedHTML.replace(/JavaScript/g, skillNames[0] || 'JavaScript');
      populatedHTML = populatedHTML.replace(/React\.js/g, skillNames[1] || 'React.js');
      populatedHTML = populatedHTML.replace(/Node\.js/g, skillNames[2] || 'Node.js');
      populatedHTML = populatedHTML.replace(/MongoDB/g, skillNames[3] || 'MongoDB');
      populatedHTML = populatedHTML.replace(/Photoshop/g, skillNames[0] || 'Photoshop');
      populatedHTML = populatedHTML.replace(/UI Design/g, skillNames[1] || 'UI Design');
      populatedHTML = populatedHTML.replace(/Figma/g, skillNames[2] || 'Figma');
      populatedHTML = populatedHTML.replace(/Tailwind CSS/g, skillNames[3] || 'Tailwind CSS');
      
      if (skillNames.length > 0) {
        populatedHTML = populatedHTML.replace(
          /<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">Photoshop<\/span>/g,
          `<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">${skillNames[0]}</span>`
        );
      }
      if (skillNames.length > 1) {
        populatedHTML = populatedHTML.replace(
          /<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">UI Design<\/span>/g,
          `<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">${skillNames[1]}</span>`
        );
      }
      if (skillNames.length > 2) {
        populatedHTML = populatedHTML.replace(
          /<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">Figma<\/span>/g,
          `<span style="background:#f3e8ff;color:#6b21a8;padding:8px 12px;border-radius:8px;font-size:14px;">${skillNames[2]}</span>`
        );
      }
    }

    if (resumeData.projects && resumeData.projects.length > 0) {
      const project = resumeData.projects[0];
      
      populatedHTML = populatedHTML.replace(/Project One/g, project.name || '');
      populatedHTML = populatedHTML.replace(/Portfolio Website/g, project.name || '');
      populatedHTML = populatedHTML.replace(/MERN Stack Resume Builder/g, project.name || '');
      
      populatedHTML = populatedHTML.replace(/A full-stack application built using MERN stack\./g, project.description || '');
      populatedHTML = populatedHTML.replace(/Personal portfolio showcasing creative work and case studies\./g, project.description || '');
      
      populatedHTML = populatedHTML.replace(/React, Node\.js, MongoDB/g, project.technologies || '');
      populatedHTML = populatedHTML.replace(/HTML, CSS, React/g, project.technologies || '');
    }

    if (resumeData.hobbies && resumeData.hobbies.length > 0) {
      const hobbyNames = resumeData.hobbies.map(hobby => hobby.name || hobby);
      
      populatedHTML = populatedHTML.replace(/Photography/g, hobbyNames[0] || 'Photography');
      populatedHTML = populatedHTML.replace(/Travel/g, hobbyNames[1] || 'Travel');
      populatedHTML = populatedHTML.replace(/Reading/g, hobbyNames[2] || 'Reading');
      populatedHTML = populatedHTML.replace(/Coding/g, hobbyNames[0] || 'Coding');
      populatedHTML = populatedHTML.replace(/Playing Cricket/g, hobbyNames[1] || 'Playing Cricket');
      populatedHTML = populatedHTML.replace(/Tech Blogs/g, hobbyNames[2] || 'Tech Blogs');
      
      if (hobbyNames.length > 0) {
        populatedHTML = populatedHTML.replace(
          /<span style="display:inline-block;background:#f3e8ff;color:#6b21a8;padding:6px 10px;border-radius:6px;margin:3px;font-size:14px;">Photography<\/span>/g,
          `<span style="display:inline-block;background:#f3e8ff;color:#6b21a8;padding:6px 10px;border-radius:6px;margin:3px;font-size:14px;">${hobbyNames[0]}</span>`
        );
      }
      if (hobbyNames.length > 1) {
        populatedHTML = populatedHTML.replace(
          /<span style="display:inline-block;background:#f3e8ff;color:#6b21a8;padding:6px 10px;border-radius:6px;margin:3px;font-size:14px;">Travel<\/span>/g,
          `<span style="display:inline-block;background:#f3e8ff;color:#6b21a8;padding:6px 10px;border-radius:6px;margin:3px;font-size:14px;">${hobbyNames[1]}</span>`
        );
      }
    }

    if (resumeData.socialMedia && resumeData.socialMedia.length > 0) {
      const linkedin = resumeData.socialMedia.find(sm => sm.platform === 'linkedin');
      const github = resumeData.socialMedia.find(sm => sm.platform === 'github');
      
      if (linkedin) {
        populatedHTML = populatedHTML.replace(/LinkedIn: @johnDoe/g, `LinkedIn: ${linkedin.username || '@johnDoe'}`);
      }
      if (github) {
        populatedHTML = populatedHTML.replace(/GitHub: @johnDoe/g, `GitHub: ${github.username || '@johnDoe'}`);
      }
    }

    return populatedHTML;
  }

  formatAddress(address) {
    if (!address) return '';
    const parts = [address.street, address.city, address.state, address.zipCode, address.country];
    return parts.filter(part => part && part !== 'undefined' && part !== 'null').join(', ');
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  async generatePDF(resumeData, templateName = 'ProfessionalTemplate', options = {}) {
    let browser = null;
    let page = null;

    try {
      browser = await this.initBrowser();
      page = await browser.newPage();

      const htmlContent = await this.loadHTMLTemplate(templateName);
      if (!htmlContent) {
        throw new Error(`Template ${templateName} not found`);
      }

      const populatedHTML = this.populateTemplateWithData(htmlContent, resumeData);
      
      await page.setContent(populatedHTML);
      
      await page.setViewport({ width: 1200, height: 1600 });

      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        ...options
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return pdfBuffer;

    } catch (error) {
      console.error('PDF generation error:', error.message);
      throw error;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error('Error closing page:', e.message);
        }
      }
    }
  }

  async getAvailableTemplates() {
    try {
      const files = await fs.readdir(this.templatesPath);
      return files
        .filter(file => file.endsWith('.html'))
        .map(file => file.replace('.html', ''));
    } catch (error) {
      console.error('Error reading templates directory:', error.message);
      return [];
    }
  }
}

module.exports = SimplePDFGenerator;
