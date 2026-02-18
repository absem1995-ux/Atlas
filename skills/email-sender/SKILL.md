# Email Sender Skill

**Purpose:** Send emails programmatically to any recipient  
**Status:** Active  
**Provider:** Using SMTP + Resend API (free tier available)

---

## When to Use

- Send digest reports to email
- Notify users of completed tasks
- Deliver summaries via email
- Send alerts and notifications
- Automated email delivery

## When NOT to Use

- Marketing emails at scale (use email marketing platform)
- Transactional emails from live systems (use ESP)
- Bulk campaigns (use SendGrid, Mailgun)

---

## Setup

### Option 1: Resend API (Recommended - Free)

1. Go to https://resend.com
2. Sign up (free account)
3. Get API key
4. Set environment variable: `RESEND_API_KEY`

### Option 2: Gmail SMTP

1. Enable 2FA on Gmail account
2. Create app password
3. Set: `GMAIL_USER` and `GMAIL_PASSWORD`

---

## Configuration

```bash
# .env
EMAIL_PROVIDER=resend  # or gmail
RESEND_API_KEY=your_api_key
FROM_EMAIL=noreply@yourdomain.com  # Resend verified domain
```

---

## Usage

```python
send_email(
    to="recipient@example.com",
    subject="Your Daily Digest",
    html=html_content,
    text=text_content,  # fallback
    from_email="noreply@yourdomain.com"
)
```

---

## Implementation

See: `email_sender.py`
