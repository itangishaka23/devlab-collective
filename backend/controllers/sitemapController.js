import env from '../config/env.js';
import Post from '../models/Post.js';
import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';

const STATIC_PATHS = ['/', '/projects', '/events', '/hosted', '/blog', '/gallery', '/faq', '/reports', '/join', '/privacy', '/terms'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// GET /sitemap.xml
export const sitemap = asyncHandler(async (req, res) => {
  const [{ items: posts }, projects] = await Promise.all([Post.findPage({ limit: 1000, page: 1 }), Project.findAll()]);
  const urls = [
    ...STATIC_PATHS.map((p) => ({ loc: p })),
    ...projects.map((p) => ({ loc: `/projects/${p.slug}` })),
    ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.published_at })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(env.siteUrl + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>`;
  res.type('application/xml').send(xml);
});
