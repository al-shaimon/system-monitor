import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import os from 'os';
import si from 'systeminformation';

// Interface for network interface objects
interface NetworkInterface {
  iface: string;
  ip4: string;
  mac: string;
  internal: boolean;
}

// POST handler for App Router
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Gather system information for the report
    const [cpuData, memData, osInfo, networkData] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.networkInterfaces(),
    ]);

    // Format the data into an HTML email
    const emailContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #4f46e5; }
          h2 { color: #6366f1; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>System Monitor Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <h2>CPU Information</h2>
          <table>
            <tr><th>Model</th><td>${cpuData.brand}</td></tr>
            <tr><th>Cores</th><td>${cpuData.cores}</td></tr>
            <tr><th>Speed</th><td>${cpuData.speed} GHz</td></tr>
          </table>
          
          <h2>Memory Information</h2>
          <table>
            <tr><th>Total Memory</th><td>${(memData.total / 1024 / 1024 / 1024).toFixed(
              2
            )} GB</td></tr>
            <tr><th>Free Memory</th><td>${(memData.free / 1024 / 1024 / 1024).toFixed(
              2
            )} GB</td></tr>
            <tr><th>Used Memory</th><td>${(
              (memData.total - memData.free) /
              1024 /
              1024 /
              1024
            ).toFixed(2)} GB</td></tr>
            <tr><th>Usage</th><td>${(
              ((memData.total - memData.free) / memData.total) *
              100
            ).toFixed(2)}%</td></tr>
          </table>
          
          <h2>Operating System</h2>
          <table>
            <tr><th>Platform</th><td>${osInfo.platform}</td></tr>
            <tr><th>OS</th><td>${osInfo.distro} ${osInfo.release}</td></tr>
            <tr><th>Architecture</th><td>${osInfo.arch}</td></tr>
            <tr><th>Hostname</th><td>${os.hostname()}</td></tr>
            <tr><th>Uptime</th><td>${(os.uptime() / 3600).toFixed(2)} hours</td></tr>
          </table>
          
          <h2>Network Information</h2>
          <table>
            <tr><th>Interface</th><th>IP Address</th><th>MAC Address</th></tr>
            ${(networkData as NetworkInterface[])
              .filter((iface) => !iface.internal && iface.ip4)
              .map(
                (iface) =>
                  `<tr><td>${iface.iface}</td><td>${iface.ip4}</td><td>${iface.mac}</td></tr>`
              )
              .join('')}
          </table>
          
          <div class="footer">
            <p>This is an automated report from System Monitor. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Define email options
    const mailOptions = {
      from: {
        name: 'System Monitor',
        address: process.env.SMTP_USER || 'system-monitor@alshaimon.com',
      },
      to: email,
      subject: 'System Monitor Report',
      html: emailContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email', error },
      { status: 500 }
    );
  }
}
