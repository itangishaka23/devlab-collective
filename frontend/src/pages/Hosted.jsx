import { useMemo, useState } from 'react';
import { getHostedProjects } from '../api/services.js';
import HostedCard from '../components/HostedCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import useFetch from '../hooks/useFetch.js';

export default function Hosted() {
  const { data, loading, error } = useFetch(() => getHostedProjects(), [], []);
  const [cat, setCat] = useState('All');
  const cats = useMemo(() => ['All', ...new Set(data.map((p) => p.category))], [data]);
  const shown = cat === 'All' ? data : data.filter((p) => p.category === cat);

  return (
    <>
      <Seo title="Hosted Projects" description="Finished projects built by the DevLab Collective and hosted live on the internet." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative text-center">
          <span className="eyebrow"><i className="bi bi-cloud-check-fill" /> Shipped &amp; live</span>
          <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)', maxWidth: 720 }}>Hosted projects</h1>
          <p className="hero-lead mt-3 mx-auto text-center">Real software built by our members, finished and running on the internet. Open any of them and try it.</p>
        </Reveal>
      </header>

      <section className="section-pad pt-3">
        <div className="container">
          {cats.length > 2 && (
            <div className="blog-filter justify-content-center mb-4">
              {cats.map((c) => <button key={c} type="button" className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}
          {loading && <p className="text-center text-muted" role="status">Loading projects…</p>}
          {error && <div className="alert alert-warning text-center" role="alert">Hosted projects could not be loaded: {error.message}</div>}
          {!loading && !error && data.length === 0 && (
            <div className="hosted-empty">
              <i className="bi bi-cloud-upload" />
              <h2>Nothing hosted yet</h2>
              <p className="text-muted mb-0">Finished projects will appear here as soon as the lab publishes them.</p>
            </div>
          )}
          <div className="row g-4">
            {shown.map((p, i) => (
              <Reveal className="col-md-6 col-lg-4" delay={(i % 3) * 100} key={p.id}>
                <HostedCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
