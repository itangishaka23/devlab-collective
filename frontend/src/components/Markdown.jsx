
/**
 * Small, safe Markdown renderer. It builds React elements (never raw HTML), so
 * content cannot inject scripts. Supported: # headings, paragraphs, **bold**,
 * *italic*, `code`, [links](https://…), - / 1. lists, > quotes, ``` code blocks, ---.
 */

const SAFE_URL = /^(https?:\/\/|mailto:|\/|#)/i;

export function parseInline(text, keyPrefix = 'i') {
  const nodes = [];
  // order matters: code first, then links, bold, italic
  const re = /(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (m[1]) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (m[2]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      nodes.push(
        SAFE_URL.test(href)
          ? <a key={key} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer nofollow">{label}</a>
          : label
      );
    } else if (m[3]) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (m[4]) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function parseBlocks(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { blocks.push({ type: 'h', level: Math.min(h[1].length + 1, 4), text: h[2] }); i++; continue; } // # → h2 (page already has an h1)
    if (/^---+$/.test(line.trim())) { blocks.push({ type: 'hr' }); i++; continue; }
    if (line.startsWith('>')) {
      const q = [];
      while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: q.join(' ') });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''));
      blocks.push({ type: 'ol', items });
      continue;
    }
    // paragraph: consume until blank line or another block start
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|---+$|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i])) para.push(lines[i++]);
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    else i++; // safety: never loop forever
  }
  return blocks;
}

export default function Markdown({ children, className = '' }) {
  const blocks = parseBlocks(children);
  return (
    <div className={`markdown ${className}`.trim()}>
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.type) {
          case 'h': {
            const Tag = `h${b.level}`;
            return <Tag key={key}>{parseInline(b.text, key)}</Tag>;
          }
          case 'ul': return <ul key={key}>{b.items.map((t, j) => <li key={j}>{parseInline(t, `${key}-${j}`)}</li>)}</ul>;
          case 'ol': return <ol key={key}>{b.items.map((t, j) => <li key={j}>{parseInline(t, `${key}-${j}`)}</li>)}</ol>;
          case 'quote': return <blockquote key={key} className="post-pullquote">{parseInline(b.text, key)}</blockquote>;
          case 'code': return <pre key={key} className="post-code"><code>{b.text}</code></pre>;
          case 'hr': return <hr key={key} />;
          default: return <p key={key}>{parseInline(b.text, key)}</p>;
        }
      })}
    </div>
  );
}

