import nodemailer from 'nodemailer';

// POST /api/send-postcard
// Body: { email: string, image: <data:image/png;base64,...>, id?: string }
// Relays the finished postcard to the visitor as a real email attachment
// through your own Gmail account over SMTP.
//
// Required env vars (set in Vercel → Settings → Environment Variables):
//   GMAIL_USER          your Gmail address, e.g. you@gmail.com
//   GMAIL_APP_PASSWORD  a Google "App Password" (NOT your normal password)
// Optional:
//   MAIL_FROM_NAME      display name for the sender (default "בין גרסאות")
//   MAIL_BCC            copy every postcard to this address (optional)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Backstop that stays UNDER Vercel's ~4.5 MB request-body limit (the binding
// constraint, not Gmail's 25 MB). The client sends JPEG, so real payloads are
// ~0.3-0.8 MB and never approach this.
const MAX_DECODED_BYTES = 3.2 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { email, image, id } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ ok: false, error: 'Invalid email address' });
    }
    if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
      return res.status(400).json({ ok: false, error: 'Invalid image payload' });
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      return res.status(500).json({
        ok: false,
        error: 'Server not configured: GMAIL_USER / GMAIL_APP_PASSWORD are missing'
      });
    }

    // Strip the data-URL prefix -> raw base64 for the attachment.
    const base64 = image.slice(image.indexOf(',') + 1);
    if (!base64) {
      return res.status(400).json({ ok: false, error: 'Empty image data' });
    }
    if (base64.length * 0.75 > MAX_DECODED_BYTES) {
      return res.status(413).json({ ok: false, error: 'Image too large' });
    }

    const safeId = typeof id === 'string' ? id.replace(/[^\w.\-]/g, '') : '';
    const filename = 'postcard-' + (safeId || 'image') + '.jpg';
    const subject = 'בין גרסאות — הגלויה שלך' + (safeId ? ' · ' + safeId : '');
    const fromName = process.env.MAIL_FROM_NAME || 'בין גרסאות';

    const html = `
      <div dir="rtl" style="font-family:Rubik,Arial,Helvetica,sans-serif;color:#151515;max-width:520px;margin:0 auto;padding:24px;text-align:center">
        <h1 style="font-size:22px;margin:0 0 8px">בין גרסאות</h1>
        <p style="font-size:14px;color:#555;margin:0 0 4px">תערוכת בוגרים · תקשורת חזותית</p>
        <p style="font-size:15px;line-height:1.6;margin:16px 0">
          הגלויה שיצרת מצורפת להודעה זו כקובץ תמונה (PNG). תודה שביקרת! 🌸
        </p>
        ${safeId ? `<p style="font-size:12px;color:#999;margin:0">גלויה מס׳ ${safeId}</p>` : ''}
      </div>`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: email.trim(),
      bcc: process.env.MAIL_BCC || undefined,
      subject,
      html,
      attachments: [{ filename, content: base64, encoding: 'base64', contentType: 'image/jpeg' }]
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: (err && err.message) || 'Server error' });
  }
}
