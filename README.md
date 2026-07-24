# בין גרסאות — Camera-Mosaic Postcard Installation

A live camera-mosaic art piece for a visual-communication graduation exhibition.
Visitors turn their camera feed into a mosaic of drawings, capture an A5 "postcard",
and **email it to themselves** (real attachment, sent from your own Gmail over SMTP).

## What's in here

```
index.html            The whole front-end app (canvas, camera, postcard capture, UI)
api/send-postcard.js   Vercel serverless function that emails the postcard via Gmail SMTP
package.json           Declares the `nodemailer` dependency
vercel.json            Function settings
.env.example           The environment variables you need to set
```

## How the email works

1. Visitor captures a postcard → it's rendered onto a canvas.
2. They type **their own** address and hit **שליחה**.
3. The browser POSTs `{ email, image (JPEG data URL), id }` to `/api/send-postcard`.
4. The function sends it from your Gmail (`GMAIL_USER`) as a JPEG attachment.

> **Which email is which:** the *recipient* is whatever the visitor types on
> screen (it goes to them). The *sender* is fixed — your Gmail address.

---

## Deploy to Vercel (step by step)

### 1. Create a Gmail App Password (this is the only "email setup")
- Your Google account needs **2-Step Verification ON**
  (<https://myaccount.google.com/security>).
- Then create an **App Password**:
  Google Account → Security → 2-Step Verification → **App passwords**.
- You'll get a 16-character password. Copy it — you'll paste it into Vercel.
- No domain, no DNS records needed. Emails are sent from your Gmail address.
- Note: Gmail allows roughly **500 emails/day** — plenty for an exhibition.

### 2. Push this folder to a Git repo (GitHub/GitLab/Bitbucket)

```bash
git init
git add .
git commit -m "Bein Grsaot postcard installation"
# create a repo on GitHub, then:
git remote add origin <your-repo-url>
git push -u origin main
```

### 4. Import into Vercel
- <https://vercel.com/new> → import the repo.
- Framework preset: **Other** (no build step needed — it's static + a function).
- Before deploying, add Environment Variables (Settings → Environment Variables):
  - `GMAIL_USER` = your Gmail address, e.g. `you@gmail.com`
  - `GMAIL_APP_PASSWORD` = the 16-char App Password from step 1
  - `MAIL_FROM_NAME` = `בין גרסאות` (optional display name)
  - `MAIL_BCC` = your address (optional — copies every postcard to you)
- Deploy. Your site is live at `https://<project>.vercel.app`.

> Changed env vars after deploying? Redeploy for them to take effect.

### Run locally (optional)
The email endpoint needs the Vercel runtime, so use the Vercel CLI:

```bash
npm i -g vercel
cp .env.example .env.local   # fill in your real values
vercel dev                   # serves the site + /api locally
```

Opening `index.html` directly with `file://` runs the app but the email
button won't work (no `/api`).

---

## The Print button → printing with no dialog (exhibition kiosk)

The **הדפסה** button calls `window.print()`. A print stylesheet already isolates
just the postcard at A5, borderless, full-colour.

Browsers **cannot** skip the OS print dialog for security reasons. For an unattended
exhibition machine that should print instantly on click, run Chrome in
**kiosk-printing** mode so it auto-prints to the default printer:

**macOS**
```bash
open -a "Google Chrome" --args \
  --kiosk --kiosk-printing \
  "https://<your-project>.vercel.app"
```

**Windows**
```bat
chrome.exe --kiosk --kiosk-printing "https://<your-project>.vercel.app"
```

Then:
- Set the A5 photo printer as the **default** printer in the OS.
- In the printer defaults, set paper size **A5** and enable colour.

With `--kiosk-printing`, each click of **הדפסה** sends the postcard straight to
that default printer — no dialog.
