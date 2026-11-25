export default function Stars({ value = 5 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="testi-stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: full }, (_, i) => <i key={i} className="bi bi-star-fill" />)}
      {half && <i className="bi bi-star-half" />}
    </div>
  );
}
