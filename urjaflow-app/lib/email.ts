import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@urjaflow.com',
      to,
      subject,
      html,
      text,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

interface EmailNotificationData {
  userName: string;
  period?: string;
  energyConsumed?: number;
  amount?: number;
  dueDate?: string;
  generated?: number;
  consumed?: number;
  savings?: number;
  efficiency?: number;
  message?: string;
}

export function generateNotificationEmail(type: string, data: EmailNotificationData) {
  const templates = {
    billing: {
      subject: 'UrjaFlow Billing Receipt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">UrjaFlow Billing Receipt</h2>
          <p>Dear ${data.userName},</p>
          <p>Your billing period has ended. Here are the details:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Billing Summary</h3>
            <p><strong>Period:</strong> ${data.period}</p>
            <p><strong>Energy Consumed:</strong> ${data.energyConsumed} kWh</p>
            <p><strong>Total Amount:</strong> $${data.amount}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          <p>Thank you for using UrjaFlow!</p>
        </div>
      `,
    },
    energy: {
      subject: 'UrjaFlow Daily Energy Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">UrjaFlow Daily Energy Report</h2>
          <p>Dear ${data.userName},</p>
          <p>Here's your energy usage summary for today:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Energy Usage</h3>
            <p><strong>Generated:</strong> ${data.generated} kWh</p>
            <p><strong>Consumed:</strong> ${data.consumed} kWh</p>
            <p><strong>Savings:</strong> $${data.savings}</p>
            <p><strong>Efficiency:</strong> ${data.efficiency}%</p>
          </div>
          <p>Keep monitoring your energy usage!</p>
        </div>
      `,
    },
    alert: {
      subject: 'UrjaFlow System Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">UrjaFlow System Alert</h2>
          <p>Dear ${data.userName},</p>
          <p>${data.message}</p>
          <p>Please check your dashboard for more details.</p>
        </div>
      `,
    },
  };

  return templates[type as keyof typeof templates] || templates.alert;
}
