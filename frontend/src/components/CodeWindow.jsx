/** Decorative code editor panel for the hero section. */
const LINES = [
  [['c', '// lab/sprint.ts']],
  [['k', 'const '], ['v', 'sprint'], ['p', ' = '], ['k', 'new '], ['f', 'Sprint'], ['p', '({ weeks: '], ['n', '2'], ['p', ' });']],
  [['v', 'sprint'], ['p', '.'], ['f', 'plan'], ['p', '(userStories);']],
  [['k', 'await '], ['v', 'team'], ['p', '.'], ['f', 'build'], ['p', '({']],
  [['p', '  review: '], ['s', "'required'"], ['p', ',']],
  [['p', '  tests: '], ['s', "'green'"], ['p', ',']],
  [['p', '});']],
  [['v', 'pipeline'], ['p', '.'], ['f', 'deploy'], ['p', '('], ['s', "'production'"], ['p', ');']],
  [['c', '// ✓ shipped — retro on Friday']],
];

const PIPELINE = [
  { label: 'Plan', done: true },
  { label: 'Build', done: true },
  { label: 'Test', done: true },
  { label: 'Deploy', done: false },
];

export default function CodeWindow() {
  return (
    <div className="code-window">
      <div className="cw-bar">
        <span className="cw-dot" style={{ background: '#ff5f57' }} />
        <span className="cw-dot" style={{ background: '#febc2e' }} />
        <span className="cw-dot" style={{ background: '#28c840' }} />
        <span className="cw-tab">sprint.ts</span>
      </div>
      <pre className="cw-body" aria-label="Example sprint code">
        {LINES.map((line, i) => (
          <div className="cw-line" key={i}>
            <span className="cw-num">{i + 1}</span>
            <span>
              {line.map(([cls, text], j) => (
                <span key={j} className={`tok-${cls}`}>{text}</span>
              ))}
              {i === LINES.length - 1 && <span className="cw-cursor" />}
            </span>
          </div>
        ))}
      </pre>
      <div className="cw-pipeline">
        {PIPELINE.map((s) => (
          <span key={s.label} className={`cw-step ${s.done ? 'done' : 'running'}`}>
            <i className={`bi ${s.done ? 'bi-check-circle-fill' : 'bi-arrow-repeat'}`} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
