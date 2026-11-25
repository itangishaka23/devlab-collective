import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import useFetch from '../hooks/useFetch.js';
import { getFaqs } from '../api/services.js';
import { FAQS as FALLBACK_FAQS, FAQ_CATEGORIES } from '../data/faqs.js';

export default function Faq() {
  const [term, setTerm] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(null);
  const { data: FAQS, loading } = useFetch(getFaqs, FALLBACK_FAQS, []);

  const visible = useMemo(() => {
    const t = term.trim().toLowerCase();
    return FAQS.filter(
      (f) => (cat === 'all' || f.cat === cat) && (!t || `${f.q} ${f.a}`.toLowerCase().includes(t))
    );
  }, [term, cat, FAQS]);

  const groups = FAQ_CATEGORIES.filter((c) => c.id !== 'all')
    .map((c) => ({ ...c, items: visible.filter((f) => f.cat === c.id) }))
    .filter((g) => g.items.length);

  return (
    <>
      <Seo title="FAQ" description="Answers about joining the DevLab Collective, our projects, tools and careers." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative text-center">
          <span className="eyebrow"><i className="bi bi-question-circle-fill" /> Help Center</span>
          <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)', maxWidth: 700 }}>
            Frequently Asked Questions
          </h1>
          <p className="hero-lead mt-3 mx-auto text-center">
            Answers about joining the lab, projects, our tools and what comes after.
          </p>
          <div className="faq-search mt-4">
            <i className="bi bi-search" />
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search questions, e.g. 'sprint' or 'CI pipeline'"
              aria-label="Search FAQs"
            />
            <button className={`clear-btn ${term ? 'show' : ''}`} type="button" aria-label="Clear search" onClick={() => setTerm('')}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </Reveal>
      </header>

      <section className="pb-0" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="faq-cats">
            {FAQ_CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={`faq-cat-btn ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
                <i className={`bi ${c.icon}`} />{c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {groups.map((g) => (
            <div className="faq-group" key={g.id}>
              <div className="faq-group-title"><span className="gi"><i className={`bi ${g.icon}`} /></span>{g.label}</div>
              <div className="accordion faq-accordion">
                {g.items.map((f) => {
                  const id = `${g.id}-${f.id ?? f.q}`;
                  const isOpen = open === id;
                  return (
                    <div className="faq-item" data-hidden="false" key={id}>
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpen(isOpen ? null : id)}
                          >
                            {f.q}
                          </button>
                        </h2>
                        <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                          <div className="accordion-body">{f.a}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {loading && <p className="text-center text-muted" role="status">Loading questions…</p>}
          <div className={`faq-empty ${!loading && groups.length === 0 ? 'show' : ''}`}>
            <i className="bi bi-search" style={{ fontSize: '2rem' }} />
            <h5 className="font-display fw-bold mt-2">No matching questions</h5>
            <div className="small">Try a different search term, or browse all categories above.</div>
          </div>
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container">
          <Reveal anim="zoom" className="faq-cta">
            <div className="content">
              <i className="bi bi-headset" style={{ fontSize: '2.2rem' }} />
              <h3 className="font-display fw-bold mt-3 mb-2" style={{ fontSize: '1.5rem' }}>Still have questions?</h3>
              <p className="mb-4" style={{ opacity: 0.92 }}>Our mentors and organisers are one message away.</p>
              <Link to={{ pathname: '/', hash: '#contact' }} className="btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-envelope-fill" /> Contact the Lab
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
