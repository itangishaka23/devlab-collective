import QuickSignupModal from './QuickSignupModal.jsx';
import { joinProject } from '../api/services.js';

/** "Join this project" dialog — records interest through the API. */
export default function JoinProjectModal({ project, onClose, onJoined }) {
  return (
    <QuickSignupModal
      open={!!project}
      title={project ? `Join ${project.title}` : ''}
      intro="Leave your details and a mentor will contact you about joining this project."
      submitLabel="Count me in"
      onSubmit={(v) => joinProject(project.id, v)}
      onClose={onClose}
      onDone={() => project && onJoined?.(project.id)}
    />
  );
}
