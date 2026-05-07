import React from 'react';

// ─── StatusBadge ────────────────────────────────────────────────────────────
const statusColors = {
  ONLINE: { bg: 'var(--green-dim)', color: 'var(--green)', dot: 'var(--green)' },
  OFFLINE: { bg: 'var(--red-dim)', color: 'var(--red)', dot: 'var(--red)' },
  MAINTENANCE: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', dot: 'var(--yellow)' },
  UNKNOWN: { bg: 'rgba(100,116,139,0.15)', color: '#64748b', dot: '#64748b' },
  ADMIN: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', dot: '#a78bfa' },
  USER: { bg: 'var(--accent-glow)', color: 'var(--accent-light)', dot: 'var(--accent-light)' },
  VIEWER: { bg: 'var(--green-dim)', color: '#34d399', dot: '#34d399' },
  OWNER: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa', dot: '#a78bfa' },
  EDITOR: { bg: 'var(--accent-glow)', color: 'var(--accent-light)', dot: 'var(--accent-light)' },
};

export const StatusBadge = ({ status, pulse = false }) => {
  const theme = statusColors[status] || statusColors.UNKNOWN;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: theme.bg, color: theme.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      fontFamily: 'var(--font-mono)',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: theme.dot,
        boxShadow: pulse ? `0 0 6px ${theme.dot}` : 'none',
        animation: pulse && status === 'ONLINE' ? 'pulse 2s infinite' : 'none',
      }} />
      {status}
    </span>
  );
};

// ─── MetricBar ───────────────────────────────────────────────────────────────
export const MetricBar = ({ label, value, color = 'var(--accent)' }) => {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const barColor = pct > 85 ? 'var(--red)' : pct > 65 ? 'var(--yellow)' : color;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span style={{ color: barColor, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

// ─── StatCard ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = 'var(--accent)', sub }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: 20, opacity: 0.7 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

// ─── PageHeader ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Table ───────────────────────────────────────────────────────────────────
export const Table = ({ columns, data, emptyMsg = 'No data found' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {columns.map(col => (
            <th key={col.key} style={{
              padding: '10px 14px', textAlign: 'left', fontWeight: 600,
              color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.06em',
              whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)',
            }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>{emptyMsg}</td></tr>
        ) : data.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {columns.map(col => (
              <td key={col.key} style={{ padding: '11px 14px', color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Button ──────────────────────────────────────────────────────────────────
export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, style = {} }) => {
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: '1px solid transparent' },
    secondary: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger: { background: 'transparent', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.4)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 18px', fontSize: 13 },
    lg: { padding: '11px 24px', fontSize: 14 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant], ...sizes[size],
        borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-sans)', fontWeight: 600, transition: 'all 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.5' : '1'; }}
    >
      {children}
    </button>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      z: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width, maxWidth: '100%',
        maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  );
};

// ─── FormField ───────────────────────────────────────────────────────────────
export const FormField = ({ label, children, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>{label}</label>
    {children}
    {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
  </div>
);

export const Input = ({ style = {}, ...props }) => (
  <input style={{
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '9px 12px',
    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
    outline: 'none', width: '100%', transition: 'border-color 0.15s', ...style,
  }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
    {...props}
  />
);

export const Select = ({ children, style = {}, ...props }) => (
  <select style={{
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '9px 12px',
    color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
    outline: 'none', width: '100%', cursor: 'pointer', ...style,
  }}
    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
    {...props}
  >
    {children}
  </select>
);

// ─── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 22, ...style,
  }}>
    {children}
  </div>
);

// ─── Alert ───────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message }) => {
  if (!message) return null;
  const colors = { error: 'var(--red)', success: 'var(--green)', info: 'var(--accent)' };
  const bgs = { error: 'var(--red-dim)', success: 'var(--green-dim)', info: 'var(--accent-glow)' };
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: bgs[type], color: colors[type],
      fontSize: 13, border: `1px solid ${colors[type]}30`,
    }}>
      {message}
    </div>
  );
};

// ─── Loader ──────────────────────────────────────────────────────────────────
export const Loader = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    {text}
  </div>
);
