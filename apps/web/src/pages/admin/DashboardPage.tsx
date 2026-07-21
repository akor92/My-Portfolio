import { useAsync } from '../../components/useAsync.js';
import { adminProjects, adminPosts, adminMessages } from '../../api/resources.js';

export function DashboardPage() {
  const projects = useAsync(() => adminProjects.list(), []);
  const posts = useAsync(() => adminPosts.list(), []);
  const messages = useAsync(() => adminMessages.list(), []);

  const stats = [
    { label: 'Projects', value: projects.data?.total, sub: `${projects.data?.items.filter((p) => p.published).length ?? 0} published` },
    { label: 'Posts', value: posts.data?.total, sub: `${posts.data?.items.filter((p) => p.published).length ?? 0} published` },
    { label: 'Messages', value: messages.data?.total, sub: `${messages.data?.unread ?? 0} unread` },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <p className="muted">A quick overview of your portfolio content.</p>
      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="muted" style={{ margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: '2.4rem', fontWeight: 800, margin: '6px 0 0' }}>
              {s.value ?? '—'}
            </p>
            <p className="muted" style={{ margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}
