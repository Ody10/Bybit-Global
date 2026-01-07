export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { sendDepositConfirmationEmail, verifySmtpConnection, BRAND_CONFIG } from '@/lib/email';

// POST /api/admin/test-email
// Send a test email to verify SMTP configuration
export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('x-api-secret');
    if (authHeader !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email address' },
        { status: 400 }
      );
    }

    console.log(`\n========================================`);
    console.log(`TEST EMAIL REQUEST`);
    console.log(`========================================`);
    console.log(`To: ${email}`);
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_USER}`);
    console.log(`SMTP From: ${process.env.SMTP_FROM_EMAIL}`);
    console.log(`Brand: ${BRAND_CONFIG.name}`);
    console.log(`========================================\n`);

    // First verify SMTP connection
    console.log('Verifying SMTP connection...');
    const smtpOk = await verifySmtpConnection();
    
    if (!smtpOk) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
        },
        hint: 'Check your SMTP credentials. For SendGrid, use "apikey" as username and your API key as password.',
      });
    }

    console.log('SMTP connection OK, sending test email...');

    // Send test deposit email
    const result = await sendDepositConfirmationEmail(email, {
      amount: '100.00',
      token: 'USDT',
      chainType: 'ETH',
      depositAddress: '0x8BFBEaac8bfD0a13CEC51178E8A30Ac119BB172E',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    if (result.success) {
      console.log(`✅ Test email sent successfully to ${email}`);
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
          brand: BRAND_CONFIG.name,
        },
      });
    } else {
      console.error(`❌ Failed to send test email: ${result.error}`);
      return NextResponse.json({
        success: false,
        error: result.error,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
        },
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/test-email - Check email configuration
export async function GET(request: NextRequest) {
  const config = {
    smtp: {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER || 'NOT SET',
      passSet: !!process.env.SMTP_PASS,
      fromEmail: process.env.SMTP_FROM_EMAIL || 'NOT SET',
    },
    brand: {
      name: BRAND_CONFIG.name,
      supportEmail: BRAND_CONFIG.supportEmail,
      baseUrl: BRAND_CONFIG.baseUrl,
    },
  };

  // Test SMTP connection
  let smtpStatus = 'unknown';
  try {
    const ok = await verifySmtpConnection();
    smtpStatus = ok ? 'connected' : 'failed';
  } catch (error) {
    smtpStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json({
    success: true,
    config,
    smtpStatus,
    hint: smtpStatus !== 'connected' 
      ? 'SMTP connection failed. For SendGrid: user should be "apikey" and pass should be your SendGrid API key starting with "SG."'
      : 'SMTP connection successful. You can send test emails.',
  });
}
