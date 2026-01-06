// Notification Service
// Helper functions to create notifications for deposits and withdrawals

import { prisma } from './prisma';
import {
  sendDepositConfirmationEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalSuccessEmail,
} from './email';

interface DepositNotificationData {
  userId: string;
  userEmail: string;
  amount: string;
  token: string;
  chain: string;
  depositAddress: string;
  txHash?: string;
  txUrl?: string;
  explorerName?: string;
  depositId?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}

interface WithdrawalRequestNotificationData {
  userId: string;
  userEmail: string;
  amount: string;
  token: string;
  chain: string;
  toAddress: string;
  fee: string;
  verificationCode: string;
  withdrawalId?: string;
}

interface WithdrawalSuccessNotificationData {
  userId: string;
  userEmail: string;
  amount: string;
  token: string;
  chain: string;
  toAddress: string;
  txHash: string;
  txUrl?: string;
  explorerName?: string;
  withdrawalId?: string;
}

interface WithdrawalFailedNotificationData {
  userId: string;
  userEmail?: string;
  amount: string;
  token: string;
  chain: string;
  toAddress: string;
  reason: string;
  withdrawalId?: string;
}

// Create notification for pending deposit
export async function createDepositPendingNotification(data: DepositNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'DEPOSIT_PENDING',
        category: 'TRANSACTION',
        title: 'Deposit Pending',
        message: `Your deposit of ${data.amount} ${data.token} is being confirmed. ${data.confirmations || 0}/${data.requiredConfirmations || 12} confirmations.`,
        token: data.token,
        amount: data.amount,
        chain: data.chain,
        address: data.depositAddress,
        txHash: data.txHash,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          depositId: data.depositId,
          txUrl: data.txUrl,
          explorerName: data.explorerName,
          confirmations: data.confirmations,
          requiredConfirmations: data.requiredConfirmations,
        }),
      },
    });

    console.log(`Created pending deposit notification for user ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating deposit pending notification:', error);
    throw error;
  }
}

// Create notification for confirmed deposit
export async function createDepositConfirmedNotification(data: DepositNotificationData) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'DEPOSIT_CONFIRMED',
        category: 'TRANSACTION',
        title: 'Deposit Confirmed',
        message: `Your deposit of ${data.amount} ${data.token} has been confirmed and credited to your account.`,
        token: data.token,
        amount: data.amount,
        chain: data.chain,
        address: data.depositAddress,
        txHash: data.txHash,
        priority: 'HIGH',
        isEmailSent: false, // Will be set to true after email is sent
        metadata: JSON.stringify({
          depositId: data.depositId,
          txUrl: data.txUrl,
          explorerName: data.explorerName,
        }),
      },
    });

    // =============================================
    // SEND EMAIL NOTIFICATION
    // =============================================
    console.log(`📧 Sending deposit confirmation email to ${data.userEmail}...`);
    
    // Generate timestamp for email
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const emailResult = await sendDepositConfirmationEmail(data.userEmail, {
      amount: data.amount,
      token: data.token,
      chainType: data.chain,
      depositAddress: data.depositAddress,
      timestamp: timestamp, // ✅ FIXED: Added missing timestamp
    });

    if (emailResult.success) {
      console.log(`✅ Deposit confirmation email sent to ${data.userEmail}`);
      
      // Update notification to mark email as sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: { isEmailSent: true },
      });
    } else {
      console.error(`❌ Failed to send deposit email to ${data.userEmail}: ${emailResult.error}`);
    }

    console.log(`Created confirmed deposit notification for user ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating deposit confirmed notification:', error);
    throw error;
  }
}

// Create notification for withdrawal request
export async function createWithdrawalRequestNotification(data: WithdrawalRequestNotificationData) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'WITHDRAWAL_REQUEST',
        category: 'TRANSACTION',
        title: 'Withdrawal Request',
        message: `You've created a withdrawal request for ${data.amount} ${data.token}. Please verify using the code sent to your email.`,
        token: data.token,
        amount: data.amount,
        chain: data.chain,
        address: data.toAddress,
        priority: 'HIGH',
        isEmailSent: false,
        metadata: JSON.stringify({
          withdrawalId: data.withdrawalId,
          fee: data.fee,
        }),
      },
    });

    // =============================================
    // SEND WITHDRAWAL REQUEST EMAIL
    // =============================================
    console.log(`📧 Sending withdrawal request email to ${data.userEmail}...`);
    
    const emailResult = await sendWithdrawalRequestEmail(data.userEmail, {
      amount: data.amount,
      token: data.token,
      chainType: data.chain,
      withdrawalAddress: data.toAddress,
      fee: data.fee,
      verificationCode: data.verificationCode,
    });

    if (emailResult.success) {
      console.log(`✅ Withdrawal request email sent to ${data.userEmail}`);
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: { isEmailSent: true },
      });
    } else {
      console.error(`❌ Failed to send withdrawal request email: ${emailResult.error}`);
    }

    return notification;
  } catch (error) {
    console.error('Error creating withdrawal request notification:', error);
    throw error;
  }
}

// Create notification for successful withdrawal
export async function createWithdrawalSuccessNotification(data: WithdrawalSuccessNotificationData) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'WITHDRAWAL_SUCCESS',
        category: 'TRANSACTION',
        title: 'Withdrawal Success',
        message: `Your withdrawal of ${data.amount} ${data.token} has been processed successfully.`,
        token: data.token,
        amount: data.amount,
        chain: data.chain,
        address: data.toAddress,
        txHash: data.txHash,
        priority: 'HIGH',
        isEmailSent: false,
        metadata: JSON.stringify({
          withdrawalId: data.withdrawalId,
          txUrl: data.txUrl,
          explorerName: data.explorerName,
        }),
      },
    });

    // =============================================
    // SEND WITHDRAWAL SUCCESS EMAIL
    // =============================================
    console.log(`📧 Sending withdrawal success email to ${data.userEmail}...`);
    
    const emailResult = await sendWithdrawalSuccessEmail(data.userEmail, {
      amount: data.amount,
      token: data.token,
      chainType: data.chain,
      withdrawalAddress: data.toAddress,
      txId: data.txHash,
      txUrl: data.txUrl,
    });

    if (emailResult.success) {
      console.log(`✅ Withdrawal success email sent to ${data.userEmail}`);
      
      await prisma.notification.update({
        where: { id: notification.id },
        data: { isEmailSent: true },
      });
    } else {
      console.error(`❌ Failed to send withdrawal success email: ${emailResult.error}`);
    }

    return notification;
  } catch (error) {
    console.error('Error creating withdrawal success notification:', error);
    throw error;
  }
}

// Create notification for failed withdrawal
export async function createWithdrawalFailedNotification(data: WithdrawalFailedNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'WITHDRAWAL_FAILED',
        category: 'TRANSACTION',
        title: 'Withdrawal Failed',
        message: `Your withdrawal of ${data.amount} ${data.token} could not be processed. Reason: ${data.reason}`,
        token: data.token,
        amount: data.amount,
        chain: data.chain,
        address: data.toAddress,
        priority: 'URGENT',
        metadata: JSON.stringify({
          withdrawalId: data.withdrawalId,
          failureReason: data.reason,
        }),
      },
    });

    console.log(`Created withdrawal failed notification for user ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating withdrawal failed notification:', error);
    throw error;
  }
}

// Create a generic system notification
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        category: 'SYSTEM',
        title,
        message,
        priority,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
}

// Create a security notification
export async function createSecurityNotification(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'SECURITY',
        category: 'SECURITY',
        title,
        message,
        priority: 'URGENT',
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating security notification:', error);
    throw error;
  }
}

// Get unread notification count for user
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

// Delete old notifications (cleanup job)
export async function deleteOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      isRead: true,
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  console.log(`Deleted ${result.count} old notifications`);
  return result.count;
}