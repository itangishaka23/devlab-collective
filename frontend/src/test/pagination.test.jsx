import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from '../components/Pagination.jsx';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pages={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page and changes page on click', async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pages={4} onChange={onChange} />);
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('link', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
    await userEvent.click(screen.getByRole('link', { name: /previous/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not go past the first page', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pages={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('link', { name: /previous/i }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
