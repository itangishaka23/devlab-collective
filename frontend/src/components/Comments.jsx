import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addComment, getComments } from '../api/services.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Comments({ slug }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);

  const load = () => getComments(slug).then(setComments).catch(() => setComments(null));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  if (comments === null) return null; // API offline — comments are optional

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: '', msg: '' });
    try {
      const res = await addComment(slug, text);
      setText('');
      setStatus({ type: 'ok', msg: res.message });
      if (res.approved) load();
    } catch (err) {
      setStatus({ type: 'err', msg: err.fieldErrors?.body || err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="comments" aria-label="Comments">
      <h3 className="comments-title"><i className="bi bi-chat-left-text" /> Comments <span>({comments.length})</span></h3>

      {comments.length === 0 && <p className="text-muted">No comments yet — start the conversation.</p>}
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment">
            <span className="avatar" style={{ '--s': '38px' }}>{c.author.slice(0, 1).toUpperCase()}</span>
            <div>
              <div className="comment-head"><strong>{c.author}</strong> <time>{new Date(c.created_at.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>
              <p>{c.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {user ? (
        <form onSubmit={submit} className="comment-form">
          <label htmlFor="comment-text" className="form-label small fw-semibold">Add a comment as {user.name}</label>
          <textarea id="comment-text" className="form-control form-control-hw" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="Share a thought or question…" required />
          <div className="d-flex align-items-center gap-3 mt-2">
            <button type="submit" className="btn-hw-primary" disabled={busy || text.trim().length < 2}>{busy ? 'Posting…' : 'Post comment'}</button>
            {status.msg && <span className={`small ${status.type === 'ok' ? 'text-success' : 'text-danger'}`} role="status">{status.msg}</span>}
          </div>
        </form>
      ) : (
        <p className="comment-login"><Link to="/login" state={{ from: window.location.pathname }}>Log in</Link> or <Link to="/register">create a member account</Link> to join the discussion.</p>
      )}
    </section>
  );
}
