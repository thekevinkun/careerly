import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const BASE_URL = process.env.NEXTAUTH_URL;

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const verificationUrl = `${BASE_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Careerly" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Verify your email address",
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb; margin:0; padding:0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 30px; }
          .logo { height: 32px; }
          .brand { font-size: 20px; font-weight: 600; color: hsl(160, 84%, 39%); }
          h1, h2, h3, p { color: #111827; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: hsl(160, 84%, 39%); 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          .feature { margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- HEADER -->
          <div class="header">
            <div class="brand">Careerly</div>
          </div>

          <!-- TITLE -->
          <h1>Welcome to Careerly!</h1>

          <p>Hi ${name},</p>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          
          <!-- BUTTON -->
          <div style="text-align: center;">
            <a href="${verificationUrl}" style="color:#ffffff !important;" class="button">Verify Email Address</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: hsl(160, 84%, 39%);">${verificationUrl}</p>

          <p>This link will expire in 24 hours.</p>

          <!-- FOOTER -->
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>

        </div>
      </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const dashboardUrl = `${BASE_URL}/dashboard`;

  const mailOptions = {
    from: `"Careerly" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Welcome to Careerly - Let's get started!",
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb; margin:0; padding:0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 30px; }
          .logo { height: 32px; }
          .brand { font-size: 20px; font-weight: 600; color: hsl(160, 84%, 39%); }
          h1, h2, h3, p { color: #111827; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: hsl(160, 84%, 39%); 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          .feature { margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- HEADER -->
          <div class="header">
            <div class="brand">Careerly</div>
          </div>

          <!-- TITLE -->
          <h1>🎉 Welcome to Careerly!</h1>

          <p>Hi ${name},</p>
          <p>Your email has been verified! You're all set to start tracking your job applications and advancing your career.</p>

          <h2>Here's what you can do:</h2>

          <div class="feature">
            <h3>📝 Track Applications</h3>
            <p>Keep all your job applications organized in one place.</p>
          </div>

          <div class="feature">
            <h3>📄 Manage Resumes</h3>
            <p>Store and version control your resumes for different applications.</p>
          </div>

          <div class="feature">
            <h3>✍️ Create Cover Letters</h3>
            <p>Write and save cover letters tailored to each job.</p>
          </div>

          <!-- BUTTON -->
          <div style="text-align: center;">
            <a href="${dashboardUrl}" style="color:#ffffff !important;" class="button">Go to Dashboard</a>
          </div>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Best regards,<br>The Careerly Team</p>

        </div>
      </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
) {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Careerly" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Reset your password",
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
          body { font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb; margin:0; padding:0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; }
          .header { display: flex; align-items: center; gap: 8px; margin-bottom: 30px; }
          .logo { height: 32px; }
          .brand { font-size: 20px; font-weight: 600; color: hsl(160, 84%, 39%); }
          h1, p { color: #111827; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: hsl(160, 84%, 39%); 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
          }
          .warning { 
            background-color: #fff3cd; 
            border: 1px solid #ffc107; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 20px 0;
            color: #664d03;
          }
        </style>
      </head>
      <body>
        <div class="container">

          <!-- HEADER -->
          <div class="header">
            <div class="brand">Careerly</div>
          </div>

          <h1>🔐 Reset Your Password</h1>

          <p>Hi ${name},</p>

          <p>We received a request to reset your password for your Careerly account.</p>

          <!-- BUTTON -->
          <div style="text-align: center;">
            <a href="${resetUrl}" style="color:#ffffff !important;" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: hsl(160, 84%, 39%);">${resetUrl}</p>

          <div class="warning">
            <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </div>

          <p>Best regards,<br>The Careerly Team</p>

        </div>
      </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}