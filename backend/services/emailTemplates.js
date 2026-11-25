import env from '../config/env.js';
import { sendMail, notify } from './mailer.js';

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const layout = (heading, inner) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f6fb;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e3eaf3">
    <div style="background:linear-gradient(135deg,#1b6fd1,#1fa88c);padding:20px 24px;color:#fff;font-size:18px;font-weight:bold">DevLab Collective</div>
    <div style="padding:24px;color:#0f172a;line-height:1.6">
      <h2 style="margin:0 0 12px;color:#0a1f44;font-size:20px">${esc(heading)}</h2>
      ${inner}
    </div>
    <div style="padding:14px 24px;background:#f8fafc;color:#5b6b7c;font-size:12px">Software Engineering Lab · ${esc(env.siteUrl)}</div>
  </div>
</div>`;

const row = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#5b6b7c;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`;

const toAdmin = (subject, heading, rows, extra = '') =>
  notify(sendMail({
    to: env.mail.notifyTo,
    subject,
    html: layout(heading, `<table>${rows.map(([k, v]) => row(k, v)).join('')}</table>${extra}`),
  }));

export const Emails = {
  contactReceived(msg) {
    toAdmin(`New contact message: ${msg.subject}`, 'New contact message', [
      ['From', `${msg.name} <${msg.email}>`], ['Subject', msg.subject],
    ], `<p style="white-space:pre-wrap;background:#f1f6fb;padding:12px;border-radius:10px">${esc(msg.message)}</p>`);
    notify(sendMail({
      to: msg.email,
      subject: 'We received your message — DevLab Collective',
      html: layout(`Thanks, ${msg.name.split(' ')[0]}!`, '<p>We received your message and a member of the lab will reply soon.</p>'),
    }));
  },

  projectInterest({ name, email, project }) {
    notify(sendMail({
      to: email,
      subject: `You’re interested in ${project.title}`,
      html: layout(`Thanks for your interest, ${name.split(' ')[0]}!`,
        `<p>We noted your interest in <strong>${esc(project.title)}</strong>. A mentor will contact you about next steps.</p>
         <p><a href="${esc(env.siteUrl)}/projects/${esc(project.slug)}">View the project</a></p>`),
    }));
    toAdmin(`New project interest: ${project.title}`, 'New project interest', [['Project', project.title], ['Name', name], ['Email', email]]);
  },

  applicationReceived(app) {
    notify(sendMail({
      to: app.email,
      subject: 'We received your application — DevLab Collective',
      html: layout(`Thanks for applying, ${app.name.split(' ')[0]}!`,
        '<p>Your application to join the lab is in. A mentor will review it and reply within a few days.</p>'),
    }));
    toAdmin(`New application: ${app.name}`, 'New membership application', [
      ['Name', app.name], ['Email', app.email], ['Track', app.track], ['Level', app.level], ['Hours/week', app.availability_hours],
    ], `<p style="white-space:pre-wrap;background:#f1f6fb;padding:12px;border-radius:10px">${esc(app.motivation)}</p>`);
  },

  applicationStatus(app) {
    const approved = app.status === 'approved';
    notify(sendMail({
      to: app.email,
      subject: approved ? 'Welcome to the DevLab Collective!' : 'Your DevLab Collective application',
      html: layout(approved ? 'Your application was approved 🎉' : 'An update on your application',
        approved
          ? `<p>Congratulations ${esc(app.name.split(' ')[0])}! We’d love to have you in the lab.</p>${app.admin_note ? `<p>${esc(app.admin_note)}</p>` : ''}<p><a href="${esc(env.siteUrl)}/register">Create your member account</a> using this email address.</p>`
          : `<p>Thank you for applying, ${esc(app.name.split(' ')[0])}. We can’t offer a place this time.</p>${app.admin_note ? `<p>${esc(app.admin_note)}</p>` : ''}<p>You’re welcome to apply again next intake.</p>`),
    }));
  },

  eventRegistration({ name, email, event }) {
    notify(sendMail({
      to: email,
      subject: `You’re registered: ${event.title}`,
      html: layout('You’re registered!',
        `<p>Hi ${esc(name.split(' ')[0])}, your spot is confirmed.</p>
         <table>${row('Event', event.title)}${row('When', event.starts_at)}${row('Where', event.location)}</table>`),
    }));
  },

  welcome(user) {
    notify(sendMail({
      to: user.email,
      subject: 'Welcome to DevLab Collective',
      html: layout(`Welcome, ${user.name.split(' ')[0]}!`,
        `<p>Your member account is ready. You can follow projects, register for events and comment on posts.</p><p><a href="${esc(env.siteUrl)}/account">Open your account</a></p>`),
    }));
  },
};
