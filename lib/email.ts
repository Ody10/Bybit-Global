import nodemailer from 'nodemailer';
import {
  generateDepositConfirmationEmail,
  generateWithdrawalRequestEmail,
  generateWithdrawalSuccessEmail,
  getDepositConfirmationSubject,
  getWithdrawalRequestSubject,
  getWithdrawalSuccessSubject,
} from './email-templates';

// Brand configuration - customize these for your platform
const BRAND_CONFIG = {
  name: process.env.BRAND_NAME || 'Bybit',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@bybit.com',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.bybit.com',
  fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@bybit.com',
  notificationEmail: process.env.NOTIFICATION_EMAIL || 'notification@bybit.com',
};

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS,
  },
});

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// VERIFICATION EMAIL
// ============================================
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailOptions = {
      from: `"${BRAND_CONFIG.name}" <${BRAND_CONFIG.fromEmail}>`,
      to: email,
      subject: `Your ${BRAND_CONFIG.name} Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0d0d0e; font-family: Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #121214; border-radius: 12px;">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
                        <span style="color: #ffffff;">BYB</span><span style="color: #f7a600;">I</span><span style="color: #ffffff;">T</span>
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px;">Email Verification</h2>
                      <p style="color: #9ca3af; font-size: 16px; line-height: 24px; margin: 0 0 20px;">
                        You are registering a ${BRAND_CONFIG.name} account. Please use the following verification code to complete your registration:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Code Box -->
                  <tr>
                    <td align="center" style="padding: 0 40px 30px;">
                      <div style="background-color: #1a1a1c; border: 1px solid #2a2a2e; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                        <span style="color: #f7a600; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${code}</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Warning -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 0;">
                        This code will expire in <strong style="color: #ffffff;">5 minutes</strong>.
                      </p>
                      <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 10px 0 0;">
                        If you did not request this code, please ignore this email. Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; border-top: 1px solid #2a2a2e;">
                      <p style="color: #6b7280; font-size: 12px; line-height: 18px; margin: 0;">
                        This is an automated message from ${BRAND_CONFIG.name}. Please do not reply to this email.
                      </p>
                      <p style="color: #6b7280; font-size: 12px; line-height: 18px; margin: 10px 0 0;">
                        © ${new Date().getFullYear()} ${BRAND_CONFIG.name}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Your ${BRAND_CONFIG.name} verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// ============================================
// DEPOSIT CONFIRMATION EMAIL
// ============================================
export async function sendDepositConfirmationEmail(
  email: string,
  data: {
    amount: string;
    token: string;
    chainType: string;
    depositAddress: string;
    timestamp?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const timestamp = data.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const html = generateDepositConfirmationEmail({
      amount: data.amount,
      token: data.token,
      chainType: data.chainType,
      depositAddress: data.depositAddress,
      timestamp: timestamp,
      brandName: BRAND_CONFIG.name,
      supportEmail: BRAND_CONFIG.supportEmail,
      baseUrl: BRAND_CONFIG.baseUrl,
    });

    const mailOptions = {
      from: `"${BRAND_CONFIG.name}" <${BRAND_CONFIG.fromEmail}>`,
      to: email,
      subject: getDepositConfirmationSubject(BRAND_CONFIG.name),
      html: html,
      text: `Your deposit has been confirmed.\n\nDeposit amount: ${data.amount} ${data.token}\nChain type: ${data.chainType}\nDeposit address: ${data.depositAddress}\nTimestamp: ${timestamp}(UTC)`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deposit confirmation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending deposit confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// ============================================
// WITHDRAWAL REQUEST EMAIL
// ============================================
export async function sendWithdrawalRequestEmail(
  email: string,
  data: {
    amount: string;
    token: string;
    chainType: string;
    withdrawalAddress: string;
    fee: string;
    verificationCode: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateWithdrawalRequestEmail({
      amount: data.amount,
      token: data.token,
      chainType: data.chainType,
      withdrawalAddress: data.withdrawalAddress,
      fee: data.fee,
      verificationCode: data.verificationCode,
      brandName: BRAND_CONFIG.name,
      supportEmail: BRAND_CONFIG.supportEmail,
      baseUrl: BRAND_CONFIG.baseUrl,
    });

    const mailOptions = {
      from: `"${BRAND_CONFIG.name}" <${BRAND_CONFIG.notificationEmail}>`,
      to: email,
      subject: getWithdrawalRequestSubject(BRAND_CONFIG.name),
      html: html,
      text: `You've created a withdrawal request.\n\nWithdrawal amount: ${data.amount} ${data.token}\nChain: ${data.chainType}\nWithdrawal address: ${data.withdrawalAddress}\nFee: ${data.fee} ${data.token}\n\nVerification code: ${data.verificationCode}\n\nThis code is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal request email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending withdrawal request email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// ============================================
// WITHDRAWAL SUCCESS EMAIL
// ============================================
export async function sendWithdrawalSuccessEmail(
  email: string,
  data: {
    amount: string;
    token: string;
    chainType: string;
    withdrawalAddress: string;
    txId: string;
    txUrl?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generateWithdrawalSuccessEmail({
      amount: data.amount,
      token: data.token,
      chainType: data.chainType,
      withdrawalAddress: data.withdrawalAddress,
      txId: data.txId,
      txUrl: data.txUrl,
      brandName: BRAND_CONFIG.name,
      supportEmail: BRAND_CONFIG.supportEmail,
      baseUrl: BRAND_CONFIG.baseUrl,
    });

    const mailOptions = {
      from: `"${BRAND_CONFIG.name}" <${BRAND_CONFIG.notificationEmail}>`,
      to: email,
      subject: getWithdrawalSuccessSubject(BRAND_CONFIG.name),
      html: html,
      text: `Your withdrawal was successful.\n\nAmount: ${data.amount} ${data.token}\nChain type: ${data.chainType}\nWithdrawal address: ${data.withdrawalAddress}\nTXID: ${data.txId}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Withdrawal success email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending withdrawal success email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('SMTP connection verified');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}

// Export brand config for use in other modules
export { BRAND_CONFIG };