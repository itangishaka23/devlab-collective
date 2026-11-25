import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Replace the data layer + email sending so tests need neither MySQL nor SMTP.
vi.mock('../models/Project.js', () => ({ default: { findAll: vi.fn(), findByRef: vi.fn() } }));
vi.mock('../models/ContactMessage.js', () => ({ default: { create: vi.fn() } }));
vi.mock('../models/User.js', () => ({ default: { findById: vi.fn(), findByEmail: vi.fn(), create: vi.fn() } }));
vi.mock('../models/Stats.js', () => ({ default: { overview: vi.fn() } }));
vi.mock('../models/Post.js', () => ({ default: { findPage: vi.fn() } }));
vi.mock('../models/HostedProject.js', () => ({ default: { findAll: vi.fn(), findByRef: vi.fn(), create: vi.fn() } }));
vi.mock('../models/Event.js', () => ({ default: { register: vi.fn() } }));
vi.mock('../services/emailTemplates.js', () => ({
  Emails: {
    contactReceived: vi.fn(), projectInterest: vi.fn(), applicationReceived: vi.fn(), applicationStatus: vi.fn(),
    eventRegistration: vi.fn(), welcome: vi.fn(),
  },
}));

const { default: app } = await import('../app.js');
const { default: env } = await import('../config/env.js');
const { default: Project } = await import('../models/Project.js');
const { default: ContactMessage } = await import('../models/ContactMessage.js');
const { default: User } = await import('../models/User.js');
const { default: Stats } = await import('../models/Stats.js');
const { default: Post } = await import('../models/Post.js');
const { default: Event } = await import('../models/Event.js');
const { default: HostedProject } = await import('../models/HostedProject.js');
const { Emails } = await import('../services/emailTemplates.js');

const tokenFor = (id, role) => jwt.sign({ id, role }, env.jwtSecret, { expiresIn: '1h' });

describe('API basics', () => {
  it('GET /api/health → 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('unknown routes → JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/projects returns the list from the model', async () => {
    Project.findAll.mockResolvedValue([{ id: 1, title: 'CampusConnect' }]);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 1, title: 'CampusConnect' }]);
  });

  it('GET /api/posts returns pagination meta', async () => {
    Post.findPage.mockResolvedValue({ items: [{ slug: 'a' }], total: 13 });
    const res = await request(app).get('/api/posts?page=2&limit=6&search=ci');
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 2, limit: 6, total: 13, pages: 3 });
    expect(Post.findPage).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 6, search: 'ci' }));
  });
});

describe('Contact form', () => {
  const valid = { name: 'Jane Doe', email: 'Jane@Example.com', subject: 'Join the Lab', message: 'Hello, I would like to join.' };

  it('rejects invalid input with field errors (422)', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'J', email: 'nope', message: '' });
    expect(res.status).toBe(422);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'message']));
    expect(ContactMessage.create).not.toHaveBeenCalled();
  });

  it('saves a valid message, lowercases the email and sends notifications', async () => {
    const res = await request(app).post('/api/contact').send(valid);
    expect(res.status).toBe(201);
    expect(ContactMessage.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'jane@example.com' }));
    expect(Emails.contactReceived).toHaveBeenCalled();
  });

  it('silently drops bot submissions that fill the honeypot field', async () => {
    const res = await request(app).post('/api/contact').send({ ...valid, website: 'http://spam.example' });
    expect(res.status).toBe(201);
    expect(ContactMessage.create).not.toHaveBeenCalled();
  });
});

describe('Auth & permissions', () => {
  beforeEach(() => {
    User.findById.mockImplementation(async (id) => (id === 1 ? { id: 1, name: 'Admin', role: 'admin' } : { id: 2, name: 'Member', role: 'member' }));
  });

  it('admin routes require a token (401)', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('members cannot use admin routes (403)', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${tokenFor(2, 'member')}`);
    expect(res.status).toBe(403);
  });

  it('admins can use admin routes (200)', async () => {
    Stats.overview.mockResolvedValue({ projects: 6 });
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${tokenFor(1, 'admin')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.projects).toBe(6);
  });

  it('rejects a forged token (401)', async () => {
    const forged = jwt.sign({ id: 1, role: 'admin' }, 'wrong-secret');
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('login with unknown email → 401 with a generic message', async () => {
    User.findByEmail.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever1' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Incorrect email or password.');
  });

  it('register rejects weak passwords (422)', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'New Member', email: 'new@example.com', password: 'short' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    expect(User.create).not.toHaveBeenCalled();
  });
});

describe('Applications & events', () => {
  it('application needs a valid experience level (422)', async () => {
    const res = await request(app).post('/api/applications').send({
      name: 'Jane Doe', email: 'jane@example.com', track: 'Web', level: 'Wizard', availability_hours: 6,
      motivation: 'I want to learn how real teams build software.',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'level')).toBe(true);
  });

  it('event registration works without an account (201)', async () => {
    Event.register.mockResolvedValue({ id: 3, title: 'Demo Day', starts_at: '2026-12-01 14:00:00', location: 'Hall' });
    const res = await request(app).post('/api/events/3/register').send({ name: 'Jane Doe', email: 'jane@example.com' });
    expect(res.status).toBe(201);
    expect(Event.register).toHaveBeenCalledWith(3, expect.objectContaining({ email: 'jane@example.com', userId: null }));
    expect(Emails.eventRegistration).toHaveBeenCalled();
  });
});

describe('Hosted projects', () => {
  beforeEach(() => {
    User.findById.mockImplementation(async (id) => (id === 1 ? { id: 1, name: 'Admin', role: 'admin' } : { id: 2, name: 'Member', role: 'member' }));
  });

  it('lists hosted projects publicly', async () => {
    HostedProject.findAll.mockResolvedValue([{ id: 1, title: 'CampusConnect', url: 'https://campus.example.com' }]);
    const res = await request(app).get('/api/hosted-projects?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('CampusConnect');
    expect(HostedProject.findAll).toHaveBeenCalledWith({ limit: 3 });
  });

  it('returns 404 for an unknown hosted project', async () => {
    HostedProject.findByRef.mockResolvedValue(null);
    const res = await request(app).get('/api/hosted-projects/nope');
    expect(res.status).toBe(404);
  });

  it('only admins can post a hosted project', async () => {
    const anon = await request(app).post('/api/hosted-projects').send({ title: 'x' });
    expect(anon.status).toBe(401);
    const member = await request(app).post('/api/hosted-projects').set('Authorization', `Bearer ${tokenFor(2, 'member')}`).send({ title: 'x' });
    expect(member.status).toBe(403);
  });

  it('requires a real https live address and at least one technology (422)', async () => {
    const res = await request(app)
      .post('/api/hosted-projects')
      .set('Authorization', `Bearer ${tokenFor(1, 'admin')}`)
      .send({ title: 'My App', summary: 'A finished project', live_url: 'not-a-url', tech: '' });
    expect(res.status).toBe(422);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['live_url', 'tech']));
    expect(HostedProject.create).not.toHaveBeenCalled();
  });

  it('accepts a valid hosted project and parses the technology list', async () => {
    HostedProject.create.mockResolvedValue({ id: 5, title: 'My App' });
    const res = await request(app)
      .post('/api/hosted-projects')
      .set('Authorization', `Bearer ${tokenFor(1, 'admin')}`)
      .send({ title: 'My App', summary: 'A finished project', live_url: 'https://myapp.example.com', tech: 'React, Node.js', featured: 'true' });
    expect(res.status).toBe(201);
    expect(HostedProject.create).toHaveBeenCalledWith(expect.objectContaining({ tech: ['React', 'Node.js'], featured: true }));
  });
});
