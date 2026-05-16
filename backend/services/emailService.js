const nodemailer = require('nodemailer')

function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }
  return null
}

exports.sendWelcomeEmail = async ({ name, email, password }) => {
  const transporter = createTransporter()

  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 28px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Welcome to SkillSync AI</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your account has been created by HR</p>
      </div>

      <div style="background: white; border-radius: 10px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
          Your employee profile has been set up on SkillSync AI. Use the credentials below to log in and complete your profile.
        </p>

        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Login Credentials</p>
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="color: #6b7280; font-size: 13px; width: 80px;">Email:</span>
            <code style="background: #ede9fe; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-size: 13px;">${email}</code>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #6b7280; font-size: 13px; width: 80px;">Password:</span>
            <code style="background: #ede9fe; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: bold;">${password}</code>
          </div>
        </div>

        <a href="${loginUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Login to SkillSync AI →
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        Please change your password after first login. If you have issues, contact your HR team.
      </p>
    </div>
  `

  if (!transporter) {
    console.log(`\n📧 [EMAIL NOT SENT - configure EMAIL_USER/EMAIL_PASS in .env]`)
    console.log(`   To: ${email} | Password: ${password}`)
    return { sent: false }
  }

  try {
    await transporter.sendMail({
      from: `"SkillSync AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to SkillSync AI — Your Login Credentials`,
      html
    })
    return { sent: true }
  } catch (err) {
    console.error(`Failed to send email to ${email}:`, err.message)
    return { sent: false, error: err.message }
  }
}
