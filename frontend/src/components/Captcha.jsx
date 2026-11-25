import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
export const captchaEnabled = Boolean(SITE_KEY);

let scriptPromise;
const loadScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
};

/**
 * Cloudflare Turnstile widget. Renders nothing unless VITE_TURNSTILE_SITE_KEY is set.
 * `onToken(token)` is called with the token (or '' when it expires / fails).
 * Change `resetKey` to reset the widget (e.g. after a failed submit).
 */
export default function Captcha({ onToken, resetKey = 0 }) {
  const box = useRef(null);
  const widgetId = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !box.current || widgetId.current !== null) return;
        widgetId.current = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          callback: (t) => cb.current(t),
          'expired-callback': () => cb.current(''),
          'error-callback': () => cb.current(''),
        });
      })
      .catch(() => cb.current(''));
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      cb.current('');
    }
  }, [resetKey]);

  return SITE_KEY ? <div ref={box} className="my-2" /> : null;
}
