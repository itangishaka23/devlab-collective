import { useState } from 'react';
import { subscribe } from '../api/services.js';

/** State + submit handler for newsletter forms. */
export default function useSubscribe(source = 'website') {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await subscribe(email, source);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.fieldErrors?.email || err.message);
    }
  };

  return { email, setEmail, status, message, submit };
}
