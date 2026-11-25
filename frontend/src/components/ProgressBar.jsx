import useInView from '../hooks/useInView.js';

export default function ProgressBar({ value }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div className="cause-progress-track" ref={ref} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="cause-progress-fill" style={{ width: inView ? `${value}%` : 0 }} />
    </div>
  );
}
