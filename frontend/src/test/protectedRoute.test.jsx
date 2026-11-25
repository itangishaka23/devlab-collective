import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const auth = { user: null, ready: true };
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => auth }));
const { default: ProtectedRoute } = await import('../components/ProtectedRoute.jsx');

const renderAt = (element) =>
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/account" element={<div>account page</div>} />
        <Route path="/secret" element={element} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  it('sends visitors to the login page', () => {
    Object.assign(auth, { user: null, ready: true });
    renderAt(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('shows the page to a logged-in member', () => {
    Object.assign(auth, { user: { name: 'Jane', role: 'member' }, ready: true });
    renderAt(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('keeps members out of admin-only pages', () => {
    Object.assign(auth, { user: { name: 'Jane', role: 'member' }, ready: true });
    renderAt(<ProtectedRoute role="admin"><div>secret</div></ProtectedRoute>);
    expect(screen.getByText('account page')).toBeInTheDocument();
  });

  it('waits while the session is being checked', () => {
    Object.assign(auth, { user: null, ready: false });
    renderAt(<ProtectedRoute><div>secret</div></ProtectedRoute>);
    expect(screen.getByRole('status')).toHaveTextContent(/checking/i);
  });
});
