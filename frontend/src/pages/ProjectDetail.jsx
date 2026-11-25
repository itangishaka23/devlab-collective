import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject, getProjects } from '../api/services.js';
import Art from '../components/Art.jsx';
import GithubStats from '../components/GithubStats.jsx';
import JoinProjectModal from '../components/JoinProjectModal.jsx';
import Markdown from '../components/Markdown.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import useFetch from '../hooks/useFetch.js';
import { PROJECTS as LOCAL } from '../data/projects.js';
import NotFound from './NotFound.jsx';

const localProject = (slug) => {
  const p = LOCAL.find((x) => x.id === slug);
  return p ? { ...p, id: p.id, slug: p.id, description: '', roadmap: [], lead: '', github_repo: '', demo_url: '' } : null;
};

// Remount per project so state never leaks between pages.
export default function ProjectDetailRoute() {
  const { slug } = useParams();
  return <ProjectDetail key={slug} slug={slug} />;
}

function ProjectDetail({ slug }) {
  const [joining, setJoining] = useState(null);
  const [joined, setJoined] = useState(false);
  const { data: project, loading, error } = useFetch(() => getProject(slug), localProject(slug), [slug]);
  const { data: all } = useFetch(getProjects, LOCAL.map((p) => ({ ...p, slug: p.id })), []);

  if (loading) return <section className="section-pad text-center text-muted" role="status">Loading project…</section>;
  if (!project || error?.status === 404) return <NotFound />;

  const done = (project.roadmap || []).filter((r) => r.done).length;
  const others = all.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <Seo title={project.title} description={project.blurb} path={`/projects/${project.slug}`} />
      <header className="project-hero">
        <Art icon={project.icon} variant={project.art} className="art-fill" />
        <div className="container position-relative">
          <Link to="/#projects" className="post-back text-white"><i className="bi bi-arrow-left" /> All projects</Link>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <span className="event-badge light">{project.tag}</span>
            <span className="event-badge light">{project.status}</span>
          </div>
          <h1>{project.title}</h1>
          <p className="lead">{project.blurb}</p>
        </div>
      </header>

      <section className="section-pad">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <Reveal className="account-card">
                <h2><i className="bi bi-info-circle-fill" /> About this project</h2>
                {project.description ? <Markdown>{project.description}</Markdown> : <p className="text-muted mb-0">{project.blurb}</p>}
              </Reveal>

              {project.roadmap?.length > 0 && (
                <Reveal className="account-card">
                  <h2><i className="bi bi-signpost-split-fill" /> Roadmap <small className="text-muted">({done}/{project.roadmap.length} done)</small></h2>
                  <ol className="roadmap">
                    {project.roadmap.map((r, i) => (
                      <li key={i} className={r.done ? 'done' : ''}>
                        <span className="rm-dot">{r.done ? <i className="bi bi-check-lg" /> : i + 1}</span>
                        <span>{r.title}</span>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              )}
            </div>

            <div className="col-lg-4">
              <div className="account-card">
                <h2><i className="bi bi-speedometer2" /> Progress</h2>
                <ProgressBar value={project.progress} />
                <div className="cause-meta"><span className="raised">{project.progress}% complete</span><span className="goal">{project.milestone}</span></div>
                <button type="button" className="btn-hw-primary w-100 justify-content-center mt-3" disabled={joined} onClick={() => setJoining(project)}>
                  {joined ? (<><i className="bi bi-check2" /> Interest noted</>) : 'Join this project'}
                </button>
                {project.demo_url && (
                  <a className="btn-hw-outline w-100 justify-content-center mt-2" href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-box-arrow-up-right" /> Live demo
                  </a>
                )}
              </div>

              <div className="account-card">
                <h2><i className="bi bi-stack" /> Tech stack</h2>
                <div className="tech-chips mt-0">{project.stack.map((s) => <span className="tech-chip" key={s}>{s}</span>)}</div>
                {project.lead && <p className="mt-3 mb-0 small"><span className="text-muted">Project lead:</span> <strong>{project.lead}</strong></p>}
              </div>

              <GithubStats project={project} />
            </div>
          </div>

          {others.length > 0 && (
            <>
              <h2 className="section-title mt-5 mb-3" style={{ fontSize: '1.5rem' }}>More projects</h2>
              <div className="row g-4">
                {others.map((p) => (
                  <div className="col-md-4" key={p.slug}>
                    <Link to={`/projects/${p.slug}`} className="text-decoration-none">
                      <div className="cause-card"><div className="cause-img"><Art icon={p.icon} variant={p.art} /><span className="cause-tag">{p.tag}</span></div>
                        <div className="cause-body"><h5 className="font-display fw-bold">{p.title}</h5><p className="text-muted small mb-0">{p.blurb}</p></div></div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <JoinProjectModal project={joining} onClose={() => setJoining(null)} onJoined={() => setJoined(true)} />
    </>
  );
}
