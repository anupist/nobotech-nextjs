import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    await db.auditLog.create({
      data: {
        action: 'CONTACT_FORM_SUBMISSION',
        module: 'contact',
        details: JSON.stringify({ name, email, subject, message }),
      },
    });

    let emailSent = false;
    try {
      const settings = await db.setting.findMany({
        where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name', 'contact_email'] } },
      });
      const settingsMap: Record<string, string> = {};
      for (const s of settings) settingsMap[s.key] = s.value;

      if (settingsMap.smtp_host && settingsMap.smtp_from_email) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: settingsMap.smtp_host,
          port: parseInt(settingsMap.smtp_port || '587'),
          secure: settingsMap.smtp_port === '465',
          auth: {
            user: settingsMap.smtp_user,
            pass: settingsMap.smtp_pass,
          },
        });

        await transporter.sendMail({
          from: `"${settingsMap.smtp_from_name || name}" <${settingsMap.smtp_from_email}>`,
          to: settingsMap.contact_email || settingsMap.smtp_from_email,
          subject: `Contact Form: ${subject || 'General Inquiry'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
        emailSent = true;
      }
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Your message has been received. We will get back to you soon.',
        emailSent,
      },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
