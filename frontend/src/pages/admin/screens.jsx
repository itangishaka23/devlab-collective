import { adminGet, adminSend } from '../../api/admin.js';
import { formatDateTime, toInputDateTime } from '../../utils/format.js';
import { POST_CATEGORIES } from '../../data/posts.js';
import { FAQ_CATEGORIES } from '../../data/faqs.js';
import ResourceManager from './ResourceManager.jsx';

// ---------- small helpers ----------
const ART = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
const csv = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
const clip = (s, n = 70) => (String(s).length > n ? `${String(s).slice(0, n)}…` : String(s));
const when = (s) => (s ? String(s).slice(0, 16).replace('T', ' ') : '');

const STATUS_COLORS = { new: 'info', read: 'secondary', archived: 'dark', pending: 'warning', approved: 'success', rejected: 'danger' };
const Badge = ({ value }) => <span className={`badge text-bg-${STATUS_COLORS[value] || 'secondary'}`}>{value}</span>;

const Detail = ({ rows, text }) => (
  <>
    <dl className="detail-list">
      {rows.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>))}
    </dl>
    {text && <p className="detail-text">{text}</p>}
  </>
);

/** "[x] Done item" / "[ ] Todo item" lines ⇄ roadmap objects */
const roadmapToLines = (r = []) => r.map((i) => `${i.done ? '[x]' : '[ ]'} ${i.title}`).join('\n');
const linesToRoadmap = (s) =>
  String(s || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = /^\[( |x|X)\]\s*(.*)$/.exec(l);
    return m ? { title: m[2], done: m[1].toLowerCase() === 'x' } : { title: l, done: false };
  }).filter((i) => i.title);

// ---------- Projects ----------
export const ProjectsAdmin = () => (
  <ResourceManager
    title="Projects" icon="bi-kanban-fill" singular="project" description="Projects shown on the home page and their detail pages."
    listPath="/projects" createPath="/projects"
    columns={[
      { key: 'title', label: 'Title' }, { key: 'tag', label: 'Tag' }, { key: 'status', label: 'Status' },
      { key: 'progress', label: 'Progress', render: (r) => `${r.progress}%` }, { key: 'interests', label: 'Sign-ups' },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true, col: 8 },
      { name: 'tag', label: 'Tag', required: true, col: 4, hint: 'e.g. Web App, DevOps' },
      { name: 'blurb', label: 'Short summary', type: 'textarea', rows: 2, required: true },
      { name: 'description', label: 'Full description (Markdown)', type: 'markdown', rows: 8 },
      { name: 'stack', label: 'Tech stack', required: true, hint: 'Comma separated: React, Node.js, MySQL' },
      { name: 'roadmap', label: 'Roadmap', type: 'textarea', rows: 5, hint: 'One step per line. Start with [x] for done or [ ] for to-do.' },
      { name: 'progress', label: 'Progress %', type: 'number', col: 4 },
      { name: 'milestone', label: 'Milestone', col: 4, hint: 'e.g. Sprint 4 of 9' },
      { name: 'status', label: 'Status', type: 'select', col: 4, options: ['In development', 'Beta', 'Release candidate', 'Released', 'On hold'] },
      { name: 'lead', label: 'Project lead', col: 4 },
      { name: 'icon', label: 'Icon class', col: 4, hint: 'Bootstrap Icons, e.g. bi-robot' },
      { name: 'art', label: 'Cover colours', type: 'select', col: 4, options: ART },
      { name: 'github_repo', label: 'GitHub repository', col: 6, hint: 'owner/repo — enables live GitHub stats' },
      { name: 'demo_url', label: 'Live demo URL', type: 'url', col: 6 },
    ]}
    emptyForm={{ title: '', tag: '', blurb: '', description: '', stack: '', roadmap: '', progress: 0, milestone: '', status: 'In development', lead: '', icon: 'bi-code-slash', art: 'a1', github_repo: '', demo_url: '' }}
    toForm={(r) => ({ ...r, stack: (r.stack || []).join(', '), roadmap: roadmapToLines(r.roadmap) })}
    toPayload={(f) => ({
      title: f.title, tag: f.tag, blurb: f.blurb, description: f.description, stack: csv(f.stack), roadmap: linesToRoadmap(f.roadmap),
      progress: Number(f.progress) || 0, milestone: f.milestone, status: f.status, lead: f.lead, icon: f.icon, art: f.art,
      github_repo: f.github_repo, demo_url: f.demo_url,
    })}
  />
);

// ---------- Hosted (live) projects ----------
const HOSTED_CATEGORIES = ['Web App', 'Mobile App', 'API', 'Data', 'DevOps', 'Open Source', 'Other'];
export const HostedAdmin = () => (
  <ResourceManager
    title="Hosted projects" icon="bi-cloud-check-fill" singular="hosted project"
    description="Post finished projects that are live on the internet. They appear in the “Hosted projects” section of the website."
    listPath="/hosted-projects" createPath="/hosted-projects" multipart
    columns={[
      { key: 'screenshot', label: 'Preview', render: (r) => (r.screenshot ? <img className="thumb" src={r.screenshot} alt="" /> : <span className="thumb empty"><i className="bi bi-window" /></span>) },
      { key: 'title', label: 'Project', render: (r) => (<><strong>{r.title}</strong><div className="small"><a href={r.url} target="_blank" rel="noopener noreferrer">{clip(r.url, 40)}</a></div></>) },
      { key: 'category', label: 'Category' },
      { key: 'launched', label: 'Launched' },
      { key: 'featured', label: 'Featured', render: (r) => (r.featured ? <Badge value="approved" /> : '—') },
    ]}
    fields={[
      { name: 'title', label: 'Project name', required: true, col: 8 },
      { name: 'category', label: 'Category', type: 'select', col: 4, options: HOSTED_CATEGORIES },
      { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, required: true, hint: 'One or two sentences shown on the card.' },
      { name: 'live_url', label: 'Live website address', type: 'url', required: true, col: 6, hint: 'The full link, starting with https://' },
      { name: 'repo_url', label: 'Source code link (optional)', type: 'url', col: 6, hint: 'e.g. the GitHub repository' },
      { name: 'tech', label: 'Technologies used', required: true, hint: 'Comma separated: React, Node.js, MySQL' },
      { name: 'launched_at', label: 'Launch date', type: 'date', col: 4 },
      { name: 'sort_order', label: 'Order', type: 'number', col: 4, hint: 'Lower numbers first' },
      { name: 'featured', label: 'Highlight', type: 'checkbox', checkLabel: 'Featured (shown first)', col: 4 },
      { name: 'description', label: 'Longer description (optional)', type: 'textarea', rows: 4 },
      { name: 'screenshot', label: 'Screenshot', type: 'file', accept: 'image/jpeg,image/png,image/webp', hint: 'JPG, PNG or WebP, up to 2 MB. 16:10 works best. Leave empty to keep the current one.' },
    ]}
    emptyForm={{ title: '', category: 'Web App', summary: '', live_url: 'https://', repo_url: '', tech: '', launched_at: '', sort_order: '', featured: false, description: '', screenshot: null }}
    toForm={(r) => ({ title: r.title, category: r.category, summary: r.summary, live_url: r.url, repo_url: r.repo, tech: (r.tech || []).join(', '), launched_at: r.launched_at, sort_order: r.sort_order, featured: r.featured, description: r.description, screenshot: null })}
    toPayload={(f) => {
      const p = { title: f.title, category: f.category, summary: f.summary, live_url: f.live_url, repo_url: f.repo_url, tech: csv(f.tech), featured: !!f.featured, description: f.description, launched_at: f.launched_at };
      if (f.sort_order !== '' && f.sort_order !== null) p.sort_order = f.sort_order;
      if (f.screenshot) p.screenshot = f.screenshot;
      return p;
    }}
  />
);

// ---------- Blog posts ----------
export const PostsAdmin = () => (
  <ResourceManager
    title="Blog posts" icon="bi-journal-richtext" singular="post" description="Write articles in Markdown. Drafts stay hidden until published."
    listPath="/admin/posts" itemPath="/posts" createPath="/posts"
    columns={[
      { key: 'title', label: 'Title', render: (r) => clip(r.title, 60) }, { key: 'category', label: 'Category' },
      { key: 'published_at', label: 'Date' },
      { key: 'published', label: 'State', render: (r) => <Badge value={r.published ? 'approved' : 'pending'} /> },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, required: true, hint: 'Shown on the blog list and in search results.' },
      { name: 'category', label: 'Category', type: 'select', col: 4, options: POST_CATEGORIES.filter((c) => c !== 'All Posts') },
      { name: 'published_at', label: 'Publish date', type: 'date', col: 4 },
      { name: 'read_time', label: 'Read time', col: 4, hint: 'e.g. 5 min read' },
      { name: 'tags', label: 'Tags', col: 6, hint: 'Comma separated' },
      { name: 'icon', label: 'Icon class', col: 3 },
      { name: 'art', label: 'Cover colours', type: 'select', col: 3, options: ART },
      { name: 'author_name', label: 'Author name', col: 4, required: true },
      { name: 'author_role', label: 'Author role', col: 4 },
      { name: 'author_bio', label: 'Author bio', col: 4 },
      { name: 'content', label: 'Article (Markdown)', type: 'markdown', rows: 16, hint: 'Editing an older block-format article? Leave this empty to keep it as is.' },
      { name: 'published', label: 'Visibility', type: 'checkbox', checkLabel: 'Published (visible on the site)' },
    ]}
    emptyForm={{ title: '', excerpt: '', category: 'Engineering', published_at: new Date().toISOString().slice(0, 10), read_time: '5 min read', tags: '', icon: 'bi-journal-code', art: 'a1', author_name: '', author_role: '', author_bio: '', content: '', published: true }}
    toForm={(r) => ({
      title: r.title, excerpt: r.excerpt, category: r.category, published_at: r.published_at, read_time: r.read, tags: (r.tags || []).join(', '),
      icon: r.icon, art: r.art, author_name: r.author?.name || '', author_role: r.author?.role || '', author_bio: r.author?.bio || '',
      content: r.content || '', published: r.published,
    })}
    toPayload={(f) => {
      const p = {
        title: f.title, excerpt: f.excerpt, category: f.category, read_time: f.read_time, tags: csv(f.tags), icon: f.icon, art: f.art,
        author: { name: f.author_name, role: f.author_role, bio: f.author_bio, a: '#1b6fd1', b: '#0f4c9e' }, published: !!f.published,
      };
      if (f.published_at) p.published_at = f.published_at;
      if (f.content && f.content.trim()) p.content = f.content;
      return p;
    }}
  />
);

// ---------- Events ----------
const showRegistrations = async (row, ctx) => {
  try {
    const list = await adminGet(`/admin/events/${row.id}/registrations`);
    ctx.showModal(`Registrations — ${row.title}`, list.length === 0 ? <p className="text-muted">Nobody has registered yet.</p> : (
      <div className="table-responsive"><table className="table admin-table"><thead><tr><th>Name</th><th>Email</th><th>When</th></tr></thead>
        <tbody>{list.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{when(r.created_at)}</td></tr>)}</tbody></table></div>
    ));
  } catch (e) { ctx.toast(e.message); }
};

export const EventsAdmin = () => (
  <ResourceManager
    title="Events" icon="bi-calendar-event-fill" singular="event" description="Workshops, hack nights and demo days. Visitors can register from the Events page."
    listPath="/events" createPath="/events"
    columns={[
      { key: 'title', label: 'Title', render: (r) => clip(r.title, 50) }, { key: 'type', label: 'Type' },
      { key: 'starts_at', label: 'Starts', render: (r) => formatDateTime(r.starts_at) },
      { key: 'registered', label: 'Registered', render: (r) => (r.capacity ? `${r.registered} / ${r.capacity}` : r.registered) },
    ]}
    rowActions={[{ label: 'Registrations', icon: 'bi-people', run: showRegistrations }]}
    fields={[
      { name: 'title', label: 'Title', required: true, col: 8 },
      { name: 'type', label: 'Type', type: 'select', col: 4, options: ['Workshop', 'Hack Night', 'Demo Day', 'Meetup', 'Sprint Review', 'Talk'] },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, required: true },
      { name: 'location', label: 'Location', col: 6 },
      { name: 'capacity', label: 'Capacity', type: 'number', col: 6, hint: '0 = unlimited' },
      { name: 'starts_at', label: 'Starts', type: 'datetime-local', col: 6, required: true },
      { name: 'ends_at', label: 'Ends', type: 'datetime-local', col: 6 },
      { name: 'icon', label: 'Icon class', col: 6 },
      { name: 'art', label: 'Colours', type: 'select', col: 6, options: ART },
    ]}
    emptyForm={{ title: '', type: 'Workshop', description: '', location: 'Software Engineering Lab', capacity: 0, starts_at: '', ends_at: '', icon: 'bi-calendar-event-fill', art: 'a1' }}
    toForm={(r) => ({ ...r, starts_at: toInputDateTime(r.starts_at), ends_at: toInputDateTime(r.ends_at) })}
    toPayload={(f) => {
      const p = { title: f.title, type: f.type, description: f.description, location: f.location, capacity: Number(f.capacity) || 0, icon: f.icon, art: f.art };
      if (f.starts_at) p.starts_at = f.starts_at;
      if (f.ends_at) p.ends_at = f.ends_at;
      return p;
    }}
  />
);

// ---------- FAQs ----------
export const FaqsAdmin = () => (
  <ResourceManager
    title="FAQs" icon="bi-question-circle-fill" singular="FAQ" listPath="/faqs" createPath="/faqs"
    columns={[{ key: 'cat', label: 'Category' }, { key: 'q', label: 'Question', render: (r) => clip(r.q, 80) }, { key: 'sort_order', label: 'Order' }]}
    fields={[
      { name: 'category', label: 'Category', type: 'select', col: 8, options: FAQ_CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ value: c.id, label: c.label })) },
      { name: 'sort_order', label: 'Order', type: 'number', col: 4 },
      { name: 'question', label: 'Question', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
    ]}
    emptyForm={{ category: 'joining', question: '', answer: '', sort_order: '' }}
    toForm={(r) => ({ category: r.cat, question: r.q, answer: r.a, sort_order: r.sort_order })}
    toPayload={(f) => ({ category: f.category, question: f.question, answer: f.answer, ...(f.sort_order !== '' ? { sort_order: Number(f.sort_order) } : {}) })}
  />
);

// ---------- Team ----------
export const TeamAdmin = () => (
  <ResourceManager
    title="Team" icon="bi-people-fill" singular="team member" description="People shown in the “Our People” section. Upload a square photo for each."
    listPath="/team" createPath="/team" multipart
    columns={[
      { key: 'photo', label: 'Photo', render: (r) => (r.photo ? <img className="thumb round" src={r.photo} alt="" /> : <span className="thumb round empty"><i className="bi bi-person" /></span>) },
      { key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'sort_order', label: 'Order' },
    ]}
    fields={[
      { name: 'name', label: 'Name', required: true, col: 6 },
      { name: 'role', label: 'Role', required: true, col: 6 },
      { name: 'photo', label: 'Photo', type: 'file', accept: 'image/jpeg,image/png,image/webp', hint: 'JPG, PNG or WebP, up to 2 MB. Leave empty to keep the current photo.' },
      { name: 'github', label: 'GitHub URL', type: 'url', col: 4 },
      { name: 'linkedin', label: 'LinkedIn URL', type: 'url', col: 4 },
      { name: 'x', label: 'X / Twitter URL', type: 'url', col: 4 },
      { name: 'color_a', label: 'Fallback colour 1', type: 'color', col: 4 },
      { name: 'color_b', label: 'Fallback colour 2', type: 'color', col: 4 },
      { name: 'sort_order', label: 'Order', type: 'number', col: 4 },
    ]}
    emptyForm={{ name: '', role: '', photo: null, github: '', linkedin: '', x: '', color_a: '#1b6fd1', color_b: '#0f4c9e', sort_order: '' }}
    toForm={(r) => ({ name: r.name, role: r.role, photo: null, github: r.github, linkedin: r.linkedin, x: r.x, color_a: r.a, color_b: r.b, sort_order: r.sort_order })}
    toPayload={(f) => {
      const p = { name: f.name, role: f.role, github: f.github, linkedin: f.linkedin, x: f.x, color_a: f.color_a, color_b: f.color_b };
      if (f.sort_order !== '') p.sort_order = f.sort_order;
      if (f.photo) p.photo = f.photo;
      return p;
    }}
  />
);

// ---------- Gallery ----------
export const GalleryAdmin = () => (
  <ResourceManager
    title="Gallery" icon="bi-images" singular="photo" description="Photos shown in the gallery section and page."
    listPath="/gallery" createPath="/gallery" multipart="create"
    columns={[
      { key: 'url', label: 'Photo', render: (r) => <img className="thumb" src={r.url} alt="" /> },
      { key: 'title', label: 'Title' }, { key: 'caption', label: 'Caption', render: (r) => clip(r.caption, 60) },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true },
      { name: 'caption', label: 'Caption' },
      { name: 'image', label: 'Image', type: 'file', accept: 'image/jpeg,image/png,image/webp', hint: 'Required when adding a photo. JPG, PNG or WebP, up to 2 MB.' },
    ]}
    emptyForm={{ title: '', caption: '', image: null }}
    toForm={(r) => ({ title: r.title, caption: r.caption, image: null })}
    toPayload={(f, creating) => ({ title: f.title, caption: f.caption, ...(creating && f.image ? { image: f.image } : {}) })}
  />
);

// ---------- Reports ----------
export const ReportsAdmin = () => (
  <ResourceManager
    title="Reports" icon="bi-file-earmark-pdf-fill" singular="report" description="Documents visitors can download from the Lab Reports page."
    listPath="/reports" createPath="/reports" multipart
    columns={[
      { key: 'title', label: 'Title', render: (r) => clip(r.title, 55) }, { key: 'year', label: 'Year' },
      { key: 'hasFile', label: 'PDF', render: (r) => (r.hasFile ? <Badge value="approved" /> : <Badge value="pending" />) },
      { key: 'size', label: 'Size' }, { key: 'downloads', label: 'Downloads' },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true, col: 9 },
      { name: 'year', label: 'Year', type: 'number', col: 3 },
      { name: 'subtitle', label: 'Description' },
      { name: 'file', label: 'PDF file', type: 'file', accept: 'application/pdf', hint: 'PDF up to 10 MB. Uploading a new file replaces the old one.' },
    ]}
    emptyForm={{ title: '', subtitle: '', year: new Date().getFullYear(), file: null }}
    toForm={(r) => ({ title: r.title, subtitle: r.sub, year: r.year || '', file: null })}
    toPayload={(f) => ({ title: f.title, subtitle: f.subtitle, ...(f.year ? { year: f.year } : {}), ...(f.file ? { file: f.file } : {}) })}
  />
);

// ---------- Inbox: messages ----------
export const MessagesAdmin = () => (
  <ResourceManager
    title="Messages" icon="bi-envelope-fill" singular="message" description="Messages sent through the contact form."
    listPath="/admin/messages" itemPath="/admin/messages" canCreate={false} canEdit={false}
    columns={[
      { key: 'name', label: 'From', render: (r) => (<><strong>{r.name}</strong><div className="small text-muted">{r.email}</div></>) },
      { key: 'subject', label: 'Subject' }, { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      { key: 'created_at', label: 'Received', render: (r) => when(r.created_at) },
    ]}
    rowActions={[
      { label: 'View', icon: 'bi-eye', run: async (r, ctx) => {
        ctx.showModal(r.subject, <Detail rows={[['From', `${r.name} <${r.email}>`], ['Received', when(r.created_at)], ['Status', r.status]]} text={r.message} />);
        if (r.status === 'new') { await adminSend('patch', `/admin/messages/${r.id}`, { status: 'read' }); ctx.reload(); }
      } },
      { label: 'Archive', icon: 'bi-archive', show: (r) => r.status !== 'archived', run: async (r, ctx) => { await adminSend('patch', `/admin/messages/${r.id}`, { status: 'archived' }); ctx.reload(); } },
    ]}
  />
);

// ---------- Inbox: subscribers ----------
export const SubscribersAdmin = () => (
  <ResourceManager
    title="Subscribers" icon="bi-megaphone-fill" singular="subscriber" description="People who subscribed to the newsletter."
    listPath="/admin/subscribers" itemPath="/admin/subscribers" canCreate={false} canEdit={false}
    columns={[{ key: 'email', label: 'Email' }, { key: 'source', label: 'Source' }, { key: 'created_at', label: 'Joined', render: (r) => when(r.created_at) }]}
  />
);

// ---------- Inbox: applications ----------
const decide = (status) => async (r, ctx) => {
  const note = window.prompt(`Optional note to include in the email to ${r.name} (leave empty for none):`, '');
  if (note === null) return; // cancelled
  try {
    await adminSend('patch', `/admin/applications/${r.id}`, { status, admin_note: note });
    ctx.toast(`Application ${status}. ${status === 'pending' ? '' : 'The applicant was emailed.'}`);
    ctx.reload();
  } catch (e) { ctx.toast(e.message); }
};

export const ApplicationsAdmin = () => (
  <ResourceManager
    title="Applications" icon="bi-person-plus-fill" singular="application" description="Membership applications. Approving or rejecting emails the applicant."
    listPath="/admin/applications" itemPath="/admin/applications" canCreate={false} canEdit={false}
    columns={[
      { key: 'name', label: 'Applicant', render: (r) => (<><strong>{r.name}</strong><div className="small text-muted">{r.email}</div></>) },
      { key: 'track', label: 'Track' }, { key: 'level', label: 'Level' },
      { key: 'availability_hours', label: 'Hrs/wk' },
      { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      { key: 'created_at', label: 'Applied', render: (r) => when(r.created_at) },
    ]}
    rowActions={[
      { label: 'View', icon: 'bi-eye', run: (r, ctx) => ctx.showModal(`Application — ${r.name}`, (
        <Detail rows={[['Email', r.email], ['Phone', r.phone], ['Track', r.track], ['Level', r.level], ['Skills', r.skills], ['Hours per week', r.availability_hours], ['GitHub', r.github && `github.com/${r.github}`], ['Status', r.status], ['Note', r.admin_note], ['Applied', when(r.created_at)]]} text={r.motivation} />
      )) },
      { label: 'Approve', icon: 'bi-check-circle', show: (r) => r.status !== 'approved', run: decide('approved') },
      { label: 'Reject', icon: 'bi-x-circle', show: (r) => r.status !== 'rejected', run: decide('rejected') },
    ]}
  />
);

// ---------- Inbox: comments ----------
const setComment = (status) => async (r, ctx) => { await adminSend('patch', `/admin/comments/${r.id}`, { status }); ctx.reload(); };

export const CommentsAdmin = () => (
  <ResourceManager
    title="Comments" icon="bi-chat-left-text-fill" singular="comment" description="Moderate comments members leave on blog posts."
    listPath="/admin/comments" itemPath="/admin/comments" canCreate={false} canEdit={false}
    columns={[
      { key: 'author', label: 'Author' }, { key: 'post_title', label: 'Post', render: (r) => clip(r.post_title, 40) },
      { key: 'body', label: 'Comment', render: (r) => clip(r.body, 80) },
      { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
      { key: 'created_at', label: 'Posted', render: (r) => when(r.created_at) },
    ]}
    rowActions={[
      { label: 'Approve', icon: 'bi-check-circle', show: (r) => r.status !== 'approved', run: setComment('approved') },
      { label: 'Reject', icon: 'bi-x-circle', show: (r) => r.status !== 'rejected', run: setComment('rejected') },
    ]}
  />
);

// ---------- People ----------
export const MembersAdmin = () => (
  <ResourceManager
    title="Members" icon="bi-person-badge-fill" singular="member" description="Registered accounts."
    listPath="/admin/users" canCreate={false} canEdit={false} canDelete={false}
    columns={[
      { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => <span className={`badge text-bg-${r.role === 'admin' ? 'primary' : 'secondary'}`}>{r.role}</span> },
      { key: 'github', label: 'GitHub' }, { key: 'created_at', label: 'Joined', render: (r) => when(r.created_at) },
    ]}
  />
);
