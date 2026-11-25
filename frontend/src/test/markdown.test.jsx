import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Markdown, { parseBlocks } from '../components/Markdown.jsx';

describe('Markdown renderer', () => {
  it('renders headings, bold text, lists and links', () => {
    render(<Markdown>{'# Title\n\nSome **bold** text with a [link](https://example.com).\n\n- one\n- two'}</Markdown>);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('never injects HTML — script tags are shown as plain text', () => {
    const { container } = render(<Markdown>{'Hello <script>alert(1)</script> <img src=x onerror=alert(1)>'}</Markdown>);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });

  it('refuses javascript: links', () => {
    const { container } = render(<Markdown>{'[click](javascript:alert(1))'}</Markdown>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.textContent).toContain('click');
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('adds rel="noopener noreferrer nofollow" to external links', () => {
    render(<Markdown>{'[docs](https://example.com/docs)'}</Markdown>);
    expect(screen.getByRole('link')).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('keeps fenced code blocks verbatim', () => {
    const blocks = parseBlocks('```\nconst a = **1**;\n```');
    expect(blocks).toEqual([{ type: 'code', text: 'const a = **1**;' }]);
  });

  it('does not loop forever on odd input', () => {
    expect(() => parseBlocks('>\n---\n- \n1) x\n# ')).not.toThrow();
  });
});
