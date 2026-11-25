const initials = (name) =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** Gradient initials avatar. Pass `size` in px. */
export default function Avatar({ name, a = '#1b6fd1', b = '#0f4c9e', size = 44, label }) {
  return (
    <span
      className="avatar"
      style={{ '--s': `${size}px`, '--a': a, '--b': b }}
      role="img"
      aria-label={name || label}
    >
      {label || initials(name)}
    </span>
  );
}
