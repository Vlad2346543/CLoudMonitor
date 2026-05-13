import React from 'react';
import css from './ui.module.css';
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
    <span
      className={css.statusBadge}
      style={{
        background: theme.bg,
        color: theme.color,
      }}
    >
      <span
        className={css.statusDot}
        style={{
          background: theme.dot,
          boxShadow: pulse
            ? `0 0 6px ${theme.dot}`
            : 'none',

          animation:
            pulse &&
            status === 'ONLINE'
              ? 'pulse 2s infinite'
              : 'none',
        }}
      />
      {status}
    </span>
  );
};

// ─── MetricBar ───────────────────────────────────────────────────────────────
export const MetricBar = ({ label, value, color = 'var(--accent)',}) => 
  { const pct = Math.min( 100, Math.max(0, value ?? 0) );
  const barColor =
    pct > 85
      ? 'var(--red)'
      : pct > 65
      ? 'var(--yellow)'
      : color;

  return (
    <div className={css.metricBar}>
      <div className={css.metricHeader}>
        <span>{label}</span>

        <span
          className={css.metricValue}
          style={{ color: barColor }}
        >
          {pct.toFixed(1)}%
        </span>
      </div>

      <div className={css.metricTrack}>
        <div
          className={css.metricFill}
          style={{
            width: `${pct}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
};

// ─── StatCard ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = 'var(--accent)', sub}) => (
  <div
    className={css.statCard}
    onMouseEnter={e =>
      e.currentTarget.style.borderColor =
        color
    }
    onMouseLeave={e =>
      e.currentTarget.style.borderColor =
        'var(--border)'
    }
  >
    <div className={css.statCardTop}>
      <span className={css.statLabel}>
        {label}
      </span>

      <span className={css.statIcon}>
        {icon}
      </span>
    </div>

    <div
      className={css.statValue}
      style={{ color }}
    >
      {value}
    </div>

    {sub && (
      <div className={css.statSub}>
        {sub}
      </div>
    )}
  </div>
);

// ─── PageHeader ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className={css.pageHeader}>
    <div>
      <h1 className={css.pageTitle}>
        {title}
      </h1>

      {subtitle && (
        <p className={css.pageSubtitle}>
          {subtitle}
        </p>
      )}
    </div>

    {action}
  </div>
);

// ─── Table ───────────────────────────────────────────────────────────────────
export const Table = ({ columns, data, emptyMsg = 'No data found'}) => (
  <div className={css.tableWrapper}>
    <table className={css.table}>
      <thead>
        <tr className={css.tableHeadRow}>
          {columns.map(col => (
            <th
              key={col.key}
              className={css.tableHead}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className={css.emptyCell}
            >
              {emptyMsg}
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr
              key={i}
              className={css.tableRow}
              onMouseEnter={e =>
                e.currentTarget.style.background =
                  'var(--bg-card-hover)'
              }
              onMouseLeave={e =>
                e.currentTarget.style.background =
                  'transparent'
              }
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={css.tableCell}
                >
                  {col.render
                    ? col.render(
                        row[col.key],
                        row
                      )
                    : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
// ─── Button ──────────────────────────────────────────────────────────────────
export const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}}) => {
  const variants = {
    primary: css.buttonPrimary,
    secondary: css.buttonSecondary,
    danger: css.buttonDanger,
    ghost: css.buttonGhost,
  };

  const sizes = {
    sm: css.buttonSm,
    md: css.buttonMd,
    lg: css.buttonLg,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`
        ${css.button}
        ${variants[variant]}
        ${sizes[size]}
      `}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.opacity =
            '0.85';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity =
          disabled ? '0.5' : '1';
      }}
    >
      {children}
    </button>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width = 480 }) => {
  if (!open) return null;
  return (
    <div
      className={css.modalOverlay}
      onClick={e =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div
        className={css.modal}
        style={{ width }}
      >
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {title}
          </h3>

          <button
            onClick={onClose}
            className={css.modalClose}
          >
            ✕
          </button>
        </div>
        <div className={css.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── FormField ───────────────────────────────────────────────────────────────
export const FormField = ({ label, children, error
}) => (
  <div className={css.formField}>
    <label className={css.formLabel}>
      {label}
    </label>

    {children}

    {error && (
      <span className={css.formError}>
        {error}
      </span>
    )}
  </div>
);

export const Input = ({ style = {}, ...props}) => (
  <input
    className={css.input}
    style={style}
    onFocus={e =>
      e.target.style.borderColor =
        'var(--accent)'
    }
    onBlur={e =>
      e.target.style.borderColor =
        'var(--border)'
    }
    {...props}
  />
);

export const Select = ({ children, style = {}, ...props
}) => (
  <select
    className={css.select}
    style={style}
    onFocus={e =>
      e.target.style.borderColor =
        'var(--accent)'
    }
    onBlur={e =>
      e.target.style.borderColor =
        'var(--border)'
    }
    {...props}
  >
    {children}
  </select>
);

// ─── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {} }) => (
  <div
    className={css.card}
    style={style}
  >
    {children}
  </div>
);

// ─── Alert ───────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message }) => {
  if (!message) return null;
  const colors = {
    error: 'var(--red)',
    success: 'var(--green)',
    info: 'var(--accent)',
  };
  const bgs = {
    error: 'var(--red-dim)',
    success: 'var(--green-dim)',
    info: 'var(--accent-glow)',
  };
  return (
    <div
      className={css.alert}
      style={{
        background: bgs[type],
        color: colors[type],
        border: `1px solid ${colors[type]}30`,
      }}
    >
      {message}
    </div>
  );
};

// ─── Loader ──────────────────────────────────────────────────────────────────
export const Loader = ({ text = 'Loading...'}) => (
  <div className={css.loader}>
    <span className={css.loaderIcon}>
      ⟳
    </span>
    <style>
      {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}
    </style>

    {text}
  </div>
);
