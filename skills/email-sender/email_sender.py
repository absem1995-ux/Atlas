#!/usr/bin/env python3

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import requests

# Configuration
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "resend")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@orchestrai.com")

def send_email_resend(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    from_email: str = FROM_EMAIL
) -> dict:
    """Send email using Resend API (free tier)"""
    
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not configured")
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": from_email,
        "to": to,
        "subject": subject,
        "html": html,
        "text": text or html
    }
    
    response = requests.post(
        "https://api.resend.com/emails",
        headers=headers,
        json=payload
    )
    
    if response.status_code in [200, 201]:
        data = response.json()
        return {
            "success": True,
            "message_id": data.get("id"),
            "to": to,
            "subject": subject
        }
    else:
        return {
            "success": False,
            "error": response.text,
            "status_code": response.status_code
        }

def send_email_gmail(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    from_email: str = FROM_EMAIL
) -> dict:
    """Send email using Gmail SMTP"""
    
    if not GMAIL_USER or not GMAIL_PASSWORD:
        raise ValueError("GMAIL_USER and GMAIL_PASSWORD not configured")
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to
        
        # Attach text and HTML versions
        if text:
            msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        # Send via Gmail
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(from_email, to, msg.as_string())
        
        return {
            "success": True,
            "message_id": f"{to}_{subject}",
            "to": to,
            "subject": subject
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def send_email(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
    from_email: str = FROM_EMAIL,
    provider: Optional[str] = None
) -> dict:
    """
    Send email via configured provider
    
    Args:
        to: Recipient email
        subject: Email subject
        html: HTML content
        text: Plain text fallback
        from_email: From address
        provider: Override provider (resend or gmail)
    
    Returns:
        dict with success status and metadata
    """
    
    actual_provider = provider or EMAIL_PROVIDER
    
    if actual_provider == "resend":
        return send_email_resend(to, subject, html, text, from_email)
    elif actual_provider == "gmail":
        return send_email_gmail(to, subject, html, text, from_email)
    else:
        raise ValueError(f"Unknown email provider: {actual_provider}")

if __name__ == "__main__":
    # Test email
    test_html = """
    <html>
        <body>
            <h1>Test Email</h1>
            <p>This is a test email from OrchestrAI.</p>
        </body>
    </html>
    """
    
    result = send_email(
        to="absem1995@gmail.com",
        subject="Test Email from OrchestrAI",
        html=test_html
    )
    
    print(json.dumps(result, indent=2))
