const nodemailer = require('nodemailer');

// Email templates with improved structure and theme
const emailTemplates = {
  verification: {
    subject: 'Verify Your Email - Resume Builder',
    generateHTML: (userName, verificationUrl) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #FF5C00; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; line-height: 1.6; color: #333; }
          .button { display: inline-block; background-color: #FF5C00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
          .highlight { color: #FF5C00; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Resume Builder</h1>
            <p>Welcome to the future of resume creation!</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for joining <span class="highlight">Resume Builder</span>. To get started and create your professional resume, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #FF5C00;">${verificationUrl}</a>
            </p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>© 2024 Resume Builder. All rights reserved.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  passwordReset: {
    subject: 'Reset Your Password - Resume Builder',
    generateHTML: (userName, resetUrl) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #FF5C00; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; line-height: 1.6; color: #333; }
          .button { display: inline-block; background-color: #FF5C00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
          .highlight { color: #FF5C00; font-weight: 600; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Resume Builder</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your <span class="highlight">Resume Builder</span> account.</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #FF5C00;">${resetUrl}</a>
            </p>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
          <div class="footer">
            <p>© 2024 Resume Builder. All rights reserved.</p>
            <p>For security, this link can only be used once.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  resumeApproval: {
    subject: 'Resume Status Update - Resume Builder',
    generateHTML: (userName, resumeTitle, status, comments = '') => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume Status Update</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #FF5C00; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; line-height: 1.6; color: #333; }
          .status-approved { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .status-rejected { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background-color: #FF5C00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
          .highlight { color: #FF5C00; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Resume Builder</h1>
            <p>Resume Review Update</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your resume <span class="highlight">"${resumeTitle}"</span> has been reviewed by our team.</p>
            
            <div class="${status === 'approved' ? 'status-approved' : 'status-rejected'}">
              <strong>Status: ${status === 'approved' ? '✅ Approved' : '❌ Needs Revision'}</strong>
            </div>
            
            ${status === 'approved' 
              ? '<p>🎉 Congratulations! Your resume has been approved and is now ready for use.</p>'
              : '<p>Your resume needs some revisions before it can be approved. Please review the comments below and make the necessary changes.</p>'
            }
            
            ${comments ? `
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>📝 Review Comments:</h3>
                <p>${comments}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Resume Builder. All rights reserved.</p>
            <p>Thank you for using our platform!</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  welcome: {
    subject: 'Welcome to Resume Builder!',
    generateHTML: (userName) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Resume Builder</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #FF5C00; color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; line-height: 1.6; color: #333; }
          .button { display: inline-block; background-color: #FF5C00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
          .highlight { color: #FF5C00; font-weight: 600; }
          .features { display: flex; justify-content: space-between; margin: 30px 0; }
          .feature { text-align: center; flex: 1; margin: 0 10px; }
          .feature-icon { font-size: 24px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Resume Builder</h1>
            <p>Welcome to the future of resume creation!</p>
          </div>
          <div class="content">
            <h2>Welcome, ${userName}! 👋</h2>
            <p>Thank you for joining <span class="highlight">Resume Builder</span>! We're excited to help you create professional, standout resumes that will get you noticed.</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">📝</div>
                <h3>Easy Creation</h3>
                <p>Create beautiful resumes in minutes</p>
              </div>
              <div class="feature">
                <div class="feature-icon">🎨</div>
                <h3>Professional Templates</h3>
                <p>Choose from multiple designs</p>
              </div>
              <div class="feature">
                <div class="feature-icon">📱</div>
                <h3>Mobile Friendly</h3>
                <p>Edit anywhere, anytime</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Get Started</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Need help? Our support team is here to assist you every step of the way.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Resume Builder. All rights reserved.</p>
            <p>Let's build your career together! 🚀</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

const sendEmail = async (options) => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Resume Builder'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

// Helper function to send templated emails
const sendTemplatedEmail = async (templateName, userEmail, userData, ...additionalData) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  const html = template.generateHTML(userData, ...additionalData);
  
  return await sendEmail({
    email: userEmail,
    subject: template.subject,
    message: `Please view this email in HTML format.`,
    html: html
  });
};

module.exports = { sendEmail, sendTemplatedEmail, emailTemplates };
