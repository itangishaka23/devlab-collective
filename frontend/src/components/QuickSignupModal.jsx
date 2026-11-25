import { useEffect, useState } from 'react';
import Captcha, { captchaEnabled } from './Captcha.jsx';
import Field, { inputClass } from './Field.jsx';
import Honeypot from './Honeypot.jsx';
import Modal from './Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Name + email dialog used for "Join this project" and "Register for event".
 * `onSubmit(values)` must return a promise resolving to { message }.
 */
export default function QuickSignupModal({ open, title, intro, submitLabel = 'Submit', onSubmit, onClose, onDone }) {
  const { user } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  // Reset whenever the dialog opens; prefill from the logged-in member
  useEffect(() => {
    if (open) {
      setValues({ name: user?.name || '', email: user?.email || '', website: '' });
      setErrors({});
      setStatus('idle');
      setMessage('');
    }
  }, [open, user]);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (captchaEnabled && !token) {
      setStatus('error');
      setMessage('Please complete the captcha.');
      return;
    }
    setStatus('loading');
    setErrors({});
    try {
      const res = await onSubmit({ ...values, captchaToken: token });
      setStatus('success');
      setMessage(res.message);
      onDone?.();
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setStatus('error');
      setMessage(err.message);
      if (err.status === 409) onDone?.(); // "already registered" is fine from the visitor's point of view
      setResetKey((k) => k + 1);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {status === 'success' ? (
        <div className="text-center py-3">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.4rem' }} />
          <p className="mt-3 mb-4" role="status">{message}</p>
          <button type="button" className="btn-hw-primary" onClick={onClose}>Close</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {intro && <p className="text-muted">{intro}</p>}
          <Field label="Full Name" id="qs-name" error={errors.name}>
            <input id="qs-name" className={inputClass(errors.name)} value={values.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name" />
          </Field>
          <Field label="Email Address" id="qs-email" error={errors.email}>
            <input id="qs-email" type="email" className={inputClass(errors.email)} value={values.email} onChange={set('email')} placeholder="jane@example.com" autoComplete="email" />
          </Field>
          <Honeypot value={values.website} onChange={(v) => setValues((s) => ({ ...s, website: v }))} />
          <Captcha onToken={setToken} resetKey={resetKey} />
          {status === 'error' && !Object.keys(errors).length && <div className="alert alert-warning py-2" role="alert">{message}</div>}
          <button type="submit" className="btn-hw-primary w-100 justify-content-center" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : submitLabel}
          </button>
        </form>
      )}
    </Modal>
  );
}
