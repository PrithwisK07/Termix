import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

console.log("USER:", process.env.EMAIL_USER);
console.log("PASS EXISTS:",  process.env.EMAIL_PASS);

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json();

    // 1. Configure the email transport using your Gmail account
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Set up the email data
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,   
      replyTo: email,               
      subject: `[Terminal Portfolio] ${subject || 'New Direct Message'}`,
      text: `
You received a new message from your terminal portfolio!

From: ${email}
Subject: ${subject || 'No Subject'}

Message:
${message}
      `,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Message sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}