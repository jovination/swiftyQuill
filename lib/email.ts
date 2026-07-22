import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_PASSWORD;
const resend = new Resend(apiKey);

const FROM_EMAIL = process.env.EMAIL_FROM || "SwiftyQuill <noreply@jovinshija.tech>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const emailTemplate = (title: string, body: string, ctaText: string, ctaUrl: string, footerNote: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0;text-align:center;">
              <img src="${APP_URL}/logo.svg" alt="SwiftyQuill" width="40" height="40" style="border-radius:8px;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#171717;letter-spacing:-0.01em;">
                ${title}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#737373;">
                ${body}
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display:inline-block;background-color:#171717;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none;padding:14px 32px;border-radius:16px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#737373;">
                ${footerNote}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #f0f0f0;padding-top:24px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#a3a3a3;">
                      SwiftyQuill &mdash; Capture ideas, stay productive.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your SwiftyQuill account",
      html: emailTemplate(
        "Verify your email",
        "Thanks for signing up for SwiftyQuill. Click the button below to verify your email address and activate your account.",
        "Verify Email",
        verifyUrl,
        "This link expires in 24 hours. If you didn't create an account, you can safely ignore this email."
      ),
    });
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your SwiftyQuill password",
      html: emailTemplate(
        "Reset your password",
        "We received a request to reset your password. Click the button below to choose a new one.",
        "Reset Password",
        resetUrl,
        "This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email."
      ),
    });
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}
