import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Table, Loader, Alert, Card, Button, Input, Select} from '../components/ui';
import css from './LogsPage.module.css';
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
        className={css.actionBadge}
        style={{
          background: theme.bg,
          color: theme.color,
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
        <span className={css.timeText}>
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
            <div className={css.userName}>
              {v.name}
            </div>

            <div className={css.userEmail}>
              {v.email}
            </div>
          </div>
        ) : (
          <span className={css.systemText}>
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
        <span className={css.detailsText}>
          {v || '—'}
        </span>
      ),
    },

    {
      key: 'ipAddress',
      label: 'IP АДРЕСА',

      render: v =>
        v ? (
          <span className={css.ipText}>
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
      {/* твій JSX тут */}
    </div>
  );
}