import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../api/services.js', () => ({ sendContact: vi.fn() }));
const { sendContact } = await import('../api/services.js');
const { default: ContactForm } = await import('../components/ContactForm.jsx');

describe('ContactForm', () => {
  it('shows validation errors and does not call the API when empty', async () => {
    render(<ContactForm />);
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
    expect(sendContact).not.toHaveBeenCalled();
  });

  it('sends a valid message and shows a success note', async () => {
    sendContact.mockResolvedValue({ message: 'ok' });
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello there, I would like to join.');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(sendContact).toHaveBeenCalledTimes(1));
    expect(sendContact).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com', website: '' }));
    expect(await screen.findByText(/your message has been sent/i)).toBeInTheDocument();
  });

  it('shows the server error when the API call fails', async () => {
    sendContact.mockRejectedValue(Object.assign(new Error('Cannot reach the server. Please try again later.'), { fieldErrors: {} }));
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText('Full Name'), 'Jane Doe');
    await userEvent.type(screen.getByLabelText('Email Address'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Message'), 'Hello there, I would like to join.');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/cannot reach the server/i)).toBeInTheDocument();
  });
});
