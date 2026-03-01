import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const APP_NAME = process.env.APP_NAME || 'Scrumly';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASS:', process.env.GMAIL_APP_PASS);

export const sendOTPEmail = async ({ toEmail, inviterName, teamName, otp }) => {
  await transporter.sendMail({
    from: `${APP_NAME} <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${inviterName} invited you to "${teamName}" — Your code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.08);">

                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">
                      ${APP_NAME}
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                      Team Invitation
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1e293b;">
                      ${inviterName} invited you to join
                    </p>
                    <p style="margin:0 0 28px;font-size:20px;font-weight:900;color:#6366f1;">
                      "${teamName}"
                    </p>

                    <p style="margin:0 0 12px;font-size:13px;color:#64748b;">
                      Share this code with <strong>${inviterName}</strong>:
                    </p>

                    <div style="display:inline-block;background:#eef2ff;border:2px dashed #a5b4fc;
                      border-radius:16px;padding:20px 48px;margin-bottom:20px;">
                      <span style="font-size:40px;font-weight:900;letter-spacing:12px;
                        color:#4f46e5;font-family:monospace;">
                        ${otp}
                      </span>
                    </div>

                    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;
                      padding:12px 16px;margin-top:4px;">
                      <p style="margin:0;font-size:12px;color:#92400e;">
                        ⏱ This code expires in <strong>15 minutes</strong>.
                        Do not share with anyone else.
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#cbd5e1;">
                      If you didn't expect this, ignore this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  });
};