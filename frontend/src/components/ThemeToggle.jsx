import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <i className={`bi ${dark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} />
    </button>
  );
}
