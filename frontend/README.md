# DevLab Collective — Software Engineering Lab (React)

A React + Vite website for the **DevLab Collective** software engineering lab,
converted from the "Hopewell" Bootstrap charity template and re-themed around
the DevLab logo (blue → teal gradient, navy text).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run preview    # serve the production build
```

Requires Node 18+.

## Structure

```
src/
  App.jsx                 routes
  main.jsx                entry (router + styles)
  assets/                 logo-full.png, logo-icon.png (cropped from your logo)
  components/             Navbar, Footer, Layout, Preloader, Reveal, Counter, Modal, CodeWindow, ContactForm…
  pages/                  Home, Blog, BlogPost, Faq, Reports, PolicyPage (Privacy + Terms), NotFound
  data/                   all editable content: projects, team, posts, FAQs, reports, policies, site info
  hooks/                  useInView, useScrollY
  styles/                 bootstrap.min.css, style.css (theme), app.css (additions)
public/favicon.png
```

Routes: `/`, `/blog`, `/blog/:slug`, `/faq`, `/reports`, `/privacy`, `/terms`.

## What changed from the template

- Static HTML pages → React components with React Router.
- jQuery-free: Bootstrap **JS** and AOS were replaced by React state + small hooks
  (navbar toggle, FAQ accordion, testimonials slider, modal, counters, scroll reveal).
- Charity content → software-engineering-lab content (projects, lab practices, workflow, team, blog, reports).
- Stock photos → generated gradient art, initials avatars and an in-page code window (no external images needed).
- Green/amber palette → logo palette (`--clr-primary #1b6fd1`, `--clr-secondary #1fa88c`, navy `#0a1f44`) in `src/styles/style.css`.
- Fixed a bug in the original `prefers-reduced-motion` rule (`NaNs`).
- Contact form, newsletter forms and report downloads are **demo only** — wire them to your backend.

## Customising

All copy lives in `src/data/*.js`. All people, numbers, quotes, emails and
addresses are **sample content** — replace them with your real lab details.

## Credits & licence

Layout and styling derive from the MIT-licensed *Hopewell* template by
K29Solutions (distributed by ThemeWagon). Keep that attribution when
redistributing. Icons: Bootstrap Icons (MIT).
