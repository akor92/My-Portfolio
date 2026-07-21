import { useState } from 'react';
import { useAsync } from '../../components/useAsync.js';
import { adminProjects } from '../../api/resources.js';
import type { Project } from '../../api/types.js';

const EMPTY = {
  title: '', summary: '', description: '', techStack: '',
  repoUrl: '', liveUrl: '', featured: false, published: false,
};

export function ProjectsAdmin() {
  const { data, loading, error, reload } = useAsync(() => adminProjects.list(), []);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function startEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title, summary: p.summary, description: p.description,
      techStack: p.techStack.join(', '), repoUrl: p.repoUrl ?? '',
      liveUrl: p.liveUrl ?? '', featured: p.featured, published: p.published,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const payload = {
      title: form.title,
      summary: form.summary,
      description: form.description,
      techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      repoUrl: form.repoUrl,
      liveUrl: form.liveUrl,
      featured: form.featured,
      published: form.published,
    };
    try {
      if (editing) await adminProjects.update(editing.id, payload);
      else await adminProjects.create(payload);
      setOpen(false);
      reload();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Project) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await adminProjects.remove(p.id);
    reload();
  }

  return (
    <>
      <div className="row spread">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={startCreate}>+ New project</button>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="notice err">{error}</div>}

      {data && (
        <table style={{ marginTop: 20 }}>
          <thead>
            <tr><th>Title</th><th>Stack</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.title}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>{p.summary}</div>
                </td>
                <td className="muted">{p.techStack.join(', ')}</td>
                <td>
                  {p.published ? <span className="badge">Published</span> : <span className="badge warn">Draft</span>}
                  {p.featured && <span className="badge" style={{ marginLeft: 6 }}>★</span>}
                </td>
                <td className="row">
                  <button className="btn btn-sm" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <div className="center-screen" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50 }}>
          <form onSubmit={save} className="card stack" style={{ width: 560, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: 0 }}>{editing ? 'Edit project' : 'New project'}</h2>
            {err && <div className="notice err">{err}</div>}
            <label>Title
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>Summary
              <input className="input" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </label>
            <label>Description
              <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label>Tech stack (comma-separated)
              <input className="input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
            </label>
            <div className="grid grid-2">
              <label>Repo URL
                <input className="input" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
              </label>
              <label>Live URL
                <input className="input" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
              </label>
            </div>
            <div className="row" style={{ gap: 24 }}>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
              </label>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published
              </label>
            </div>
            <div className="row spread">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
