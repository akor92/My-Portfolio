import { useAsync } from '../../components/useAsync.js';
import { adminMessages } from '../../api/resources.js';
import type { Message } from '../../api/types.js';

export function MessagesAdmin() {
  const { data, loading, error, reload } = useAsync(() => adminMessages.list(), []);

  async function toggleRead(m: Message) {
    await adminMessages.setRead(m.id, !m.isRead);
    reload();
  }
  async function remove(m: Message) {
    if (!confirm('Delete this message?')) return;
    await adminMessages.remove(m.id);
    reload();
  }

  return (
    <>
      <div className="row spread">
        <h1>Messages</h1>
        {data && <span className="badge">{data.unread} unread</span>}
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="notice err">{error}</div>}
      {data?.items.length === 0 && <p className="muted">No messages yet.</p>}

      <div className="stack" style={{ marginTop: 20 }}>
        {data?.items.map((m) => (
          <div key={m.id} className="card stack" style={{ opacity: m.isRead ? 0.7 : 1 }}>
            <div className="row spread">
              <div>
                <strong>{m.name}</strong>{' '}
                <a href={`mailto:${m.email}`} className="muted">&lt;{m.email}&gt;</a>
                {!m.isRead && <span className="badge" style={{ marginLeft: 10 }}>New</span>}
              </div>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
            {m.subject && <div style={{ fontWeight: 600 }}>{m.subject}</div>}
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.body}</p>
            <div className="row">
              <button className="btn btn-sm" onClick={() => toggleRead(m)}>
                Mark {m.isRead ? 'unread' : 'read'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => remove(m)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
