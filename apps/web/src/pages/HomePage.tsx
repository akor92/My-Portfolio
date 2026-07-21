import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav.js';
import { useAsync } from '../components/useAsync.js';
import { publicApi } from '../api/resources.js';
import type { Post, Project } from '../api/types.js';

export function HomePage() {
  const projects = useAsync<{ items: Project[] }>(() => publicApi.projects(), []);
  const posts = useAsync<{ items: Post[] }>(() => publicApi.posts(), []);

  return (
    <>
      <SiteNav />

      {/* Hero */}
      <header className="hero">
        <div className="container">
          <span className="badge">DevOps Engineer</span>
          <h1 style={{ marginTop: 16 }}>
            Hi, I'm Akor. I build <span className="accent">automated, containerized</span> infrastructure.
          </h1>
          <p>
            I design CI/CD pipelines and cloud-native systems — from Dockerfiles to Kubernetes
            rollouts. This site itself ships through a Jenkins → Docker → Kubernetes pipeline.
          </p>
          <div className="row" style={{ marginTop: 24 }}>
            <a className="btn btn-primary" href="#projects">
              View projects
            </a>
            <a className="btn" href="#contact">
              Get in touch
            </a>
          </div>
        </div>
      </header>

      {/* Projects */}
      <section id="projects">
        <div className="container">
          <h2 className="section-title">Selected projects</h2>
          {projects.loading && <p className="muted">Loading projects…</p>}
          {projects.error && <div className="notice err">Couldn't load projects: {projects.error}</div>}
          <div className="grid grid-3">
            {projects.data?.items.map((p) => (
              <article key={p.id} className="card stack">
                <div className="row spread">
                  {p.featured && <span className="badge">Featured</span>}
                </div>
                <h3 style={{ margin: 0 }}>{p.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{p.summary}</p>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {p.techStack.map((t) => (
                    <span key={t} className="badge warn">{t}</span>
                  ))}
                </div>
                <div className="row" style={{ marginTop: 'auto' }}>
                  {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer">Code ↗</a>}
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Live ↗</a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Writing */}
      <section id="writing">
        <div className="container">
          <h2 className="section-title">Writing</h2>
          {posts.data?.items.length === 0 && <p className="muted">No posts yet.</p>}
          <div className="grid grid-2">
            {posts.data?.items.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card stack">
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {post.tags.map((t) => (
                    <span key={t} className="badge">{t}</span>
                  ))}
                </div>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>{post.title}</h3>
                <p className="muted" style={{ margin: 0 }}>{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />

      <footer className="footer">
        <div className="container row spread">
          <span>© {new Date().getFullYear()} Akor Innocent Oboche</span>
          <Link to="/login" className="muted">Admin</Link>
        </div>
      </footer>
    </>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await publicApi.sendMessage(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  }

  return (
    <section id="contact">
      <div className="container" style={{ maxWidth: 620 }}>
        <h2 className="section-title">Get in touch</h2>
        {status === 'sent' && <div className="notice ok" style={{ marginBottom: 16 }}>Thanks — your message has been sent.</div>}
        {status === 'error' && <div className="notice err" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={submit} className="card">
          <div className="grid grid-2">
            <label>
              Name
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Email
              <input className="input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
          </div>
          <label>
            Subject
            <input className="input" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <label>
            Message
            <textarea className="textarea" required value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>
          <button className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
