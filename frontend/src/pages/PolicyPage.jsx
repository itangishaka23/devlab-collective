import { useEffect, useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import useScrollY from '../hooks/useScrollY.js';

function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.type === 'ul') {
      return (
        <ul key={i}>
          {b.items.map((it, j) =>
            typeof it === 'string' ? <li key={j}>{it}</li> : <li key={j}><strong>{it.b}</strong>{it.t}</li>
          )}
        </ul>
      );
    }
    if (b.type === 'callout') {
      return (
        <div key={i} className={`policy-callout ${b.warn ? 'warn' : ''}`}>
          <i className={`bi ${b.warn ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`} /> {b.text}
        </div>
      );
    }
    return <p key={i}>{b.text}</p>;
  });
}

/** Shared layout for Privacy Policy and Terms of Use. */
export default function PolicyPage({ doc }) {
  const y = useScrollY();
  const [active, setActive] = useState(doc.sections[0].id);

  useEffect(() => {
    const pos = y + 140;
    let current = doc.sections[0].id;
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= pos) current = s.id;
    });
    setActive(current);
  }, [y, doc]);

  const jump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: 'smooth' });
  };

  return (
    <>
      <Seo title={doc.title} description={doc.lead} />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative">
          <span className="eyebrow"><i className={`bi ${doc.icon}`} /> {doc.eyebrow}</span>
          <h1 className="hero-title mt-3" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)' }}>{doc.title}</h1>
          <p className="hero-lead mt-3">{doc.lead}</p>
          <div className="policy-updated mt-3"><i className="bi bi-clock-history me-1" /> {doc.updated}</div>
        </Reveal>
      </header>

      <section className="section-pad pt-4">
        <div className="container">
          <div className="policy-layout">
            <aside className="policy-toc d-none d-lg-block">
              <h6>On this page</h6>
              <ul>
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={(e) => jump(e, s.id)}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </aside>
            <div className="policy-content">
              {doc.sections.map((s, i) => (
                <div key={s.id}>
                  <h2 id={s.id}><span className="num">{i + 1}</span>{s.title}</h2>
                  <Blocks blocks={s.blocks} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
