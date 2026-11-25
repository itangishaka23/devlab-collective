import { getGallery } from '../api/services.js';
import GalleryGrid from '../components/GalleryGrid.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import useFetch from '../hooks/useFetch.js';

export default function Gallery() {
  const { data, loading } = useFetch(getGallery, [], []);
  return (
    <>
      <Seo title="Gallery" description="Photos from DevLab Collective workshops, hack nights and demo days." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative text-center">
          <span className="eyebrow"><i className="bi bi-images" /> Life in the lab</span>
          <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)' }}>Gallery</h1>
          <p className="hero-lead mt-3 mx-auto text-center">Demo days, hack nights and the everyday work of building software together.</p>
        </Reveal>
      </header>
      <section className="section-pad pt-4">
        <div className="container">
          {loading && <p className="text-center text-muted" role="status">Loading photos…</p>}
          {!loading && <GalleryGrid images={data} />}
        </div>
      </section>
    </>
  );
}
