// Email Templates for Deposit and Withdrawal Notifications
// Styled to match Bybit's email design

interface DepositConfirmationData {
  userName?: string;
  amount: string;
  token: string;
  chainType: string;
  depositAddress: string;
  timestamp: string;
  brandName?: string;
  supportEmail?: string;
  baseUrl?: string;
}

interface WithdrawalRequestData {
  userName?: string;
  amount: string;
  token: string;
  chainType?: string;
  withdrawalAddress: string;
  fee?: string;
  verificationCode: string;
  brandName?: string;
  supportEmail?: string;
  baseUrl?: string;
}

interface WithdrawalSuccessData {
  userName?: string;
  amount: string;
  token: string;
  chainType: string;
  withdrawalAddress: string;
  txId: string;
  txUrl?: string;
  brandName?: string;
  supportEmail?: string;
  baseUrl?: string;
}

// Common email footer with social media and app store links
function getEmailFooter(brandName: string, baseUrl: string): string {
  return `
    <!-- Footer Section -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
          <span style="color: #000000;">BYB</span><span style="color: #f7a600;">I</span><span style="color: #000000;">T</span>
        </h1>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 0 40px 20px; text-align: center;">
        <p style="color: #666666; font-size: 14px; margin: 0;">
          Never miss a beat on our latest product updates and events.
        </p>
      </td>
    </tr>
    
    <!-- Social Media Icons -->
    <tr>
      <td style="padding: 0 40px 20px; text-align: center;">
        <table role="presentation" style="margin: 0 auto;">
          <tr>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/Y7L9qLFs/x.png" alt="X" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/842LBZLK/instagram.png" alt="Instagram" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/cKMYm8ng/tiktok.png" alt="TikTok" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/Z6wcv2k7/youtube.png" alt="YouTube" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/6cM9C8BM/facebook.png" alt="Facebook" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/TxV9ZqjD/telegram.png" alt="Telegram" width="36" height="36" style="border-radius: 50%; display: block;" />
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Trade on the go -->
    <tr>
      <td style="padding: 0 40px 15px; text-align: center;">
        <p style="color: #666666; font-size: 14px; margin: 0;">
          Trade on the go with <span style="color: #f7a600;">${brandName}</span>
        </p>
      </td>
    </tr>
    
    <!-- App Store Buttons -->
    <tr>
      <td style="padding: 0 40px 25px; text-align: center;">
        <table role="presentation" style="margin: 0 auto;">
          <tr>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/FkjLHrfF/app-store.png" alt="Download on App Store" height="40" style="display: block;" />
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="#" style="display: inline-block;">
                <img src="https://i.ibb.co/QjYy4dG4/google-play.png" alt="Get it on Google Play" height="40" style="display: block;" />
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Links -->
    <tr>
      <td style="padding: 0 40px 20px; text-align: center;">
        <a href="${baseUrl}/promotions" style="color: #000000; font-size: 14px; text-decoration: underline; margin: 0 15px;">Latest Promotions</a>
        <a href="${baseUrl}/help" style="color: #000000; font-size: 14px; text-decoration: underline; margin: 0 15px;">Help Center</a>
      </td>
    </tr>
    
    <!-- Copyright -->
    <tr>
      <td style="padding: 0 40px 40px; text-align: center;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          Copyright @2018 - ${new Date().getFullYear()} <span style="color: #f7a600;">${brandName}</span>. All rights reserved.
        </p>
      </td>
    </tr>
  `;
}

// Email header with logo
function getEmailHeader(brandName: string): string {
  return `
    <!-- Header with Logo -->
    <tr>
      <td style="padding: 40px 40px 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
          <span style="color: #000000;">BYB</span><span style="color: #f7a600;">I</span><span style="color: #000000;">T</span>
        </h1>
        <p style="margin: 5px 0 0; font-size: 12px; color: #666666;">
          #TheCryptoArk and <span style="color: #f7a600;">Gateway to Web3</span>
        </p>
      </td>
    </tr>
  `;
}

// Base email wrapper
function wrapEmail(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              ${content}
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Highlight text helper
function highlight(text: string): string {
  return `<span style="color: #f7a600; background-color: #fff9e6; padding: 1px 4px;">${text}</span>`;
}

// ============================================
// 1. DEPOSIT CONFIRMATION EMAIL
// ============================================
export function generateDepositConfirmationEmail(data: DepositConfirmationData): string {
  const brandName = data.brandName || 'Bybit';
  const supportEmail = data.supportEmail || 'support@bybit.com';
  const baseUrl = data.baseUrl || 'https://www.bybit.com';

  const content = `
    ${getEmailHeader(brandName)}
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 30px 40px;">
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          Dear valued <span style="color: #f7a600;">${brandName}</span> trader,
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          Your ${highlight('deposit')} has been confirmed.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 8px;">
          ${highlight('Deposit')} amount: <strong>${data.amount} ${data.token}</strong>
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 8px;">
          Chain type: ${data.chainType}
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 8px;">
          ${highlight('Deposit')} address: ${data.depositAddress}
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 25px;">
          Timestamp: ${data.timestamp}(UTC)
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          If you believe your account has been compromised, please contact us immediately via live chat or email <a href="mailto:${supportEmail}" style="color: #f7a600; text-decoration: underline;">${supportEmail}</a> using your registered email address.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          To enhance your account security, consider enabling Google Two-Factor Authentication (2FA) and setting up a Fund Password from the <a href="${baseUrl}/user/security" style="color: #f7a600; text-decoration: underline;">Account & Security</a> page.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 10px;">
          For more information, please visit our help center:
        </p>
        
        <p style="margin: 0 0 5px;">
          <a href="${baseUrl}/help/exchange" style="color: #f7a600; text-decoration: underline; font-size: 15px;">How to perform an asset exchange?</a>
        </p>
        <p style="margin: 0 0 25px;">
          <a href="${baseUrl}/help/withdrawal" style="color: #f7a600; text-decoration: underline; font-size: 15px;">How to add your withdrawal wallet address?</a>
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
          Regards,
        </p>
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0;">
          The <span style="color: #f7a600;">${brandName}</span> Team
        </p>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;" />
      </td>
    </tr>
    
    ${getEmailFooter(brandName, baseUrl)}
  `;

  return wrapEmail(content);
}

// ============================================
// 2. WITHDRAWAL REQUEST EMAIL
// ============================================
export function generateWithdrawalRequestEmail(data: WithdrawalRequestData): string {
  const brandName = data.brandName || 'Bybit';
  const supportEmail = data.supportEmail || 'support@bybit.com';
  const baseUrl = data.baseUrl || 'https://www.bybit.com';

  const content = `
    ${getEmailHeader(brandName)}
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 30px 40px;">
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
          Dear valued <span style="color: #f7a600;">${brandName}</span> user,
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
          You've created a ${highlight('withdrawal')} request. Your ${highlight('withdrawal')} information is as follows:
        </p>
        
        <!-- Withdrawal Info Box -->
        <div style="background-color: #fffbe6; border-left: 4px solid #f7a600; padding: 15px 20px; margin: 0 0 20px;">
          <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
            ${highlight('Withdrawal')} amount: <strong>${data.amount} ${data.token}</strong>
          </p>
          ${data.chainType ? `
          <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
            Chain type: <strong>${data.chainType}</strong>
          </p>
          ` : ''}
          <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
            ${highlight('Withdrawal')} address: ${data.withdrawalAddress}
          </p>
          ${data.fee ? `
          <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0;">
            Fee: <strong>${data.fee} ${data.token}</strong>
          </p>
          ` : ''}
        </div>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          Please check your ${highlight('withdrawal')} address carefully.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 10px;">
          The verification code is:
        </p>
        
        <!-- Verification Code Box -->
        <div style="margin: 0 0 20px;">
          <span style="font-size: 36px; font-weight: bold; color: #000000; letter-spacing: 4px;">${data.verificationCode}</span>
        </div>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
          The verification code is valid for <strong>5 minutes</strong>.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          For the security of your account, please do not disclose the following verification code to anyone, including <span style="color: #f7a600;">${brandName}</span> staff.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 15px;">
          If you need further assistance, please contact our live customer support or email us at <a href="mailto:${supportEmail}" style="color: #f7a600; text-decoration: underline;">${supportEmail}</a>.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 25px;">
          Notice: You can click the button below to ban this account if it wasn't you. <a href="${baseUrl}/security/ban-account" style="color: #dc2626; text-decoration: underline;">Ban This Account</a>
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
          Best Regards,
        </p>
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 25px;">
          The <span style="color: #f7a600;">${brandName}</span> Team
        </p>
        
        <!-- Security Warning Section -->
        <div style="background-color: #fff9e6; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
          <p style="color: #333333; font-size: 14px; line-height: 22px; margin: 0 0 15px; font-weight: bold;">
            We've recently observed a spike in phishing attempts to steal users' passwords or verification codes by tricking them into visiting fraudulent websites.
          </p>
          
          <p style="color: #333333; font-size: 14px; line-height: 22px; margin: 0 0 15px;">
            To verify the authenticity of <span style="color: #f7a600;">${brandName}</span> URLs and sources (such as mobile numbers and emails), you can use our <span style="color: #f7a600;">${brandName}</span> Authenticity Check (<a href="${baseUrl}/verification" style="color: #f7a600; text-decoration: underline;">${baseUrl}/verification</a>) or contact our Customer Support for assistance.
          </p>
          
          <p style="color: #333333; font-size: 14px; line-height: 22px; margin: 0 0 10px;">
            To enhance the security of your personal information and assets, please visit the <a href="${baseUrl}/user/security" style="color: #f7a600; text-decoration: underline;">Account & Security</a> page after logging in to set up the following:
          </p>
          
          <ol style="color: #333333; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Set up Google 2FA Authentication, which will be used for logins, asset ${highlight('withdrawals')}, password recovery, and security settings management.</li>
            <li style="margin-bottom: 8px;">Set up the Anti-phishing Code, which will appear in all emails sent from <span style="color: #f7a600;">${brandName}</span>. Any email that claims to come from <span style="color: #f7a600;">${brandName}</span> with no such a code or an incorrect one must be an attempted scam.</li>
            <li style="margin-bottom: 8px;">Set up the New Address ${highlight('Withdrawal')} Lock. Once enabled, your account won't be able to withdraw assets to a new address within 24 hours after it is added.</li>
            <li>Set up a fund password to enjoy secure and hassle-free ${highlight('withdrawals')} from your account.</li>
          </ol>
        </div>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;" />
      </td>
    </tr>
    
    ${getEmailFooter(brandName, baseUrl)}
  `;

  return wrapEmail(content);
}

// ============================================
// 3. WITHDRAWAL SUCCESS EMAIL
// ============================================
export function generateWithdrawalSuccessEmail(data: WithdrawalSuccessData): string {
  const brandName = data.brandName || 'Bybit';
  const supportEmail = data.supportEmail || 'support@bybit.com';
  const baseUrl = data.baseUrl || 'https://www.bybit.com';

  const content = `
    ${getEmailHeader(brandName)}
    
    <!-- Main Content -->
    <tr>
      <td style="padding: 30px 40px;">
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          Dear Valued <span style="color: #f7a600;">${brandName}</span> Trader,
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          You've successfully ${highlight('withdrawn')} <strong>${data.amount} ${data.token}</strong> from your <span style="color: #f7a600;">${brandName}</span> account.
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 8px;">
          Chain type: ${data.chainType}
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 8px;">
          Your ${highlight('withdrawal')} address: ${data.withdrawalAddress}
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 25px;">
          TXID: ${data.txUrl ? `<a href="${data.txUrl}" style="color: #f7a600; text-decoration: underline;">${data.txId}</a>` : data.txId}
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
          If you believe your account has been compromised, please contact us immediately via live chat or submit a ticket through <a href="${baseUrl}/support" style="color: #f7a600; text-decoration: underline;">this link</a>, or you can click here to <a href="${baseUrl}/security/ban-account" style="color: #dc2626; text-decoration: underline;">Ban This Account</a>
        </p>
        
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0 0 5px;">
          Regards,
        </p>
        <p style="color: #333333; font-size: 15px; line-height: 24px; margin: 0;">
          The <span style="color: #f7a600;">${brandName}</span> Team
        </p>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0;" />
      </td>
    </tr>
    
    ${getEmailFooter(brandName, baseUrl)}
  `;

  return wrapEmail(content);
}

// Export email subject generators
export function getDepositConfirmationSubject(brandName: string = 'Bybit'): string {
  return `[${brandName}]Deposit Confirmation`;
}

export function getWithdrawalRequestSubject(brandName: string = 'Bybit'): string {
  return `[${brandName}]Withdrawal Request`;
}

export function getWithdrawalSuccessSubject(brandName: string = 'Bybit'): string {
  return `[${brandName}]Withdrawal Success`;
}