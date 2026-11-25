import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Field, { inputClass } from '../components/Field.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      const user = await login(values);
      const from = location.state?.from;
      navigate(from || (user.role === 'admin' ? '/admin' : '/account'), { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setError(Object.keys(err.fieldErrors || {}).length ? '' : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-page">
      <Seo title="Log in" description="Log in to your DevLab Collective member account." />
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="text-muted">Log in to manage your projects, events and profile.</p>
        <form onSubmit={submit} noValidate>
          <Field label="Email" id="l-email" error={errors.email}>
            <input id="l-email" type="email" className={inputClass(errors.email)} value={values.email} onChange={set('email')} autoComplete="email" autoFocus />
          </Field>
          <Field label="Password" id="l-pass" error={errors.password}>
            <input id="l-pass" type="password" className={inputClass(errors.password)} value={values.password} onChange={set('password')} autoComplete="current-password" />
          </Field>
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
          <button className="btn-hw-primary w-100 justify-content-center" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="auth-alt">New here? <Link to="/register">Create a member account</Link></p>
      </div>
    </section>
  );
}
