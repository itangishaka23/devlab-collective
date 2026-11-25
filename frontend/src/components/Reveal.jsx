import useInView from '../hooks/useInView.js';

/** Scroll-reveal wrapper (replaces AOS). anim: up | left | right | zoom */
export default function Reveal({ as: Tag = 'div', anim = 'up', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView({ threshold: 0.12 });
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${anim} ${inView ? 'in' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
