import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate('/admin', { replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-screen">
      <div className="card stack" style={{ width: 360 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin sign in</h1>
          <p className="muted" style={{ marginTop: 6 }}>Manage projects, posts, and messages.</p>
        </div>
        {error && <div className="notice err">{error}</div>}
        <form onSubmit={submit}>
          <label>
            Email
            <input className="input" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input className="input" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
