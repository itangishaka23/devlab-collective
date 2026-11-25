# DevLab Collective — API (Node.js + Express + MySQL)

REST API for the DevLab website, written in an MVC layout.

```
backend/
  app.js               Express app (middleware + routes) — imported by tests
  server.js            starts the server after checking the DB connection
  config/              env.js (settings), db.js (MySQL pool)
  models/              SQL / data access (User, Project, Post, Comment, Reaction, Event, Application, Report, …)
  controllers/         request handlers (business logic)
  routes/              URL → controller mapping (+ validation & auth per route)
  middlewares/         auth (JWT), validators, rateLimiter, errorHandler, notFound
  services/            mailer, email templates, GitHub client
  utils/               AppError, asyncHandler, helpers, file helpers
  tests/               Vitest + Supertest (data layer mocked)
  uploads/             team photos, gallery images, report PDFs (created automatically)
  database/            schema.sql + seed/*.json
  scripts/initDb.js    creates the DB, tables and sample data
```

## Setup with XAMPP

1. Open the **XAMPP Control Panel** and **Start MySQL** (Apache is not required).
2. In this folder:
   ```bash
   npm install
   npm run db:init      # creates database "devlab_db", tables, sample data and the admin user
   npm run dev          # nodemon → http://localhost:5000/api/health
   ```
3. Open http://localhost/phpmyadmin (optional) to browse the data.

`.env` is pre-filled with XAMPP defaults (user `root`, empty password, port `3306`).
If MySQL runs on another port (e.g. `3307`), change `DB_PORT`.
Prefer phpMyAdmin? Import `database/schema.sql` from its **Import** tab instead of `db:init`
(then run `npm run db:init` once to add the sample data and admin user).

`npm run db:reset` **drops** the database and rebuilds it — it deletes all data.

### Changing the admin email / password

Edit `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run admin:set`. It updates the existing admin account in place (no data is lost) and the old login stops working. (Editing `.env` alone is not enough — `db:init` only creates the admin once.)

### Admin login

Created by `db:init` from `.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(default `admin@devlab.local` / `ChangeMe123!`). **Change these before deploying.**

## Endpoints

All responses look like `{ "success": true, "data": … }` or `{ "success": false, "message": "…", "errors": [{ "field", "message" }] }`.
Admin requests need the header `Authorization: Bearer <token>`.

**Public**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | health check |
| GET | `/sitemap.xml` | live sitemap |
| GET | `/api/projects` · `/api/projects/:idOrSlug` | projects |
| GET | `/api/projects/:idOrSlug/github` | live GitHub stats (needs `github_repo` on the project) |
| POST | `/api/projects/:id/interest` | `{ name, email }` — join a project |
| GET | `/api/posts?category=&search=&page=&limit=` | paginated blog list (`meta`: page, limit, total, pages) |
| GET | `/api/posts/:slug` | one article |
| GET / POST | `/api/posts/:slug/reactions` | counts / toggle `{ type: like\|insightful\|celebrate }` |
| GET | `/api/posts/:slug/comments` | approved comments |
| GET | `/api/events?scope=upcoming\|past\|all` · `/api/events/:id` | events |
| POST | `/api/events/:id/register` | `{ name, email }` |
| GET | `/api/hosted-projects?limit=` · `/api/hosted-projects/:idOrSlug` | finished projects that are live |
| GET | `/api/faqs` · `/api/team` · `/api/gallery` · `/api/reports` | content lists |
| GET | `/api/reports/:id/download` | download a report PDF |
| POST | `/api/applications` | membership application |
| POST | `/api/contact` · `/api/subscribers` | contact form / newsletter |
| POST | `/api/auth/register` · `/api/auth/login` | member accounts (returns a JWT) |

**Signed-in members**

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/me` | current user |
| PUT | `/api/me/profile` · `/api/me/password` | update profile / change password |
| GET | `/api/me/projects` · `/api/me/events` | my projects / registrations |
| POST | `/api/posts/:slug/comments` | `{ body }` (held for moderation unless `COMMENTS_AUTO_APPROVE=true`) |

**Admin**

| Method | Path | Purpose |
|---|---|---|
| POST / PUT / DELETE | `/api/projects`, `/api/posts`, `/api/faqs`, `/api/events` (`/:id`) | manage content |
| POST / PUT / DELETE | `/api/team`, `/api/gallery`, `/api/reports`, `/api/hosted-projects` | manage content with uploads (multipart: `photo` / `image` / `file` / `screenshot`) |
| GET | `/api/admin/stats` · `/api/admin/users` · `/api/admin/posts` | overview, members, all posts incl. drafts |
| GET / PATCH / DELETE | `/api/admin/messages` | contact inbox (`status`: new/read/archived) |
| GET / DELETE | `/api/admin/subscribers` | newsletter list |
| GET / PATCH / DELETE | `/api/admin/applications` | review applications (`status`: pending/approved/rejected, `admin_note`) |
| GET / PATCH / DELETE | `/api/admin/comments` | moderate comments |
| GET | `/api/admin/events/:id/registrations` | attendees |

### Quick test (PowerShell)

```powershell
curl http://localhost:5000/api/projects

curl -Method POST http://localhost:5000/api/auth/login -ContentType "application/json" `
  -Body '{"email":"admin@devlab.local","password":"ChangeMe123!"}'

curl http://localhost:5000/api/admin/messages -Headers @{ Authorization = "Bearer PASTE_TOKEN" }
```

## Notes

- Run `npm test` for the API tests (no MySQL required — the models are mocked).
- Uploads: JPG/PNG/WebP ≤ 2 MB for images, PDF ≤ 10 MB for reports; checked by real file signature.
- Only pure-JavaScript packages are used (`bcryptjs`, `mysql2`, …) — no native add-ons, so
  Windows Application Control / Smart App Control does not block them.
- Public forms are rate-limited; inputs are validated with express-validator; queries are parameterised.
- Blog posts, project stacks etc. are stored as JSON text, which works on XAMPP's MariaDB as well as MySQL.
