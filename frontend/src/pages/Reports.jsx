import { Link } from 'react-router-dom';
import { getReports, reportDownloadUrl } from '../api/services.js';
import Seo from '../components/Seo.jsx';
import useFetch from '../hooks/useFetch.js';
import Reveal from '../components/Reveal.jsx';
import { REPORT_STATS, HOURS_ALLOCATION, REPORTS as STATIC_REPORTS } from '../data/reports.js';

// Offline fallback: the bundled list, with no downloadable files.
const FALLBACK = STATIC_REPORTS.map((r, i) => ({ id: `s${i}`, title: r.title, sub: r.sub, size: r.size, hasFile: false }));

// Build the conic-gradient for the allocation ring from data
const ring = (() => {
  let acc = 0;
  const parts = HOURS_ALLOCATION.map((s) => {
    const from = acc;
    acc += s.pct;
    return `${s.color} ${from}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(', ')})`;
})();

export default function Reports() {
  const { data: REPORTS, loading } = useFetch(getReports, FALLBACK, []);

  return (
    <>
      <Seo title="Lab Reports" description="Engineering metrics, sprint reviews, audits and annual reports from the DevLab Collective." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative">
          <span className="eyebrow"><i className="bi bi-bar-chart-fill" /> Transparency</span>
          <h1 className="hero-title mt-3" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)' }}>Lab Reports</h1>
          <p className="hero-lead mt-3">
            We publish our engineering metrics, sprint reviews and audits so that members, partners and sponsors can see how the lab works.
          </p>
          <div className="policy-updated mt-3"><i className="bi bi-clock-history me-1" /> 2026 figures · Last updated: November 1, 2026</div>
        </Reveal>
      </header>

      <section className="pb-0" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="row g-4">
            {REPORT_STATS.map((s, i) => (
              <Reveal className="col-6 col-lg-3" delay={i * 80} key={s.label}>
                <div className="fin-stat-card">
                  <div className="fin-stat-ic"><i className={`bi ${s.icon}`} /></div>
                  <div className="fin-stat-val">{s.val}</div>
                  <div className="fin-stat-label">{s.label}</div>
                  <div className="fin-stat-trend up"><i className="bi bi-arrow-up-right" /> {s.trend}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <Reveal className="allocation-panel">
            <div className="row align-items-center g-5">
              <div className="col-lg-5 text-center">
                <div className="allocation-ring" style={{ background: ring }}>
                  <div className="allocation-ring-label">
                    <span className="big">{HOURS_ALLOCATION[0].pct + HOURS_ALLOCATION[1].pct}%</span>
                    <span className="small">of lab hours go to building and testing</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <span className="eyebrow"><i className="bi bi-pie-chart-fill" /> 2026</span>
                <h2 className="section-title mt-3 mb-4" style={{ fontSize: 'clamp(1.6rem,2.8vw,2.1rem)' }}>Where our lab hours go</h2>
                <ul className="allocation-legend">
                  {HOURS_ALLOCATION.map((s) => (
                    <li key={s.label}>
                      <span className="allocation-dot" style={{ background: s.color }} /> {s.label} <span className="pct">{s.pct}%</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted mt-3 mb-0" style={{ fontSize: '.9rem' }}>
                  Based on time tracked across all project boards during the 2026 academic year.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad pt-0" id="reports">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-file-earmark-bar-graph-fill" /> Documents</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>Reports &amp; publications</h2>
            <p className="section-sub mx-auto mt-2">Annual reports, sprint reviews, our engineering handbook and security audits.</p>
          </Reveal>
          <Reveal>
            {REPORTS.map((r, i) => (
              <div className={`report-row ${i === REPORTS.length - 1 ? 'mb-0' : ''}`} key={r.title}>
                <span className="report-ic"><i className="bi bi-file-earmark-pdf-fill" /></span>
                <div className="report-meta">
                  <div className="report-title">{r.title}</div>
                  <div className="report-sub">{r.sub}</div>
                </div>
                <span className="report-size">{r.size}</span>
                {r.hasFile ? (
                  <a className="btn-report" href={reportDownloadUrl(r.id)} rel="noopener">
                    <i className="bi bi-download" /> Download
                  </a>
                ) : (
                  <span className="btn-report disabled" aria-disabled="true" title="The PDF has not been uploaded yet">
                    <i className="bi bi-hourglass-split" /> Coming soon
                  </span>
                )}
              </div>
            ))}
          </Reveal>
          {loading && <p className="text-center text-muted mt-3" role="status">Loading reports…</p>}
        </div>
      </section>

      <section className="section-pad pt-0">
        <div className="container">
          <Reveal anim="zoom" className="audit-strip">
            <div className="content row align-items-center g-4">
              <div className="col-lg-8">
                <h3 className="font-display fw-bold mb-2" style={{ fontSize: '1.5rem' }}>Reviewed before every release</h3>
                <p className="mb-0" style={{ opacity: 0.92 }}>
                  Every release passes peer code review, automated tests and a dependency security scan. Audit logs are available to sponsors and partners on request.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link to={{ pathname: '/', hash: '#contact' }} className="btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-envelope-fill" /> Request Details
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
