# Email Notifications Setup Guide

This guide will help you set up email notifications for new user signups on InsightSnap.

## 🎯 What You'll Get

When someone signs up (via email or Google), you'll automatically receive a beautiful HTML email with:
- User's name and email
- Subscription tier
- Signup method (Email or Google)
- Timestamp
- Quick stats about their account limits

---

## 📋 Prerequisites

You'll need an email account to send notifications from. We recommend using Gmail with an App Password for security.

---

## 🔧 Setup Instructions

### Step 1: Generate Gmail App Password

1. Go to your **Google Account** settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other (Custom name)**
6. Enter "InsightSnap Backend" as the name
7. Click **Generate**
8. **Copy the 16-character password** (you won't see it again!)

### Step 2: Configure Backend Environment Variables

1. Open `insightsnap-backend/.env` file
2. Add the following configuration:

```env
# Email Configuration (for signup notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_actual_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password_here
ADMIN_EMAIL=admin@insightsnap.co
```

**Replace:**
- `your_actual_email@gmail.com` with your Gmail address
- `your_16_char_app_password_here` with the app password from Step 1
- `admin@insightsnap.co` with the email where you want to receive notifications

### Step 3: Install Dependencies

```bash
cd insightsnap-backend
npm install
```

This will install `nodemailer` which is required for sending emails.

### Step 4: Test Email Service

1. Start your backend server:
```bash
cd insightsnap-backend
npm start
```

2. Test the email configuration:
```bash
curl http://localhost:3001/api/notifications/test
```

You should see:
```json
{
  "success": true,
  "message": "Email service configured correctly",
  "timestamp": "..."
}
```

### Step 5: Deploy to Production

#### For Railway:
1. Go to your Railway project
2. Navigate to **Variables**
3. Add these environment variables:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your_email@gmail.com`
   - `SMTP_PASSWORD` = `your_app_password`
   - `ADMIN_EMAIL` = `admin@insightsnap.co`
4. Redeploy your backend

#### For Netlify (if using Netlify Functions):
1. Go to **Site settings** → **Environment variables**
2. Add the same variables as above
3. Redeploy

---

## 🧪 Testing

### Test with a Real Signup

1. Go to your InsightSnap site
2. Sign up with a new email or Google account
3. Check your admin email inbox
4. You should receive a beautiful HTML email!

### Manual API Test

You can also test by calling the API directly:

```bash
curl -X POST http://localhost:3001/api/notifications/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "subscription_tier": "free",
    "signup_method": "email"
  }'
```

---

## 📧 Email Template Preview

The email includes:
- **Header**: Gradient purple background with "🎉 New User Signup!"
- **User Details**: Name, email, subscription tier, signup method
- **Quick Stats**: Search limits based on tier
- **Beautiful Design**: Responsive HTML with your branding

---

## 🔒 Security Notes

1. **Never commit `.env` files** to git (they're already in `.gitignore`)
2. **Use App Passwords** instead of your actual Gmail password
3. **Enable 2FA** on your Google account for extra security
4. **Rotate passwords** periodically for best practices

---

## ❌ Troubleshooting

### "Email service not configured" error
- Check that all SMTP environment variables are set
- Verify there are no typos in variable names
- Restart your backend server after changing `.env`

### Emails not sending
- Verify your Gmail App Password is correct (no spaces)
- Check that 2-Step Verification is enabled on Google
- Ensure `SMTP_HOST` is `smtp.gmail.com` (not `smtp.google.com`)
- Check backend logs for detailed error messages

### "Authentication failed" error
- Your App Password may be incorrect
- Try generating a new App Password
- Make sure you're using an App Password, not your regular Gmail password

### Testing locally but not in production
- Verify environment variables are set on your hosting platform
- Check that the backend URL is correct in your frontend
- Look at deployment logs for any errors

---

## 🎨 Customization

### Change Email Design

Edit `insightsnap-backend/services/emailService.js`:
- Modify `generateSignupEmailHTML()` for HTML design
- Modify `generateSignupEmailText()` for plain text fallback
- Update colors, fonts, and layout as needed

### Change Admin Email

Update `ADMIN_EMAIL` in your `.env` file:
```env
ADMIN_EMAIL=your_new_email@example.com
```

### Send to Multiple Emails

Modify the `notifyNewSignup()` function to send to multiple recipients:
```javascript
to: [this.adminEmail, 'ceo@company.com', 'team@company.com'].join(', ')
```

---

## 📚 API Endpoints

### POST `/api/notifications/signup`
Send a new signup notification

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "subscription_tier": "free",
  "signup_method": "google"
}
```

### GET `/api/notifications/test`
Test email service configuration

### GET `/api/notifications/health`
Check notification service status

---

## 🚀 Alternative Email Providers

If you don't want to use Gmail, you can use:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your_mailgun_password
```

### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASSWORD=your_ses_smtp_password
```

---

## ✅ Summary

You've now set up:
- ✅ Email notification service
- ✅ Beautiful HTML email templates
- ✅ Automatic notifications for email & Google signups
- ✅ Secure SMTP configuration
- ✅ Production-ready deployment

Every time someone signs up, you'll get an email! 📧🎉

---

## 💡 Need Help?

If you encounter any issues:
1. Check the backend logs: `cd insightsnap-backend && npm start`
2. Test the email service: Visit `http://localhost:3001/api/notifications/health`
3. Review environment variables in your `.env` file
4. Make sure nodemailer is installed: `npm list nodemailer`

---

**Happy monitoring!** 🎉

