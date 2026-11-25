import { getProjectGithub } from '../api/services.js';
import useFetch from '../hooks/useFetch.js';

const ago = (iso) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

/** Live GitHub numbers for a project. Hidden when the project has no repo. */
export default function GithubStats({ project }) {
  const { data, loading, error } = useFetch(() => getProjectGithub(project.slug), null, [project.slug]);
  if (!project.github_repo) return null;

  return (
    <div className="gh-card">
      <div className="gh-head">
        <i className="bi bi-github" />
        <a href={`https://github.com/${project.github_repo}`} target="_blank" rel="noopener noreferrer">{project.github_repo}</a>
      </div>
      {loading && <p className="text-muted small mb-0" role="status">Loading live stats…</p>}
      {error && <p className="text-muted small mb-0">Live stats are unavailable right now ({error.message}).</p>}
      {data && (
        <>
          <ul className="gh-stats">
            <li><i className="bi bi-star-fill" /><b>{data.stars}</b><span>stars</span></li>
            <li><i className="bi bi-diagram-2-fill" /><b>{data.forks}</b><span>forks</span></li>
            <li><i className="bi bi-exclamation-circle-fill" /><b>{data.openIssues}</b><span>open issues</span></li>
            {data.language && <li><i className="bi bi-code-slash" /><b>{data.language}</b><span>language</span></li>}
            <li><i className="bi bi-clock-history" /><b>{ago(data.pushedAt)}</b><span>last push</span></li>
          </ul>
          {data.contributors.length > 0 && (
            <div className="gh-contrib">
              <span className="small text-muted me-2">Top contributors</span>
              {data.contributors.map((c) => (
                <a key={c.login} href={c.url} target="_blank" rel="noopener noreferrer" title={`${c.login} · ${c.contributions} commits`}>
                  <img src={c.avatar} alt={c.login} width="32" height="32" loading="lazy" />
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
