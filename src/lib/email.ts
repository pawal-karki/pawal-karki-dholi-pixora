import nodemailer from "nodemailer";

// Gmail SMTP configuration
// You need to set up an App Password in your Google Account:
// 1. Go to Google Account > Security
// 2. Enable 2-Step Verification if not already enabled
// 3. Go to App passwords
// 4. Generate a new app password for "Mail"
// 5. Use that password in GMAIL_APP_PASSWORD env variable

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Pixora logo URL (hosted on uploadthing)
const PIXORA_LOGO_URL =
  "https://gq6p4lilb6.ufs.sh/f/OEGA9vPleJiwibsFRludXL9VbiJklhIovEF4ez1AUDwRyONB";

interface SendOTPEmailParams {
  to: string;
  otp: string;
  userName?: string;
}

// Split OTP into individual digits for clean display
function formatOTPDigits(otp: string): string {
  return otp
    .split("")
    .map(
      (digit) => `
      <td style="padding: 0 6px;">
        <div style="
          width: 48px;
          height: 56px;
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 28px;
          font-weight: 600;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 56px;
          text-align: center;
        ">${digit}</div>
      </td>
    `
    )
    .join("");
}

export async function sendPasswordResetOTP({
  to,
  otp,
  userName,
}: SendOTPEmailParams): Promise<boolean> {
  const displayName = userName || "there";
  const otpDigits = formatOTPDigits(otp);

  const mailOptions = {
    from: `"Pixora" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 Your Password Reset Code - Pixora",
    html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Password Reset OTP</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .content-padding { padding: 24px 20px !important; }
      .otp-digit { width: 36px !important; height: 44px !important; font-size: 20px !important; line-height: 40px !important; }
      .header-text { font-size: 18px !important; }
      .body-text { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Your password reset code is ${otp}. Valid for 10 minutes.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <!-- Email Body -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="width: 100%; max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 8px 40px rgba(5, 150, 105, 0.12); overflow: hidden;">
          
          <!-- Logo Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 24px 24px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="background-color: #ffffff; border-radius: 16px; padding: 16px 24px; display: inline-block;">
                      <img src="${PIXORA_LOGO_URL}" alt="Pixora" width="140" height="56" style="display: block; max-width: 140px; height: auto;" />
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Security Icon -->
          <tr>
            <td align="center" style="padding: 32px 32px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ecfdf5; border-radius: 50%; padding: 16px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/6195/6195699.png" alt="Security" width="40" height="40" style="display: block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-padding" style="padding: 24px 32px 32px;">
              
              <!-- Greeting -->
              <h1 class="header-text" style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">
                Password Reset
              </h1>
              <p class="body-text" style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #6b7280; text-align: center;">
                Hi ${displayName}, use the code below to reset your password
              </p>
              
              <!-- OTP Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        ${otpDigits}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #fef3c7; border-radius: 20px; padding: 8px 16px;">
                          <span style="font-size: 13px; color: #92400e; font-weight: 500;">⏱️ Expires in 10 minutes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 12px; margin-bottom: 0;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280; text-align: center;">
                      🔒 If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 24px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <div style="background-color: #ffffff; border-radius: 12px; padding: 12px 20px; display: inline-block; border: 1px solid #e5e7eb;">
                      <img src="${PIXORA_LOGO_URL}" alt="Pixora" width="90" height="36" style="display: block; max-width: 90px; height: auto;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 4px; font-size: 11px; color: #9ca3af;">
                      This is an automated message. Please do not reply.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Pixora. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        <!-- End Main Container -->
        
      </td>
    </tr>
  </table>
  
</body>
</html>
    `,
    text: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PIXORA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSWORD RESET REQUEST

Hi ${displayName},

Use this code to reset your password:

┌─────────────────────────────┐
│                             │
│     YOUR CODE: ${otp}       │
│                             │
└─────────────────────────────┘

⏱️  This code expires in 10 minutes.

🔒 Security Notice:
If you didn't request this code, you can safely ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message from Pixora.
© ${new Date().getFullYear()} Pixora. All rights reserved.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
