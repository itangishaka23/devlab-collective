/** Page buttons styled by .pagination-hw. */
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const numbers = [];
  for (let p = 1; p <= pages; p += 1) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) numbers.push(p);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }

  const go = (e, p) => {
    e.preventDefault();
    if (p >= 1 && p <= pages && p !== page) onChange(p);
  };

  return (
    <nav className="pagination-hw" aria-label="Pagination">
      <a href="#prev" className={page === 1 ? 'disabled' : ''} aria-disabled={page === 1} aria-label="Previous page" onClick={(e) => go(e, page - 1)}>
        <i className="bi bi-chevron-left" />
      </a>
      {numbers.map((n, i) =>
        n === '…' ? (
          <span key={`gap${i}`} className="pg-gap">…</span>
        ) : (
          <a key={n} href={`#page-${n}`} className={n === page ? 'active' : ''} aria-current={n === page ? 'page' : undefined} onClick={(e) => go(e, n)}>
            {n}
          </a>
        )
      )}
      <a href="#next" className={page === pages ? 'disabled' : ''} aria-disabled={page === pages} aria-label="Next page" onClick={(e) => go(e, page + 1)}>
        <i className="bi bi-chevron-right" />
      </a>
    </nav>
  );
}
