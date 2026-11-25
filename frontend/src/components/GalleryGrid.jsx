import { useState } from 'react';
import Art from './Art.jsx';
import Lightbox from './Lightbox.jsx';

// Shown until real photos are uploaded in the admin dashboard.
export const GALLERY_PLACEHOLDERS = [
  { id: 'p1', title: 'Demo Day', icon: 'bi-rocket-takeoff-fill', art: 'a3' },
  { id: 'p2', title: 'Pair programming', icon: 'bi-people-fill', art: 'a1' },
  { id: 'p3', title: 'Code review', icon: 'bi-eye-fill', art: 'a2' },
  { id: 'p4', title: 'Hack night', icon: 'bi-lightning-charge-fill', art: 'a4' },
  { id: 'p5', title: 'Workshop', icon: 'bi-easel2-fill', art: 'a5' },
  { id: 'p6', title: 'Retrospective', icon: 'bi-chat-square-text-fill', art: 'a6' },
];

export default function GalleryGrid({ images, limit }) {
  const [open, setOpen] = useState(null);
  const real = images.filter((i) => i.url);
  const tiles = (real.length ? real : GALLERY_PLACEHOLDERS).slice(0, limit || undefined);

  return (
    <>
      <div className="gallery-grid">
        {tiles.map((img, i) =>
          img.url ? (
            <button key={img.id} type="button" className="gallery-tile" onClick={() => setOpen(i)} aria-label={`Open photo: ${img.title}`}>
              <img src={img.url} alt={img.title} loading="lazy" />
              <span className="gt-cap">{img.title}</span>
            </button>
          ) : (
            <div key={img.id} className="gallery-tile placeholder">
              <Art icon={img.icon} variant={img.art} />
              <span className="gt-cap">{img.title}</span>
            </div>
          )
        )}
      </div>
      {!real.length && <p className="text-center text-muted small mt-3 mb-0">Sample tiles — real lab photos appear here once they are uploaded.</p>}
      <Lightbox images={tiles.filter((t) => t.url)} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
