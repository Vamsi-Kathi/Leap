import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎫</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 12 }}>SupportDesk</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: 40, maxWidth: 480 }}>
          A modern ticketing system with role-based access. Raise, manage, and resolve support tickets with ease.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login">
            <button style={{ padding: '14px 32px', background: '#fff', color: '#2563eb', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Sign In</button>
          </Link>
          <Link href="/register">
            <button style={{ padding: '14px 32px', background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Register</button>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 60, maxWidth: 600 }}>
          {[['🔐','Role-based Access','Admin, Agent, User roles with proper permissions'],['🎫','Ticket Lifecycle','Open → In Progress → Resolved → Closed'],['⭐','Ratings & Feedback','Users can rate resolved tickets 1-5 stars']].map(([icon, title, desc]) => (
            <div key={title} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
