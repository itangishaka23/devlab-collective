import { useState } from 'react';
import { sendContact } from '../api/services.js';
import Captcha, { captchaEnabled } from './Captcha.jsx';
import Honeypot from './Honeypot.jsx';

const EMPTY = { name: '', email: '', subject: 'Join the Lab', message: '', website: '' };

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!values.name.trim()) err.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(values.email)) err.email = 'Please enter a valid email.';
    if (!values.message.trim()) err.message = 'Please write a short message.';
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSent(false);
    setServerError('');
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;
    if (captchaEnabled && !token) { setServerError('Please complete the captcha.'); return; }

    setLoading(true);
    try {
      await sendContact({ ...values, captchaToken: token });
      setSent(true);
      setValues(EMPTY);
    } catch (apiErr) {
      // Show per-field messages from the API's validation, or a general error
      if (Object.keys(apiErr.fieldErrors || {}).length) setErrors(apiErr.fieldErrors);
      else setServerError(apiErr.message);
      setResetKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, props = {}, Tag = 'input') => (
    <>
      <label className="form-label small fw-semibold" htmlFor={id}>{label}</label>
      <Tag
        id={id}
        className={`form-control form-control-hw ${errors[id] ? 'is-invalid' : ''}`}
        value={values[id]}
        onChange={set(id)}
        {...props}
      />
      {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
    </>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="row g-3">
        <div className="col-md-6">{field('name', 'Full Name', { type: 'text', placeholder: 'Jane Doe' })}</div>
        <div className="col-md-6">{field('email', 'Email Address', { type: 'email', placeholder: 'jane@example.com' })}</div>
        <div className="col-12">
          <label className="form-label small fw-semibold" htmlFor="subject">Subject</label>
          <select id="subject" className="form-select form-control-hw" value={values.subject} onChange={set('subject')}>
            <option>Join the Lab</option>
            <option>Propose a project</option>
            <option>Industry partnership</option>
            <option>Security</option>
            <option>Privacy</option>
            <option>Other</option>
          </select>
        </div>
        <div className="col-12">{field('message', 'Message', { rows: 4, placeholder: 'Tell us about yourself or your idea…' }, 'textarea')}</div>
        <div className="col-12">
          <Honeypot value={values.website} onChange={(v) => setValues((s) => ({ ...s, website: v }))} />
          <Captcha onToken={setToken} resetKey={resetKey} />
          <button type="submit" className="btn-hw-primary w-100 justify-content-center" disabled={loading}>
            {loading ? 'Sending…' : (<>Send Message <i className="bi bi-send" /></>)}
          </button>
        </div>
        <div className="col-12" role="status" aria-live="polite">
          {serverError && (
            <div className="alert alert-danger mt-2 mb-0" style={{ borderRadius: 12 }}>
              <i className="bi bi-exclamation-triangle-fill me-2" />{serverError}
            </div>
          )}
          {sent && (
            <div className="alert alert-success mt-2 mb-0" style={{ borderRadius: 12 }}>
              <i className="bi bi-check-circle-fill me-2" />Thanks! Your message has been sent. We’ll reply soon.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
