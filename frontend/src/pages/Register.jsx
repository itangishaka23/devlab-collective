import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Captcha, { captchaEnabled } from '../components/Captcha.jsx';
import Field, { inputClass } from '../components/Field.jsx';
import Honeypot from '../components/Honeypot.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', website: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (captchaEnabled && !token) { setError('Please complete the captcha.'); return; }
    setBusy(true);
    setError('');
    setErrors({});
    try {
      await register({ ...values, captchaToken: token });
      navigate('/account', { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setError(Object.keys(err.fieldErrors || {}).length ? '' : err.message);
      setResetKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <Seo title="Create account" description="Create a DevLab Collective member account to join projects, register for events and comment on posts." />
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="text-muted">Follow projects, register for events and join the discussion.</p>
        <form onSubmit={submit} noValidate>
          <Field label="Full name" id="r-name" error={errors.name}>
            <input id="r-name" className={inputClass(errors.name)} value={values.name} onChange={set('name')} autoComplete="name" autoFocus />
          </Field>
          <Field label="Email" id="r-email" error={errors.email}>
            <input id="r-email" type="email" className={inputClass(errors.email)} value={values.email} onChange={set('email')} autoComplete="email" />
          </Field>
          <Field label="Password" id="r-pass" error={errors.password} hint="At least 8 characters, with a letter and a number.">
            <input id="r-pass" type="password" className={inputClass(errors.password)} value={values.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
          <Honeypot value={values.website} onChange={(v) => setValues((s) => ({ ...s, website: v }))} />
          <Captcha onToken={setToken} resetKey={resetKey} />
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
          <button className="btn-hw-primary w-100 justify-content-center" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="auth-alt">Already a member? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
