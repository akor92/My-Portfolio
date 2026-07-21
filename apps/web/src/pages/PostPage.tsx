import { useParams, Link } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav.js';
import { useAsync } from '../components/useAsync.js';
import { publicApi } from '../api/resources.js';
import type { Post } from '../api/types.js';

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, loading, error } = useAsync<Post>(() => publicApi.post(slug!), [slug]);

  return (
    <>
      <SiteNav />
      <article className="container" style={{ maxWidth: 760, padding: '48px 24px' }}>
        <Link to="/#writing" className="muted">← Back</Link>
        {loading && <p className="muted">Loading…</p>}
        {error && <div className="notice err">Post not found.</div>}
        {post && (
          <>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6, margin: '20px 0 8px' }}>
              {post.tags.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
            <h1 style={{ letterSpacing: '-0.02em' }}>{post.title}</h1>
            {post.publishedAt && (
              <p className="muted">{new Date(post.publishedAt).toLocaleDateString()}</p>
            )}
            {/* Content is plain text/markdown-source; rendered as pre-wrap for the MVP. */}
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 24, lineHeight: 1.8 }}>
              {post.content}
            </div>
          </>
        )}
      </article>
    </>
  );
}
