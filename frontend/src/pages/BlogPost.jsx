import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Art from '../components/Art.jsx';
import Avatar from '../components/Avatar.jsx';
import Comments from '../components/Comments.jsx';
import Markdown from '../components/Markdown.jsx';
import ReactionsBar from '../components/ReactionsBar.jsx';
import Seo from '../components/Seo.jsx';
import NotFound from './NotFound.jsx';
import useFetch from '../hooks/useFetch.js';
import { getPost as fetchPost, getPosts } from '../api/services.js';
import { POSTS as FALLBACK_POSTS, getPost as getLocalPost } from '../data/posts.js';

function Block({ b }) {
  switch (b.type) {
    case 'h3': return <h3>{b.text}</h3>;
    case 'quote': return <div className="post-pullquote">“{b.text}”</div>;
    case 'code': return <pre className="post-code"><code>{b.text}</code></pre>;
    case 'list':
      return (
        <ul>
          {b.items.map((it, i) => <li key={i}><strong>{it.b}</strong>{it.t}</li>)}
        </ul>
      );
    case 'stats':
      return (
        <div className="post-stat-band">
          {b.items.map((s) => (
            <div key={s.label}><div className="val">{s.val}</div><div className="lbl">{s.label}</div></div>
          ))}
        </div>
      );
    default: return <p>{b.text}</p>;
  }
}

// Remount per article so state never leaks between slugs.
export default function BlogPostRoute() {
  const { slug } = useParams();
  return <BlogPost key={slug} slug={slug} />;
}

function BlogPost({ slug }) {
  const { data: post, loading, error } = useFetch(() => fetchPost(slug), getLocalPost(slug), [slug]);
  const { data: recent } = useFetch(() => getPosts({ limit: 4 }), { items: FALLBACK_POSTS }, []);
  const all = recent.items;

  if (loading) return <section className="section-pad text-center text-muted" role="status">Loading article…</section>;
  // Not found on the API, or offline and not in the bundled content either
  if (!post || error?.status === 404) return <NotFound />;

  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const copyLink = () => navigator.clipboard?.writeText(window.location.href);

  return (
    <>
      <Seo title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} type="article" />
      <header className="post-hero">
        <span className="blob blob-a" />
        <div className="container">
          <Link to="/blog" className="post-back"><i className="bi bi-arrow-left" /> All articles</Link>
          <span className="eyebrow mt-3 d-flex" style={{ width: 'fit-content' }}>
            <i className={`bi ${post.icon}`} /> {post.category}
          </span>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <div className="author">
              <Avatar name={post.author.name} a={post.author.a} b={post.author.b} size={46} />
              <div><div className="name">{post.author.name}</div><div className="role">{post.author.role}</div></div>
            </div>
            <span className="stat"><i className="bi bi-calendar3" /> {post.date}</span>
            <span className="stat"><i className="bi bi-clock" /> {post.read}</span>
          </div>
        </div>
      </header>

      <section className="container">
        <div className="post-cover">
          <Art icon={post.icon} variant={post.art} className="art-cover" />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <Reveal className="post-body">
            {post.content ? <Markdown>{post.content}</Markdown> : (post.body || []).map((b, i) => <Block b={b} key={i} />)}
          </Reveal>

          <div className="post-body">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div className="post-tags">
                {post.tags.map((t) => <Link to="/blog" key={t}>{t}</Link>)}
              </div>
              <div className="post-share">
                <span>Share</span>
                <a href="#" aria-label="Share on X"><i className="bi bi-twitter-x" /></a>
                <a href="#" aria-label="Share on LinkedIn"><i className="bi bi-linkedin" /></a>
                <a href="#" aria-label="Share via email"><i className="bi bi-envelope" /></a>
                <a href="#" aria-label="Copy link" onClick={(e) => { e.preventDefault(); copyLink(); }}><i className="bi bi-link-45deg" /></a>
              </div>
            </div>
          </div>

          <div className="post-body">
            <ReactionsBar slug={post.slug} />
          </div>

          <div className="author-card">
            <Avatar name={post.author.name} a={post.author.a} b={post.author.b} size={64} />
            <div><h6>{post.author.name}</h6><p>{post.author.bio}</p></div>
          </div>

          <div className="post-body">
            <Comments slug={post.slug} />
          </div>
        </div>
      </section>

      <section className="section-pad pt-0 bg-white">
        <div className="container">
          <h2 className="section-title mb-4" style={{ fontSize: 'clamp(1.4rem,2.4vw,1.8rem)' }}>More from the lab</h2>
          <div className="row g-4">
            {related.map((p, i) => (
              <Reveal className="col-md-6 col-lg-4" delay={i * 100} key={p.slug}>
                <Link to={`/blog/${p.slug}`} className="text-decoration-none">
                  <div className="blog-card">
                    <div className="bc-img">
                      <Art icon={p.icon} variant={p.art} className="art-fill" />
                      <span className="bc-tag">{p.category}</span>
                    </div>
                    <div className="bc-body">
                      <div className="bc-meta"><span><i className="bi bi-calendar3" /> {p.date}</span><span><i className="bi bi-clock" /> {p.read}</span></div>
                      <h5>{p.title}</h5>
                      <span className="bc-link">Read more <i className="bi bi-arrow-right" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
