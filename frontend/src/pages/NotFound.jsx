import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <header className="policy-hero" style={{ minHeight: '60vh' }}>
      <Seo title="Page not found" description="This page could not be found." />
      <div className="hero-glow" />
      <div className="container position-relative text-center">
        <span className="eyebrow"><i className="bi bi-bug-fill" /> Error 404</span>
        <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)' }}>Page not found</h1>
        <p className="hero-lead mt-3 mx-auto text-center">
          This route threw a 404. The page may have moved, or the link might be mistyped.
        </p>
        <Link to="/" className="btn-hw-primary mt-3">Back to home <i className="bi bi-arrow-right" /></Link>
      </div>
    </header>
  );
}
