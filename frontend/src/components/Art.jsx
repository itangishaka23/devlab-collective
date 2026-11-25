/** Gradient cover art with a large icon — used instead of stock photos. */
export default function Art({ icon, variant = 'a1', className = '' }) {
  return (
    <div className={`art art-${variant} ${className}`.trim()} aria-hidden="true">
      <i className={`bi ${icon}`} />
    </div>
  );
}
