import { useState } from 'react';
import { useAsync } from '../../components/useAsync.js';
import { adminPosts } from '../../api/resources.js';
import type { Post } from '../../api/types.js';

const EMPTY = { title: '', excerpt: '', content: '', tags: '', published: false };

export function PostsAdmin() {
  const { data, loading, error, reload } = useAsync(() => adminPosts.list(), []);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function startCreate() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function startEdit(p: Post) {
    setEditing(p);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content, tags: p.tags.join(', '), published: p.published });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const payload = {
      title: form.title, excerpt: form.excerpt, content: form.content,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      published: form.published,
    };
    try {
      if (editing) await adminPosts.update(editing.id, payload);
      else await adminPosts.create(payload);
      setOpen(false); reload();
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  }

  async function remove(p: Post) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await adminPosts.remove(p.id); reload();
  }

  return (
    <>
      <div className="row spread">
        <h1>Posts</h1>
        <button className="btn btn-primary" onClick={startCreate}>+ New post</button>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="notice err">{error}</div>}

      {data && (
        <table style={{ marginTop: 20 }}>
          <thead><tr><th>Title</th><th>Tags</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.title}</strong></td>
                <td className="muted">{p.tags.join(', ')}</td>
                <td>{p.published ? <span className="badge">Published</span> : <span className="badge warn">Draft</span>}</td>
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
          <form onSubmit={save} className="card stack" style={{ width: 620, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: 0 }}>{editing ? 'Edit post' : 'New post'}</h2>
            {err && <div className="notice err">{err}</div>}
            <label>Title
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>Excerpt
              <input className="input" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </label>
            <label>Content (Markdown)
              <textarea className="textarea" style={{ minHeight: 220 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </label>
            <label>Tags (comma-separated)
              <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </label>
            <label className="row" style={{ gap: 8 }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published
            </label>
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
