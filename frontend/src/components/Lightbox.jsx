import { useEffect } from 'react';

/** Full-screen image viewer with keyboard support (←, →, Esc). */
export default function Lightbox({ images, index, onClose, onIndex }) {
  const open = index !== null && index !== undefined && images[index];

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, index, images.length, onClose, onIndex]);

  if (!open) return null;
  const img = images[index];
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={img.title} onClick={onClose}>
      <button type="button" className="lb-btn lb-close" aria-label="Close" onClick={onClose}><i className="bi bi-x-lg" /></button>
      {images.length > 1 && (
        <>
          <button type="button" className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onIndex((index - 1 + images.length) % images.length); }}>
            <i className="bi bi-chevron-left" />
          </button>
          <button type="button" className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); onIndex((index + 1) % images.length); }}>
            <i className="bi bi-chevron-right" />
          </button>
        </>
      )}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={img.url} alt={img.title} />
        <figcaption>
          <strong>{img.title}</strong>
          {img.caption && <span> — {img.caption}</span>}
        </figcaption>
      </figure>
    </div>
  );
}
