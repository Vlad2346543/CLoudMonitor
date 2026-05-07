import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: '#0f172a', border: '1px solid #1e2d45',
    borderRadius: 8, color: '#e2e8f0', fontSize: 14,
    fontFamily: 'DM Sans, sans-serif', outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), #0a0f1e',
      padding: 16,
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative',
        background: '#141d2e', border: '1px solid #1e2d45',
        borderRadius: 14, padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8, filter: 'drop-shadow(0 0 12px #3b82f6)' }}>⬡</div>
          <h1 style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', color: '#e2e8f0' }}>CloudGuard</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Cloud Resource Management</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.05em' }}>EMAIL</label>
            <input
              type="email" required value={form.email} placeholder="admin@cloudguard.io"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#1e2d45'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.05em' }}>PASSWORD</label>
            <input
              type="password" required value={form.password} placeholder="••••••••"
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#1e2d45'}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4, padding: '12px', background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = '#2563eb'; }}
            onMouseLeave={e => { e.target.style.background = '#3b82f6'; }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: 24, padding: '14px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e2d45' }}>
          <p style={{ fontSize: 11, color: '#64748b', fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>DEMO CREDENTIALS</p>
          {[
            { label: 'Admin', email: 'admin@cloudguard.io', pass: 'admin123' },
            { label: 'User', email: 'alice@cloudguard.io', pass: 'user123' },
          ].map(c => (
            <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#475569' }}>{c.label}: <span style={{ color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 10 }}>{c.email}</span></span>
              <button
                onClick={() => setForm({ email: c.email, password: c.pass })}
                style={{ fontSize: 10, padding: '2px 7px', background: 'transparent', border: '1px solid #1e2d45', borderRadius: 4, color: '#3b82f6', cursor: 'pointer', fontFamily: 'DM Sans' }}
              >
                Use
              </button>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#475569' }}>
          No account? <Link to="/register" style={{ color: '#60a5fa' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
