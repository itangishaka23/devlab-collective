import Art from './Art.jsx';

const ART = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
const ICONS = { 'Web App': 'bi-window-stack', 'Mobile App': 'bi-phone-fill', API: 'bi-hdd-network-fill', Data: 'bi-bar-chart-line-fill', DevOps: 'bi-diagram-3-fill', 'Open Source': 'bi-github' };

const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};
const isHttp = (u) => /^https?:\/\//i.test(u || '');

/** A finished project that is live on the internet. */
export default function HostedCard({ project, index = 0 }) {
  const p = project;
  return (
    <article className="hosted-card">
      <div className="hosted-shot">
        {p.screenshot ? (
          <img src={p.screenshot} alt={`Screenshot of ${p.title}`} loading="lazy" />
        ) : (
          <Art icon={ICONS[p.category] || 'bi-cloud-check-fill'} variant={ART[index % ART.length]} />
        )}
        <span className="hosted-live"><span className="dot" /> Live</span>
        {p.featured && <span className="hosted-featured"><i className="bi bi-star-fill" /> Featured</span>}
      </div>
      <div className="hosted-body">
        <div className="hosted-meta">
          <span className="hosted-cat">{p.category}</span>
          {p.launched && <span><i className="bi bi-rocket-takeoff" /> {p.launched}</span>}
        </div>
        <h3>{p.title}</h3>
        <p className="text-muted">{p.summary}</p>
        <div className="tech-chips mb-3">{p.tech.map((t) => <span className="tech-chip" key={t}>{t}</span>)}</div>
        <div className="hosted-actions">
          {isHttp(p.url) && (
            <a className="btn-hw-primary" href={p.url} target="_blank" rel="noopener noreferrer">
              Visit live site <i className="bi bi-box-arrow-up-right" />
            </a>
          )}
          {isHttp(p.repo) && (
            <a className="btn-hw-outline" href={p.repo} target="_blank" rel="noopener noreferrer">
              <i className="bi bi-github" /> Source
            </a>
          )}
        </div>
        {isHttp(p.url) && <div className="hosted-host"><i className="bi bi-link-45deg" /> {hostOf(p.url)}</div>}
      </div>
    </article>
  );
}
