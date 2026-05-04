import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎫</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b' }}>SupportDesk</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Sign in to your account</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            No account? <Link href="/register" style={{ color: '#2563eb', fontWeight: 500 }}>Register</Link>
          </p>
          <div style={{ marginTop: 20, padding: '14px', background: '#f8fafc', borderRadius: 8, fontSize: 12 }}>
            <strong style={{ color: '#64748b' }}>Test Credentials:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {[['Admin','admin@ticketing.com','admin123'],['Agent','agent@ticketing.com','agent123'],['User','user@ticketing.com','user123']].map(([role, e, p]) => (
                <button key={role} onClick={() => quickLogin(e, p)}
                  style={{ textAlign: 'left', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', color: '#475569', fontSize: 12 }}>
                  <strong>{role}:</strong> {e} / {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
