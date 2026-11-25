import { useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import Counter from '../components/Counter.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Avatar from '../components/Avatar.jsx';
import Art from '../components/Art.jsx';
import Stars from '../components/Stars.jsx';
import Modal from '../components/Modal.jsx';
import TeamPhoto from '../components/TeamPhoto.jsx';
import CodeWindow from '../components/CodeWindow.jsx';
import ContactForm from '../components/ContactForm.jsx';
import JoinProjectModal from '../components/JoinProjectModal.jsx';
import useFetch from '../hooks/useFetch.js';
import { getProjects } from '../api/services.js';
import logoIcon from '../assets/logo-icon.png';
import { PROJECTS as FALLBACK_PROJECTS, PRACTICES, STEPS } from '../data/projects.js';
import { TEAM as FALLBACK_TEAM, TESTIMONIALS, HERO_AVATARS } from '../data/team.js';
import GalleryGrid from '../components/GalleryGrid.jsx';
import Seo from '../components/Seo.jsx';
import HostedCard from '../components/HostedCard.jsx';
import { getEvents, getGallery, getHostedProjects, getTeam } from '../api/services.js';
import { formatEventTime, parseSqlDate } from '../utils/format.js';
import { SITE } from '../data/site.js';

const STATS = [
  { target: 2, suffix: '+', label: 'Projects Shipped' },
  { target: 4, suffix: '+', label: 'Commits Merged' },
  { target: 3, suffix: '+', label: 'Active Members' },
  { target: 3, suffix: '+', label: 'Pull Requests Reviewed' },
];

const ABOUT_POINTS = [
  { icon: 'bi-people-fill', title: 'Team-based learning', text: 'Work in cross-functional squads, the way real engineering teams do.' },
  { icon: 'bi-patch-check-fill', title: 'Industry mentors', text: 'Engineers from local companies review designs, code and career plans.' },
  { icon: 'bi-github', title: 'Open by default', text: 'Everything we build is public, documented and reusable.' },
];

export default function Home() {
  const [storyOpen, setStoryOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [joined, setJoined] = useState({});
  const [joining, setJoining] = useState(null); // project currently shown in the join modal
  const { data: PROJECTS, loading: projectsLoading } = useFetch(getProjects, FALLBACK_PROJECTS, []);
  const { data: TEAM } = useFetch(getTeam, FALLBACK_TEAM, []);
  const { data: upcoming } = useFetch(() => getEvents('upcoming'), [], []);
  const { data: gallery } = useFetch(getGallery, [], []);
  const { data: hosted } = useFetch(() => getHostedProjects(3), [], []);

  // Testimonials: 3 per slide
  const perSlide = 3;
  const slides = Array.from({ length: Math.ceil(TESTIMONIALS.length / perSlide) }, (_, i) =>
    TESTIMONIALS.slice(i * perSlide, i * perSlide + perSlide)
  );

  return (
    <>
      <Seo path="/" />
      {/* HERO */}
      <header className="hero" id="home">
        <div className="hero-glow" />
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <Reveal anim="right" className="col-lg-6">
              <span className="eyebrow"><i className="bi bi-stars" /> Software Engineering Lab</span>
              <h1 className="hero-title mt-4">
                Learn software engineering by{' '}
                <span className="accent-underline">
                  shipping
                  <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 10 Q 50 2 100 8 T 198 6" stroke="#1fa88c" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                real products.
              </h1>
              <p className="hero-lead mt-4">
                DevLab Collective is a hands-on lab where students and mentors plan sprints, review each other’s code,
                automate testing and deploy software that real people use.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/join" className="btn-hw-primary">
                  Join the Lab <i className="bi bi-arrow-right" />
                </Link>
                <button type="button" className="btn-hw-outline" onClick={() => setStoryOpen(true)}>
                  <i className="bi bi-play-circle" /> Take a Lab Tour
                </button>
              </div>
              <div className="d-flex align-items-center gap-3 mt-5">
                <div className="hero-avatars">
                  {HERO_AVATARS.map((h) => (
                    <Avatar key={h.i} name={h.i} label={h.i} a={h.a} b={h.b} size={38} />
                  ))}
                </div>
                <div>
                  <div className="fw-bold font-display" style={{ fontSize: '.9rem' }}>3+ lab members</div>
                  <div className="text-muted" style={{ fontSize: '.8rem' }}>building together every week</div>
                </div>
              </div>
            </Reveal>

            <Reveal anim="left" delay={3} className="col-lg-6">
              <div className="hero-media">
                <div className="hero-media-frame code-frame">
                  <img src={logoIcon} alt="" className="frame-watermark" />
                  <CodeWindow />
                </div>
                <div className="float-card float-card-1">
                  <span className="fc-icon"><i className="bi bi-check2-circle" /></span>
                  <div><div className="fc-val">482</div><div className="fc-label">Builds passed this term</div></div>
                </div>
                <div className="float-card float-card-2">
                  <span className="fc-icon"><i className="bi bi-shield-check" /></span>
                  <div><div className="fc-val">87%</div><div className="fc-label">Avg. test coverage</div></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="section-pad pt-0" id="impact">
        <div className="container">
          <Reveal anim="zoom" className="stats-band">
            <div className="row g-0">
              {STATS.map((s) => (
                <div className="col-6 col-md-3 stat-item" key={s.label}>
                  <div className="stat-num"><Counter target={s.target} />{s.suffix}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section-pad" id="about">
        <div className="container contact-card about-card">
          <div className="row align-items-center g-5">
            <Reveal anim="right" className="col-lg-6">
              <div className="about-collage">
                <div className="about-badge">
                  <div className="ab-ring"><span>2023</span></div>
                  <div>
                    <div className="fw-bold font-display" style={{ fontSize: '.9rem' }}>Building Since</div>
                    <div className="text-muted" style={{ fontSize: '.78rem' }}>2023 &middot; 5 engineering tracks</div>
                  </div>
                </div>
                <div className="img-a">
                  <div className="panel-git">
                    <div className="pg-title"><i className="bi bi-git" /> git log --graph</div>
                    <svg viewBox="0 0 320 190" className="pg-graph" aria-hidden="true">
                      <path d="M30 20 V170" stroke="#1b6fd1" strokeWidth="3" />
                      <path d="M30 60 C 30 90, 90 70, 90 100 V130 C 90 150, 30 140, 30 150" stroke="#1fa88c" strokeWidth="3" fill="none" />
                      <circle cx="30" cy="20" r="7" fill="#1b6fd1" />
                      <circle cx="30" cy="60" r="7" fill="#1b6fd1" />
                      <circle cx="90" cy="100" r="7" fill="#1fa88c" />
                      <circle cx="90" cy="130" r="7" fill="#1fa88c" />
                      <circle cx="30" cy="150" r="7" fill="#1b6fd1" />
                      <circle cx="30" cy="170" r="7" fill="#1b6fd1" />
                      <g fontFamily="JetBrains Mono, monospace" fontSize="12" fill="currentColor">
                        <text x="115" y="24">merge: release v0.8</text>
                        <text x="115" y="64">fix: handle empty state</text>
                        <text x="115" y="104" fill="#1fa88c">feat: room booking API</text>
                        <text x="115" y="134" fill="#1fa88c">test: add e2e checkout</text>
                        <text x="115" y="154">docs: update README</text>
                        <text x="115" y="174">init: project scaffold</text>
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="img-b">
                  <div className="panel-review">
                    <div className="pr-head"><i className="bi bi-eye-fill" /> Code review</div>
                    <div className="pr-line"><i className="bi bi-check-circle-fill" /> Tests passing</div>
                    <div className="pr-line"><i className="bi bi-check-circle-fill" /> 2 approvals</div>
                    <div className="pr-merge">Merge pull request</div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal anim="left" className="col-lg-6">
              <span className="eyebrow"><i className="bi bi-flag-fill" /> Our Story</span>
              <h2 className="section-title mt-3 mb-3" style={{ fontSize: 'clamp(1.7rem,3vw,2.4rem)' }}>
                Great engineers are built in teams, not tutorials.
              </h2>
              <p className="section-sub">
                {SITE.name} started as a weekend study group and grew into a full software engineering lab. We
                combine agile practice, honest code review and real stakeholders, so that every member graduates with a
                portfolio of shipped work.
              </p>
              <ul className="about-list mt-3">
                {ABOUT_POINTS.map((p) => (
                  <li key={p.title}>
                    <span className="ic"><i className={`bi ${p.icon}`} /></span>
                    <div><strong>{p.title}</strong><div className="text-muted small">{p.text}</div></div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section-pad bg-white" id="projects">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-braces" /> Active Projects</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>What we’re building</h2>
            <p className="section-sub mx-auto mt-2">
              Every project has a roadmap, a test suite and a mentor. Join one that matches your interests.
            </p>
          </Reveal>
          {projectsLoading && <p className="text-center text-muted" role="status">Loading projects…</p>}
          <div className="row g-4">
            {PROJECTS.map((p, i) => (
              <Reveal className="col-md-6 col-lg-4" delay={(i % 3) * 100} key={p.id}>
                <div className="cause-card">
                  <div className="cause-img">
                    <Art icon={p.icon} variant={p.art} />
                    <span className="cause-tag">{p.tag}</span>
                    <span className="status-pill">{p.status}</span>
                  </div>
                  <div className="cause-body">
                    <h5 className="font-display fw-bold">{p.title}</h5>
                    <p className="text-muted small mb-2">{p.blurb}</p>
                    <div className="tech-chips">
                      {p.stack.map((s) => <span className="tech-chip" key={s}>{s}</span>)}
                    </div>
                    <ProgressBar value={p.progress} />
                    <div className="cause-meta">
                      <span className="raised">{p.progress}% complete</span>
                      <span className="goal">{p.milestone}</span>
                    </div>
                    <Link className="cause-details" to={`/projects/${p.slug || p.id}`}>
                      View details <i className="bi bi-arrow-right" />
                    </Link>
                    <button
                      type="button"
                      className="cause-donate"
                      disabled={joined[p.id]}
                      onClick={() => setJoining(p)}
                    >
                      {joined[p.id] ? (<><i className="bi bi-check2" /> Interest noted</>) : 'Join this project'}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTED PROJECTS */}
      <section className="section-pad" id="hosted">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-cloud-check-fill" /> Shipped &amp; live</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>Hosted projects</h2>
            <p className="section-sub mx-auto mt-2">Finished projects, running on the internet right now. Open one and try it.</p>
          </Reveal>
          {hosted.length === 0 ? (
            <p className="text-center text-muted">Our first hosted projects are coming soon.</p>
          ) : (
            <div className="row g-4">
              {hosted.map((p, i) => (
                <Reveal className="col-md-6 col-lg-4" delay={i * 100} key={p.id}><HostedCard project={p} index={i} /></Reveal>
              ))}
            </div>
          )}
          <div className="text-center mt-4"><Link to="/hosted" className="btn-hw-outline">See all hosted projects <i className="bi bi-arrow-right" /></Link></div>
        </div>
      </section>

      {/* PRACTICES */}
      <section className="section-pad" id="practices" style={{ background: 'var(--clr-bg)' }}>
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-award-fill" /> Lab Practices</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>
              Professional habits from day one
            </h2>
          </Reveal>
          <div className="row g-4">
            {PRACTICES.map((p, i) => (
              <Reveal className="col-md-6 col-lg-4" delay={(i % 3) * 80} key={p.title}>
                <div className="why-card">
                  <div className="why-ic"><i className={`bi ${p.icon}`} /></div>
                  <h5 className="font-display fw-bold">{p.title}</h5>
                  <p className="text-muted mb-0">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad bg-white" id="how">
        <div className="container contact-card">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-signpost-split-fill" /> Our Workflow</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>From idea to release</h2>
          </Reveal>
          <div className="hiw-wrap">
            <div className="hiw-line" />
            <div className="row g-4">
              {STEPS.map((s, i) => (
                <Reveal className="col-md-4 hiw-step" delay={i * 120} key={s.n}>
                  <div className="hiw-num">{s.n}</div>
                  <h5 className="font-display fw-bold">{s.title}</h5>
                  <p className="text-muted">{s.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="section-pad bg-white" id="events">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-calendar-event-fill" /> What’s On</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>Upcoming events</h2>
            <p className="section-sub mx-auto mt-2">Workshops, hack nights and demo days — free, and beginners are welcome.</p>
          </Reveal>
          {upcoming.length === 0 ? (
            <p className="text-center text-muted">No events scheduled right now. <Link to="/events">See past events</Link>.</p>
          ) : (
            <div className="row g-4">
              {upcoming.slice(0, 3).map((ev, i) => {
                const d = parseSqlDate(ev.starts_at);
                return (
                  <Reveal className="col-md-4" delay={i * 100} key={ev.id}>
                    <Link to="/events" className="event-mini text-decoration-none">
                      <div className="event-date" aria-hidden="true">
                        <span className="m">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="d">{d.getDate()}</span>
                      </div>
                      <div>
                        <span className="event-type"><i className={`bi ${ev.icon}`} /> {ev.type}</span>
                        <h3>{ev.title}</h3>
                        <div className="small text-muted"><i className="bi bi-clock" /> {formatEventTime(ev.starts_at)} · {ev.location}</div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
          <div className="text-center mt-4"><Link to="/events" className="btn-hw-outline">View all events <i className="bi bi-arrow-right" /></Link></div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section-pad" id="team">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-people-fill" /> Our People</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>The engineers behind the lab</h2>
          </Reveal>
          <div className="row g-4 justify-content-center">
            {TEAM.map((m, i) => (
              <Reveal className="col-6 col-md-3" delay={i * 80} key={m.name}>
                <div className="vol-card">
                  <div className="vol-img">
                    <TeamPhoto member={m} />
                  </div>
                  <div className="vol-overlay">
                    <div className="fw-bold font-display">{m.name}</div>
                    <div className="small opacity-75">{m.role}</div>
                    <div className="vol-social">
                      {(m.github ?? '#') && <a href={m.github || '#'} aria-label={`${m.name} on GitHub`} target="_blank" rel="noopener noreferrer"><i className="bi bi-github" /></a>}
                      {(m.x ?? '#') && <a href={m.x || '#'} aria-label={`${m.name} on X`} target="_blank" rel="noopener noreferrer"><i className="bi bi-twitter-x" /></a>}
                      {(m.linkedin ?? '#') && <a href={m.linkedin || '#'} aria-label={`${m.name} on LinkedIn`} target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin" /></a>}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-pad bg-white" id="gallery">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-images" /> Life in the lab</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>Moments from the lab</h2>
          </Reveal>
          <GalleryGrid images={gallery} limit={6} />
          <div className="text-center mt-4"><Link to="/gallery" className="btn-hw-outline">Open the gallery <i className="bi bi-arrow-right" /></Link></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad bg-white" id="testimonials">
        <div className="container">
          <Reveal anim="zoom" className="testi-section p-4 p-md-5">
            <div className="text-center mx-auto mb-5" style={{ maxWidth: 600 }}>
              <span className="eyebrow" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
                <i className="bi bi-chat-quote-fill" /> Member Voices
              </span>
              <h2 className="section-title mt-3 text-white" style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)' }}>
                Stories from our engineering community
              </h2>
            </div>
            <div className="testi-slider">
              <div className="row g-4 justify-content-center" key={slide}>
                {slides[slide].map((t) => (
                  <div className="col-md-6 col-lg-4 testi-fade" key={t.name}>
                    <div className="testi-card">
                      <Stars value={t.stars} />
                      <p className="testi-quote">“{t.quote}”</p>
                      <div className="testi-person">
                        <Avatar name={t.name} a={t.a} b={t.b} size={50} />
                        <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="testi-dots">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === slide ? 'active' : ''}
                    aria-label={`Show testimonials page ${i + 1}`}
                    aria-current={i === slide}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad" id="cta">
        <div className="container">
          <Reveal anim="zoom" className="cta-banner">
            <i className="bi bi-code-slash" style={{ fontSize: '2.4rem' }} />
            <h2 className="mt-3">Your next commit starts here.</h2>
            <p className="mb-4" style={{ opacity: 0.92 }}>
              Apply to join a squad, propose a project, or partner with us as a mentor.
            </p>
            <Link className="btn-cta" to="/join">
              <i className="bi bi-rocket-takeoff-fill me-2" />Join the Lab
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section className="section-pad bg-white" id="contact">
        <div className="container">
          <Reveal className="text-center mx-auto mb-5" style={{ maxWidth: 640 }}>
            <span className="eyebrow"><i className="bi bi-envelope-fill" /> Get In Touch</span>
            <h2 className="section-title mt-3" style={{ fontSize: 'clamp(1.8rem,3.2vw,2.5rem)' }}>We’d love to hear from you</h2>
          </Reveal>
          <div className="row g-5">
            <Reveal anim="right" className="col-lg-5 contact-card">
              <div className="contact-info-item"><span className="ic"><i className="bi bi-geo-alt-fill" /></span><div><strong>Our Lab</strong><div className="text-muted small">{SITE.address}</div></div></div>
              <div className="contact-info-item"><span className="ic"><i className="bi bi-envelope-fill" /></span><div><strong>Email Us</strong><div className="text-muted small"><a className="contact-link" href={`mailto:${SITE.email}`}>{SITE.email}</a></div></div></div>
              <div className="contact-info-item"><span className="ic"><i className="bi bi-telephone-fill" /></span><div><strong>Call Us</strong><div className="text-muted small"><a className="contact-link" href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a></div></div></div>
              <iframe
                className="map-embed"
                title={`Map of ${SITE.address}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
            <Reveal anim="left" className="col-lg-7">
              <div className="contact-card"><ContactForm /></div>
            </Reveal>
          </div>
        </div>
      </section>

      <JoinProjectModal
        project={joining}
        onClose={() => setJoining(null)}
        onJoined={(id) => setJoined((j) => ({ ...j, [id]: true }))}
      />

      <Modal open={storyOpen} onClose={() => setStoryOpen(false)} title="Take a Lab Tour">
        <div className="ratio ratio-16x9 rounded-4 overflow-hidden tour-placeholder">
          <div className="d-flex flex-column align-items-center justify-content-center text-white">
            <img src={logoIcon} alt="" style={{ width: 84 }} />
            <div className="mt-3 font-display fw-bold">DevLab Collective</div>
          </div>
        </div>
        <p className="text-muted mt-3 mb-0">Video placeholder — embed your hosted lab-tour video here.</p>
      </Modal>
    </>
  );
}
