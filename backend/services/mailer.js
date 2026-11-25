import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;
if (env.mail.host) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
}

export const mailEnabled = () => Boolean(transporter);

/** Sends an email. Without SMTP settings it only logs, so development never breaks. */
export async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[mail:not-sent — SMTP not configured] to=${to} | ${subject}`);
    return;
  }
  await transporter.sendMail({ from: env.mail.from, to, subject, html, text });
}

/** Fire-and-forget wrapper: email problems must never fail the user's request. */
export const notify = (promise) => {
  Promise.resolve(promise).catch((err) => console.error('[mail] failed:', err.message));
};
