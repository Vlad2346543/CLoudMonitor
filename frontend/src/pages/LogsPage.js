import React, { useState, useEffect, useCallback } from 'react';

import {
  PageHeader,
  Table,
  Loader,
  Alert,
  Card,
  Button,
  Input,
  Select
} from '../components/ui';

import api from '../services/api';

const ACTION_COLORS = {
  USER_LOGIN: {
    bg: 'rgba(16,185,129,0.1)',
    color: '#10b981',
  },

  USER_REGISTER: {
    bg: 'rgba(59,130,246,0.1)',
    color: '#60a5fa',
  },

  USER_DELETE: {
    bg: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
  },

  USER_ROLE_UPDATE: {
    bg: 'rgba(245,158,11,0.1)',
    color: '#f59e0b',
  },

  RESOURCE_CREATE: {
    bg: 'rgba(6,182,212,0.1)',
    color: '#06b6d4',
  },

  RESOURCE_UPDATE: {
    bg: 'rgba(139,92,246,0.1)',
    color: '#8b5cf6',
  },

  RESOURCE_DELETE: {
    bg: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
  },

  ACCESS_GRANT: {
    bg: 'rgba(16,185,129,0.1)',
    color: '#34d399',
  },

  ACCESS_REVOKE: {
    bg: 'rgba(245,158,11,0.1)',
    color: '#fbbf24',
  },
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 50,
      };

      if (debouncedSearch) {
        params.action = debouncedSearch;
      }

      const res = await api.get('/logs', { params });

      setLogs(res.data.logs);

      setMeta({
        total: res.data.total,
        pages: res.data.pages,
      });
    } catch {
      setError('Не вдалося завантажити журнали');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchLogs, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const ActionBadge = ({ action }) => {
    const theme =
      ACTION_COLORS[action] || {
        bg: 'rgba(100,116,139,0.1)',
        color: '#64748b',
      };

    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          background: theme.bg,
          color: theme.color,
          letterSpacing: '0.04em',
        }}
      >
        {action}
      </span>
    );
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'ЧАС',

      render: v => (
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {new Date(v).toLocaleString()}
        </span>
      ),
    },

    {
      key: 'user',
      label: 'КОРИСТУВАЧ',

      render: (v) =>
        v ? (
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {v.name}
            </div>

            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {v.email}
            </div>
          </div>
        ) : (
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 11,
            }}
          >
            Система
          </span>
        ),
    },

    {
      key: 'action',
      label: 'ДІЯ',

      render: v => (
        <ActionBadge action={v} />
      ),
    },

    {
      key: 'details',
      label: 'ДЕТАЛІ',

      render: v => (
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          {v || '—'}
        </span>
      ),
    },

    {
      key: 'ipAddress',
      label: 'IP АДРЕСА',

      render: v =>
        v ? (
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            {v}
          </span>
        ) : '—',
    },
  ];

  const actionStats = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.action] = (acc[l.action] || 0) + 1;

      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Журнали аудиту"
        subtitle={`${meta.total} записів`}
        action={
          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            <button
              onClick={() =>
                setAutoRefresh(v => !v)
              }
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                cursor: 'pointer',

                background: autoRefresh
                  ? 'var(--green-dim)'
                  : 'var(--bg-card)',

                border: `1px solid ${
                  autoRefresh
                    ? 'rgba(16,185,129,0.4)'
                    : 'var(--border)'
                }`,

                color: autoRefresh
                  ? 'var(--green)'
                  : 'var(--text-secondary)',

                fontFamily: 'var(--font-sans)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {autoRefresh
                ? '⏸ Live режим'
                : '▶ Автооновлення'}
            </button>

            <Button
              variant="secondary"
              onClick={fetchLogs}
            >
              ⟳ Оновити
            </Button>
          </div>
        }
      />

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            message={error}
          />
        </div>
      )}

      {/* Статистика дій */}
      {actionStats.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {actionStats.map(([action, count]) => {
            const theme =
              ACTION_COLORS[action] || {
                bg: 'rgba(100,116,139,0.1)',
                color: '#64748b',
              };

            return (
              <button
                key={action}
                onClick={() =>
                  setSearch(
                    search === action ? '' : action
                  )
                }
                style={{
                  padding: '6px 12px',
                  borderRadius:
                    'var(--radius-sm)',

                  border: `1px solid ${theme.color}30`,

                  background:
                    search === action
                      ? theme.bg
                      : 'var(--bg-card)',

                  color: theme.color,

                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,

                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {action}

                <span
                  style={{
                    background: theme.bg,
                    borderRadius: 10,
                    padding: '1px 6px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Пошук */}
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            ПОШУК ДІЇ:
          </span>

          <Input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Наприклад LOGIN, RESOURCE..."
            style={{ maxWidth: 280 }}
          />

          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
            >
              ✕ Очистити
            </Button>
          )}

          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}
          >
            Показано {logs.length} з {meta.total}
          </span>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={logs}
            emptyMsg="Записів журналу не знайдено"
          />
        )}
      </Card>

      {/* Пагінація */}
      {meta.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginTop: 20,
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() =>
              setPage(p => p - 1)
            }
          >
            ← Назад
          </Button>

          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Сторінка {page} з {meta.pages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={page === meta.pages}
            onClick={() =>
              setPage(p => p + 1)
            }
          >
            Далі →
          </Button>
        </div>
      )}
    </div>
  );
}