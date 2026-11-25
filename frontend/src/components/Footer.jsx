import { Link } from 'react-router-dom';
import logoIcon from '../assets/logo-icon.png';
import useSubscribe from '../hooks/useSubscribe.js';
import { FOOTER_LINKS, FOOTER_TRACKS, SITE } from '../data/site.js';

const Caret = () => <i className="bi bi-caret-right-fill" />;

export default function Footer() {
  const nl = useSubscribe('footer');
  return (
    <footer className="footer-hw">
      <svg className="footer-wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#0a1f44" d="M0,32 C240,70 480,0 720,18 C960,36 1200,70 1440,26 L1440,70 L0,70 Z" />
      </svg>
      <span className="footer-glow" />
      <span className="footer-glow-2" />
      <div className="container footer-top">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <Link className="hw-logo text-white footer-brand" to="/">
              <img src={logoIcon} alt="" className="footer-logo-icon" />
              <span>
                <span className="fb-1">DEVLAB</span>
                <span className="fb-2">COLLECTIVE</span>
              </span>
            </Link>
            <p className="mt-3">
              A software engineering lab where students and mentors design, build, test and ship real software together —
              with agile practice, code review and open source at the core.
            </p>
            <div className="footer-social mt-3">
              <a href="#" aria-label="GitHub"><i className="bi bi-github" /></a>
              <a href="#" aria-label="X"><i className="bi bi-twitter-x" /></a>
              <a href="#" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>
              <a href="#" aria-label="Discord"><i className="bi bi-discord" /></a>
              <a href="#" aria-label="YouTube"><i className="bi bi-youtube" /></a>
            </div>
            <div className="footer-badges">
              <span className="footer-badge"><i className="bi bi-github" /> Open Source · MIT</span>
              <span className="footer-badge"><i className="bi bi-check2-circle" /> CI Passing</span>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6>Quick Links</h6>
            <ul>
              {FOOTER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link className="footer-link" to={l.to || { pathname: '/', hash: `#${l.hash}` }}><Caret />{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6>Tracks</h6>
            <ul>
              {FOOTER_TRACKS.map((t) => (
                <li key={t}>
                  <Link className="footer-link" to={{ pathname: '/', hash: '#projects' }}><Caret />{t}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-6 col-lg-4">
            <h6>Get In Touch</h6>
            <div className="footer-contact-item"><span className="ic"><i className="bi bi-geo-alt-fill" /></span><span>{SITE.address}</span></div>
            <div className="footer-contact-item"><span className="ic"><i className="bi bi-envelope-fill" /></span><a className="footer-contact-link" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
            <div className="footer-contact-item"><span className="ic"><i className="bi bi-telephone-fill" /></span><a className="footer-contact-link" href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a></div>
            <h6 className="mt-4">Newsletter</h6>
            <form className="newsletter-input" onSubmit={nl.submit}>
              <input type="email" required placeholder="Your email address" aria-label="Email for newsletter" value={nl.email} onChange={(e) => nl.setEmail(e.target.value)} />
              <button type="submit" aria-label="Subscribe" disabled={nl.status === 'loading'}><i className="bi bi-arrow-right" /></button>
            </form>
            <div className="newsletter-note" role="status" aria-live="polite">
              {nl.status === 'success' || nl.status === 'error' ? (
                <><i className={`bi ${nl.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} /> {nl.message}</>
              ) : (
                <><i className="bi bi-shield-check" /> No spam. Unsubscribe anytime.</>
              )}
            </div>
          </div>
        </div>

        <div className="footer-divider" />
        <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div>&copy; {SITE.year} DevLab Collective. All rights reserved.</div>
            <div className="footer-bottom-links mt-2">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Use</Link>
              <Link to="/reports">Lab Reports</Link>
              <Link to="/faq">FAQs</Link>
            </div>
          </div>
          <div className="text-md-end">
            <div>Built with <i className="bi bi-code-slash text-primary-hw" /> and <i className="bi bi-cup-hot-fill text-primary-hw" /> by the collective</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
