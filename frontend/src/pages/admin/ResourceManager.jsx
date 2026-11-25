import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminGet, adminSend } from '../../api/admin.js';
import Markdown from '../../components/Markdown.jsx';
import Modal from '../../components/Modal.jsx';

/**
 * Generic admin screen: searchable table + create/edit form + delete + custom row actions.
 *
 * Props
 *  listPath / itemPath / createPath  API paths (itemPath defaults to createPath)
 *  columns   [{ key, label, render?(row) }]
 *  fields    [{ name, label, type, options?, required?, hint?, rows?, col?, accept? }]
 *            types: text | email | url | number | date | datetime-local | color | textarea | markdown | select | checkbox | file
 *  toForm(row) / toPayload(form) / emptyForm
 *  multipart  true | 'create' | false   (send FormData)
 *  rowActions [{ label, icon, show?(row), run(row, ctx) }]   ctx = { reload, showModal, toast, send }
 */
export default function ResourceManager({
  title, icon, description, listPath, itemPath, createPath, columns, fields = [], toForm, toPayload, emptyForm = {},
  multipart = false, rowActions = [], canCreate = true, canEdit = true, canDelete = true, singular = 'item',
}) {
  const base = itemPath || createPath;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // { id | null }
  const [form, setForm] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState(null); // { title, node }
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminGet(listPath));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [listPath]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const openCreate = () => { setForm({ ...emptyForm }); setEditing({ id: null }); setFieldErrors({}); setFormError(''); };
  const openEdit = (row) => { setForm(toForm ? toForm(row) : { ...row }); setEditing({ id: row.id }); setFieldErrors({}); setFormError(''); };
  const closeForm = () => setEditing(null);
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const ctx = {
    reload: load,
    toast: setToast,
    showModal: (t, node) => setInfo({ title: t, node }),
    send: adminSend,
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError('');
    const creating = editing.id === null;
    const useMultipart = multipart === true || (multipart === 'create' && creating);
    try {
      const payload = toPayload ? toPayload(form, creating) : form;
      await adminSend(creating ? 'post' : 'put', creating ? createPath : `${base}/${editing.id}`, payload, useMultipart);
      setToast(creating ? `${singular} created.` : `${singular} saved.`);
      closeForm();
      load();
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      const detail = Object.entries(err.fieldErrors || {}).map(([k, v]) => `${k || 'form'}: ${v}`).join(' · ');
      setFormError(detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${singular}? This cannot be undone.`)) return;
    try {
      await adminSend('delete', `${base}/${row.id}`);
      setToast(`${singular} deleted.`);
      load();
    } catch (err) {
      setToast(err.message);
    }
  };

  const renderField = (f) => {
    const id = `f-${f.name}`;
    const err = fieldErrors[f.name];
    const value = form[f.name] ?? '';
    const common = { id, className: `form-control form-control-hw ${err ? 'is-invalid' : ''}`, required: f.required };
    let control;
    switch (f.type) {
      case 'textarea':
        control = <textarea {...common} rows={f.rows || 3} value={value} onChange={(e) => setField(f.name, e.target.value)} />;
        break;
      case 'markdown':
        control = (
          <div className="md-editor">
            <textarea {...common} rows={f.rows || 12} value={value} onChange={(e) => setField(f.name, e.target.value)} placeholder="Write in Markdown: # Heading, **bold**, - lists, [links](https://…), ```code```" />
            <div className="md-preview" aria-label="Preview">
              <div className="md-preview-title">Preview</div>
              {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-muted small mb-0">Nothing to preview yet.</p>}
            </div>
          </div>
        );
        break;
      case 'select':
        control = (
          <select {...common} className={`form-select form-control-hw ${err ? 'is-invalid' : ''}`} value={value} onChange={(e) => setField(f.name, e.target.value)}>
            {f.options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        );
        break;
      case 'checkbox':
        control = (
          <div className="form-check form-switch">
            <input id={id} type="checkbox" className="form-check-input" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked)} />
            <label className="form-check-label" htmlFor={id}>{f.checkLabel || 'Yes'}</label>
          </div>
        );
        break;
      case 'file':
        control = <input {...common} type="file" accept={f.accept} onChange={(e) => setField(f.name, e.target.files[0] || null)} />;
        break;
      default:
        control = <input {...common} type={f.type || 'text'} value={value} onChange={(e) => setField(f.name, e.target.value)} />;
    }
    return (
      <div className={`col-md-${f.col || 12}`} key={f.name}>
        {f.type !== 'checkbox' && <label className="form-label small fw-semibold" htmlFor={id}>{f.label}{f.required ? ' *' : ''}</label>}
        {f.type === 'checkbox' && <div className="form-label small fw-semibold">{f.label}</div>}
        {control}
        {f.hint && !err && <div className="form-text">{f.hint}</div>}
        {err && <div className="invalid-feedback d-block">{err}</div>}
      </div>
    );
  };

  const actionsVisible = canEdit || canDelete || rowActions.length > 0;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1 className="admin-title"><i className={`bi ${icon}`} /> {title}</h1>
          {description && <p className="text-muted mb-0">{description}</p>}
        </div>
        {canCreate && <button type="button" className="btn-hw-primary" onClick={openCreate}><i className="bi bi-plus-lg" /> New {singular}</button>}
      </div>

      {toast && <div className="admin-toast" role="status">{toast}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="admin-card">
        <div className="admin-toolbar">
          <input type="search" className="form-control form-control-hw" placeholder={`Search ${title.toLowerCase()}…`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
          <span className="text-muted small">{visible.length} of {rows.length}</span>
        </div>
        <div className="table-responsive">
          <table className="table admin-table align-middle">
            <thead>
              <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}{actionsVisible && <th className="text-end">Actions</th>}</tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={columns.length + 1} className="text-center text-muted py-4">Loading…</td></tr>}
              {!loading && visible.length === 0 && <tr><td colSpan={columns.length + 1} className="text-center text-muted py-4">Nothing here yet.</td></tr>}
              {visible.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '')}</td>)}
                  {actionsVisible && (
                    <td className="text-end text-nowrap">
                      {rowActions.filter((a) => !a.show || a.show(row)).map((a) => (
                        <button key={a.label} type="button" className="row-btn" title={a.label} onClick={async () => { await a.run(row, ctx); }}>
                          <i className={`bi ${a.icon}`} /><span>{a.label}</span>
                        </button>
                      ))}
                      {canEdit && <button type="button" className="row-btn" title="Edit" onClick={() => openEdit(row)}><i className="bi bi-pencil-square" /><span>Edit</span></button>}
                      {canDelete && <button type="button" className="row-btn danger" title="Delete" onClick={() => remove(row)}><i className="bi bi-trash3" /><span>Delete</span></button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!editing} onClose={closeForm} title={editing?.id === null ? `New ${singular}` : `Edit ${singular}`}>
        <form onSubmit={save} noValidate>
          <div className="row g-3">{fields.map(renderField)}</div>
          {formError && <div className="alert alert-danger mt-3 mb-0 py-2" role="alert">{formError}</div>}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn-hw-outline" onClick={closeForm}>Cancel</button>
            <button type="submit" className="btn-hw-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!info} onClose={() => setInfo(null)} title={info?.title || ''}>{info?.node}</Modal>
    </>
  );
}
