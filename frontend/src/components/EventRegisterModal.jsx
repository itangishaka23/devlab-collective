import QuickSignupModal from './QuickSignupModal.jsx';
import { registerForEvent } from '../api/services.js';

export default function EventRegisterModal({ event, onClose, onDone }) {
  return (
    <QuickSignupModal
      open={!!event}
      title={event ? `Register: ${event.title}` : ''}
      intro="Reserve your place. We’ll email you a confirmation."
      submitLabel="Reserve my spot"
      onSubmit={(v) => registerForEvent(event.id, v)}
      onClose={onClose}
      onDone={() => onDone?.(event)}
    />
  );
}
