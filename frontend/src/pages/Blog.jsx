import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/services.js';
import Art from '../components/Art.jsx';
import Pagination from '../components/Pagination.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import { POSTS as FALLBACK_POSTS, POST_CATEGORIES } from '../data/posts.js';
import useDebounce from '../hooks/useDebounce.js';
import useFetch from '../hooks/useFetch.js';
import useSubscribe from '../hooks/useSubscribe.js';

const PER_PAGE = 6;

// Same filtering the API does, used when the API is offline.
function localPage({ category, search, page }) {
  const q = (search || '').toLowerCase();
  const all = FALLBACK_POSTS.filter(
    (p) =>
      (!category || category === 'All Posts' || p.category === category) &&
      (!q || `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(q))
  );
  return {
    items: all.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    meta: { page, limit: PER_PAGE, total: all.length, pages: Math.max(Math.ceil(all.length / PER_PAGE), 1) },
  };
}

export default function Blog() {
  const [cat, setCat] = useState('All Posts');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), 350);
  const nl = useSubscribe('blog');

  const params = { category: cat, search: q, page };
  const { data, loading, offline } = useFetch(
    () => getPosts({ page, limit: PER_PAGE, ...(cat !== 'All Posts' ? { category: cat } : {}), ...(q ? { search: q } : {}) }),
    localPage(params),
    [cat, q, page]
  );

  const { items, meta } = data;
  const featured = page === 1 && cat === 'All Posts' && !q ? items[0] : null;
  const grid = featured ? items.slice(1) : items;

  const changePage = (p) => {
    setPage(p);
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Seo title="Engineering Blog" description="Notes on building, testing and shipping software from DevLab Collective members and mentors." />
      <header className="blog-hero">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <div className="container">
          <Reveal className="row">
            <div className="col-lg-8">
              <span className="eyebrow"><i className="bi bi-journal-code" /> DevLab Engineering Blog</span>
              <h1 className="section-title mt-3" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Notes on building, testing and shipping software</h1>
              <p className="section-sub mt-3">Write-ups from lab members and mentors: engineering practice, tooling experiments and honest lessons from real releases.</p>
            </div>
          </Reveal>

          <div className="faq-search blog-search mt-4">
            <i className="bi bi-search" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles, e.g. 'testing' or 'CI'"
              aria-label="Search articles"
            />
            <button className={`clear-btn ${search ? 'show' : ''}`} type="button" aria-label="Clear search" onClick={() => { setSearch(''); setPage(1); }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className="blog-filter">
            {POST_CATEGORIES.map((c) => (
              <button key={c} type="button" className={c === cat ? 'active' : ''} onClick={() => { setCat(c); setPage(1); }}>{c}</button>
            ))}
          </div>
        </div>
      </header>

      {featured && (
        <section className="section-pad bg-white pt-0">
          <div className="container">
            <Reveal>
              <Link to={`/blog/${featured.slug}`} className="text-decoration-none d-block">
                <div className="featured-post">
                  <div className="fp-img">
                    <Art icon={featured.icon} variant={featured.art} className="art-fill" />
                    <span className="fp-tag">{featured.category}</span>
                  </div>
                  <div className="fp-body">
                    <div className="fp-meta">
                      <span><i className="bi bi-calendar3" /> {featured.date}</span>
                      <span><i className="bi bi-clock" /> {featured.read}</span>
                      <span><i className="bi bi-person" /> {featured.author.name}</span>
                    </div>
                    <h2>{featured.title}</h2>
                    <p className="text-muted">{featured.excerpt}</p>
                    <span className="fp-link">Read the full article <i className="bi bi-arrow-right" /></span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section className={`section-pad pt-0 ${featured ? '' : 'pt-5'}`} id="posts">
        <div className="container">
          {offline && <p className="text-center text-muted small" role="status">Showing saved articles — the server is offline.</p>}
          {loading && <p className="text-center text-muted" role="status">Loading articles…</p>}
          {!loading && items.length === 0 && (
            <p className="text-center text-muted">{q ? `No articles match “${q}”.` : 'No posts in this category yet.'}</p>
          )}
          <div className="row g-4">
            {grid.map((p, i) => (
              <Reveal className="col-md-6 col-lg-4" delay={(i % 3) * 100} key={p.slug}>
                <Link to={`/blog/${p.slug}`} className="text-decoration-none">
                  <div className="blog-card">
                    <div className="bc-img">
                      <Art icon={p.icon} variant={p.art} className="art-fill" />
                      <span className="bc-tag">{p.category}</span>
                    </div>
                    <div className="bc-body">
                      <div className="bc-meta">
                        <span><i className="bi bi-calendar3" /> {p.date}</span>
                        <span><i className="bi bi-clock" /> {p.read}</span>
                      </div>
                      <h5>{p.title}</h5>
                      <p>{p.excerpt}</p>
                      <span className="bc-link">Read more <i className="bi bi-arrow-right" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Pagination page={meta.page} pages={meta.pages} onChange={changePage} />
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container">
          <Reveal anim="zoom" className="blog-newsletter">
            <i className="bi bi-envelope-paper-heart" style={{ fontSize: '2.2rem', color: '#1fa88c' }} />
            <h2 className="mt-3 mb-0" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,2.6vw,1.9rem)' }}>Get new articles in your inbox</h2>
            <p className="mt-2 mb-0" style={{ opacity: 0.8 }}>One email a month. Engineering notes, no spam.</p>
            {nl.status === 'success' ? (
              <p className="mt-3 mb-0 fw-semibold" role="status"><i className="bi bi-check-circle-fill me-2" />{nl.message}</p>
            ) : (
              <>
                <form className="nl-form" onSubmit={nl.submit}>
                  <input type="email" placeholder="Your email address" aria-label="Email for blog newsletter" required value={nl.email} onChange={(e) => nl.setEmail(e.target.value)} />
                  <button type="submit" disabled={nl.status === 'loading'}>{nl.status === 'loading' ? 'Subscribing…' : (<>Subscribe <i className="bi bi-arrow-right" /></>)}</button>
                </form>
                {nl.status === 'error' && <p className="mt-2 mb-0 small" role="alert" style={{ color: '#ffd68a' }}>{nl.message}</p>}
              </>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
