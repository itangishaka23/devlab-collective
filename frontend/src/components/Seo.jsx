import { useEffect } from 'react';

const SITE = 'DevLab Collective';
const DEFAULT_DESC =
  'DevLab Collective is a software engineering lab where students and mentors design, build, test and ship real software together.';

function setMeta(attr, key, content) {
  if (content === undefined || content === null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets the page title and social-sharing meta tags for the current route. */
export default function Seo({ title, description = DEFAULT_DESC, path, image, type = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE}` : `${SITE} — Software Engineering Lab`;
    const url = `${window.location.origin}${path ?? window.location.pathname}`;
    const img = image || `${window.location.origin}/og-image.png`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);
    setCanonical(url);
  }, [title, description, path, image, type]);

  return null;
}
