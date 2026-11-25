import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const TTL_MS = 10 * 60 * 1000;
const cache = new Map(); // repo -> { at, data }

const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'devlab-collective',
      ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 404) throw new AppError('GitHub repository not found.', 404);
  if (res.status === 403 || res.status === 429) throw new AppError('GitHub rate limit reached. Try again later.', 503);
  if (!res.ok) throw new AppError('Could not load GitHub data.', 502);
  return res.json();
}

/** Live repository stats, cached for 10 minutes. */
export async function getRepoStats(repo) {
  if (!repo || !REPO_RE.test(repo)) throw new AppError('This project has no GitHub repository linked.', 404);

  const hit = cache.get(repo);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const [info, contributors] = await Promise.all([
    gh(`/repos/${repo}`),
    gh(`/repos/${repo}/contributors?per_page=6`).catch(() => []),
  ]);

  const data = {
    repo,
    url: info.html_url,
    stars: info.stargazers_count,
    forks: info.forks_count,
    openIssues: info.open_issues_count,
    watchers: info.subscribers_count ?? info.watchers_count,
    language: info.language,
    license: info.license?.spdx_id || null,
    pushedAt: info.pushed_at,
    contributors: Array.isArray(contributors)
      ? contributors.map((c) => ({ login: c.login, avatar: c.avatar_url, url: c.html_url, contributions: c.contributions }))
      : [],
  };
  cache.set(repo, { at: Date.now(), data });
  return data;
}
