import { useState } from 'react';

/** Member photo that falls back to a gradient initials card if the image is missing. */
export default function TeamPhoto({ member }) {
  const [failed, setFailed] = useState(false);
  const initials = member.name.split(' ').map((w) => w[0]).join('');

  if (member.photo && !failed) {
    return (
      <img
        className="team-photo"
        src={member.photo}
        alt={`${member.name}, ${member.role}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="team-art" style={{ '--a': member.a, '--b': member.b }} role="img" aria-label={member.name}>
      <span>{initials}</span>
    </div>
  );
}
