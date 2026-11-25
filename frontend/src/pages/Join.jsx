import { useState } from 'react';
import { submitApplication } from '../api/services.js';
import Captcha, { captchaEnabled } from '../components/Captcha.jsx';
import Field, { inputClass } from '../components/Field.jsx';
import Honeypot from '../components/Honeypot.jsx';
import Reveal from '../components/Reveal.jsx';
import Seo from '../components/Seo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TRACKS = ['Web Development', 'DevOps & CI/CD', 'Software Testing', 'Mobile Apps', 'Data & Analytics', 'Open Source'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const emptyForm = (user) => ({
  name: user?.name || '', email: user?.email || '', phone: '', track: TRACKS[0], level: 'Beginner',
  skills: '', availability_hours: 6, github: user?.github || '', motivation: '', website: '',
});

export default function Join() {
  const { user } = useAuth();
  const [values, setValues] = useState(() => emptyForm(user));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (captchaEnabled && !token) { setStatus('error'); setMessage('Please complete the captcha.'); return; }
    setStatus('loading');
    setErrors({});
    try {
      const res = await submitApplication({ ...values, availability_hours: Number(values.availability_hours), captchaToken: token });
      setStatus('success');
      setMessage(res.message);
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setStatus('error');
      setMessage(Object.keys(err.fieldErrors || {}).length ? 'Please fix the highlighted fields.' : err.message);
      setResetKey((k) => k + 1);
    }
  };

  return (
    <>
      <Seo title="Join the Lab" description="Apply to join the DevLab Collective: pick a track, tell us about yourself and a mentor will reply by email." />
      <header className="policy-hero">
        <div className="hero-glow" />
        <Reveal className="container position-relative text-center">
          <span className="eyebrow"><i className="bi bi-person-plus-fill" /> Membership</span>
          <h1 className="hero-title mt-3 mx-auto" style={{ fontSize: 'clamp(2rem,4vw,2.9rem)', maxWidth: 700 }}>Join the Lab</h1>
          <p className="hero-lead mt-3 mx-auto text-center">Tell us a little about you. A mentor reviews every application and replies by email within a few days.</p>
        </Reveal>
      </header>

      <section className="section-pad pt-4">
        <div className="container">
          <div className="join-card">
            {status === 'success' ? (
              <div className="text-center py-4" role="status">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }} />
                <h2 className="font-display fw-bold mt-3">Application received</h2>
                <p className="text-muted mb-0">{message}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <Field label="Full name *" id="a-name" error={errors.name} className="mb-0"><input id="a-name" className={inputClass(errors.name)} value={values.name} onChange={set('name')} autoComplete="name" /></Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Email *" id="a-email" error={errors.email} className="mb-0"><input id="a-email" type="email" className={inputClass(errors.email)} value={values.email} onChange={set('email')} autoComplete="email" /></Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Phone (optional)" id="a-phone" error={errors.phone} className="mb-0"><input id="a-phone" className={inputClass(errors.phone)} value={values.phone} onChange={set('phone')} autoComplete="tel" /></Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="GitHub username (optional)" id="a-gh" error={errors.github} className="mb-0"><input id="a-gh" className={inputClass(errors.github)} value={values.github} onChange={set('github')} placeholder="octocat" /></Field>
                  </div>
                  <div className="col-md-4">
                    <Field label="Track *" id="a-track" error={errors.track} className="mb-0">
                      <select id="a-track" className="form-select form-control-hw" value={values.track} onChange={set('track')}>{TRACKS.map((t) => <option key={t}>{t}</option>)}</select>
                    </Field>
                  </div>
                  <div className="col-md-4">
                    <Field label="Experience *" id="a-level" error={errors.level} className="mb-0">
                      <select id="a-level" className="form-select form-control-hw" value={values.level} onChange={set('level')}>{LEVELS.map((t) => <option key={t}>{t}</option>)}</select>
                    </Field>
                  </div>
                  <div className="col-md-4">
                    <Field label="Hours per week *" id="a-hours" error={errors.availability_hours} className="mb-0">
                      <input id="a-hours" type="number" min="1" max="40" className={inputClass(errors.availability_hours)} value={values.availability_hours} onChange={set('availability_hours')} />
                    </Field>
                  </div>
                  <div className="col-12">
                    <Field label="Skills (optional)" id="a-skills" error={errors.skills} hint="e.g. JavaScript, Python, Git, SQL" className="mb-0">
                      <input id="a-skills" className={inputClass(errors.skills)} value={values.skills} onChange={set('skills')} />
                    </Field>
                  </div>
                  <div className="col-12">
                    <Field label="Why do you want to join? *" id="a-why" error={errors.motivation} className="mb-0">
                      <textarea id="a-why" rows={5} maxLength={2000} className={inputClass(errors.motivation)} value={values.motivation} onChange={set('motivation')} placeholder="What would you like to build or learn?" />
                    </Field>
                  </div>
                  <div className="col-12">
                    <Honeypot value={values.website} onChange={(v) => setValues((s) => ({ ...s, website: v }))} />
                    <Captcha onToken={setToken} resetKey={resetKey} />
                    {status === 'error' && <div className="alert alert-warning py-2 mb-3" role="alert">{message}</div>}
                    <button className="btn-hw-primary w-100 justify-content-center" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Sending…' : (<>Submit application <i className="bi bi-send" /></>)}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
