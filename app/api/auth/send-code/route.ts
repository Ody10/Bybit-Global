import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Create reusable transporter using SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS,
  },
});

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email via SMTP - Bybit Style
async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailOptions = {
      from: `"Bybit" <${process.env.SMTP_FROM_EMAIL || 'noreply@bybit.com'}>`,
      to: email,
      subject: '[Bybit] Security Code for Your Bybit Account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bybit Security Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
                <span style="color: #1a1a1a;">BYB</span><span style="color: #F7A600;">I</span><span style="color: #1a1a1a;">T</span>
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px;">
                <span style="color: #666;">#TheCryptoArk and </span>
                <span style="color: #F7A600;">Gateway to Web3</span>
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 16px;">Hello Trader,</p>
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 24px;">Here's your unique security code:</p>
              
              <!-- Security Code -->
              <div style="text-align: center; padding: 24px 0;">
                <span style="color: #F7A600; font-size: 48px; font-weight: bold; letter-spacing: 8px;">${code}</span>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 24px 0 16px;">
                This code will remain valid for <strong>5 minutes</strong> and is an essential measure to ensure the security of your account.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
                For your protection, we kindly ask that you refrain from sharing this code with anyone, including members of the Bybit team.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
                If you have any questions regarding this matter, please contact our Customer Support.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 24px 0 8px;">Regards,</p>
              <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0;">The Bybit Team</p>
            </td>
          </tr>
          
          <!-- Warning Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="background-color: #FFF9E6; border-left: 4px solid #F7A600; padding: 16px; border-radius: 4px;">
                <p style="color: #F7A600; font-size: 14px; line-height: 20px; margin: 0 0 12px; font-weight: 600;">
                  ⚠️ Security Notice
                </p>
                <p style="color: #666; font-size: 14px; line-height: 20px; margin: 0;">
                  We've recently noticed a surge in phishing attempts aimed at stealing users' passwords or verification codes. Never share your security code with anyone.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Security Tips -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 12px;">
                <strong>🔐 Activate Google 2FA Authentication:</strong> This additional layer of security will help safeguard your account against unauthorized access.
              </p>
              <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 12px;">
                <strong>🛡️ Implement Anti-phishing Code:</strong> An Anti-phishing Code will be included in all official communications from Bybit.
              </p>
              <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0;">
                <strong>🔒 Enable New Address Withdrawal Lock:</strong> Protect against unauthorized withdrawals to newly added addresses for 24 hours.
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #eee; margin: 0;">
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: bold;">
                <span style="color: #1a1a1a;">BYB</span><span style="color: #F7A600;">I</span><span style="color: #1a1a1a;">T</span>
              </h2>
              
              <p style="color: #999; font-size: 14px; margin: 0 0 16px;">
                Never miss a beat on our latest product updates and events.
              </p>
              
              <!-- Social Links -->
              <div style="margin: 0 0 20px;">
                <a href="https://twitter.com/bybit" style="display: inline-block; width: 36px; height: 36px; background-color: #000; border-radius: 50%; margin: 0 4px; text-decoration: none; line-height: 36px; color: #fff; font-size: 14px;">𝕏</a>
                <a href="https://instagram.com/bybit" style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); border-radius: 50%; margin: 0 4px; text-decoration: none; line-height: 36px; color: #fff; font-size: 14px;">📷</a>
                <a href="https://youtube.com/bybit" style="display: inline-block; width: 36px; height: 36px; background-color: #FF0000; border-radius: 50%; margin: 0 4px; text-decoration: none; line-height: 36px; color: #fff; font-size: 14px;">▶</a>
                <a href="https://t.me/bybit" style="display: inline-block; width: 36px; height: 36px; background-color: #0088cc; border-radius: 50%; margin: 0 4px; text-decoration: none; line-height: 36px; color: #fff; font-size: 14px;">✈</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin: 0 0 16px;">Trade on the go with Bybit</p>
              
              <p style="color: #999; font-size: 12px; margin: 0;">
                Copyright ©2018 - ${new Date().getFullYear()} Bybit. All rights reserved.
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
      text: `Hello Trader,

Here's your unique security code: ${code}

This code will remain valid for 5 minutes and is an essential measure to ensure the security of your account.

For your protection, we kindly ask that you refrain from sharing this code with anyone, including members of the Bybit team.

Regards,
The Bybit Team

Copyright ©2018 - ${new Date().getFullYear()} Bybit. All rights reserved.`,
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

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, type = 'EMAIL_VERIFICATION' } = await request.json();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists (for registration)
    if (type === 'EMAIL_VERIFICATION' && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Rate limiting: Check for recent codes sent to this email/phone
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
        type,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Last 60 seconds
        },
      },
    });

    if (recentCode) {
      const waitTime = Math.ceil((60 * 1000 - (Date.now() - recentCode.createdAt.getTime())) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitTime} seconds before requesting a new code` },
        { status: 429 }
      );
    }

    // Generate a new 6-digit code
    const code = generateVerificationCode();

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any existing unused codes for this email/phone
    if (email) {
      await prisma.verificationCode.updateMany({
        where: {
          email,
          type,
          used: false,
        },
        data: {
          used: true,
        },
      });
    }

    if (phoneNumber) {
      await prisma.verificationCode.updateMany({
        where: {
          phoneNumber,
          type,
          used: false,
        },
        data: {
          used: true,
        },
      });
    }

    // Save the new code to database
    await prisma.verificationCode.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        code,
        type,
        expiresAt,
        used: false,
      },
    });

    // Send the verification email
    if (email) {
      const emailResult = await sendVerificationEmail(email, code);

      if (!emailResult.success) {
        // Delete the code if email failed to send
        await prisma.verificationCode.deleteMany({
          where: {
            email,
            code,
          },
        });

        console.error('Failed to send email:', emailResult.error);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    }

    // For phone verification, you would integrate with Twilio or similar
    if (phoneNumber) {
      console.log(`SMS verification code for ${phoneNumber}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent successfully to ${email || phoneNumber}`,
      expiresAt: expiresAt.toISOString(),
      // Only include code in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { demoCode: code }),
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// Resend verification code
export async function PUT(request: NextRequest) {
  try {
    const { email, phoneNumber, type = 'EMAIL_VERIFICATION' } = await request.json();

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Check if there's an existing code that was sent recently (within 60 seconds)
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentCode) {
      const waitTime = Math.ceil((60 * 1000 - (Date.now() - recentCode.createdAt.getTime())) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitTime} seconds before requesting a new code` },
        { status: 429 }
      );
    }

    // Generate a new 6-digit verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Mark old codes as used
    if (email) {
      await prisma.verificationCode.updateMany({
        where: { email, used: false },
        data: { used: true },
      });
    }

    if (phoneNumber) {
      await prisma.verificationCode.updateMany({
        where: { phoneNumber, used: false },
        data: { used: true },
      });
    }

    // Create new verification code
    await prisma.verificationCode.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        code,
        type,
        expiresAt,
        used: false,
      },
    });

    // Send the verification email
    if (email) {
      const emailResult = await sendVerificationEmail(email, code);

      if (!emailResult.success) {
        await prisma.verificationCode.deleteMany({
          where: { email, code },
        });

        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }
    }

    console.log(`Resent verification code for ${email || phoneNumber}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Verification code resent successfully',
      expiresAt: expiresAt.toISOString(),
      ...(process.env.NODE_ENV === 'development' && { demoCode: code }),
    });
  } catch (error) {
    console.error('Error resending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    );
  }
}