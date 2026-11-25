/** Label + control + error message wrapper for forms. */
export default function Field({ label, id, error, hint, className = 'mb-3', children }) {
  return (
    <div className={className}>
      {label && <label className="form-label small fw-semibold" htmlFor={id}>{label}</label>}
      {children}
      {hint && !error && <div className="form-text">{hint}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export const inputClass = (error) => `form-control form-control-hw ${error ? 'is-invalid' : ''}`.trim();
