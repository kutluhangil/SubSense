
export const getVerificationEmailTemplate = (link: string, appName: string = 'SubSense') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email for ${appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 32px;
      text-align: center;
    }
    .content h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
    }
    .content p {
      color: #4b5563;
      font-size: 16px;
      margin-bottom: 32px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }
    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 32px 0;
    }
    .fallback {
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
    }
    .fallback a {
      color: #2563eb;
      text-decoration: none;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: #111827; }
      .container { background-color: #1f2937; border-color: #374151; }
      .content h2 { color: #f9fafb; }
      .content p { color: #d1d5db; }
      .footer { background-color: #111827; border-color: #374151; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- You can replace text with an img tag for logo -->
      <h1>${appName}</h1>
    </div>
    
    <div class="content">
      <h2>Verify your email address</h2>
      <p>Thanks for joining! We're excited to have you on board. Please verify your email address to get started.</p>
      
      <a href="${link}" class="button">Verify Email</a>
      
      <div class="divider"></div>
      
      <p class="fallback">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${link}">${link}</a>
      </p>
    </div>
    
    <div class="footer">
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
