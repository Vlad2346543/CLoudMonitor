import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard, MetricBar, Card, Loader, Alert, PageHeader, StatusBadge } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const generateHistory = (base, points = 12) =>
  Array.from({ length: points }, (_, i) => ({
    time: `${i * 5}m`,
    cpu: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 20)),
    ram: Math.max(0, Math.min(100, (base + 20) + (Math.random() - 0.5) * 10)),
  }));

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState(generateHistory(35));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [ovRes, mRes] = await Promise.all([
        api.get('/monitor/overview'),
        api.get('/monitor/metrics'),
      ]);
      setOverview(ovRes.data);
      setMetrics(mRes.data);
      setLastUpdated(new Date());
      setHistory(prev => {
        const next = [...prev.slice(1), {
          time: 'now',
          cpu: ovRes.data.system.cpu,
          ram: ovRes.data.system.ram,
        }];
        return next;
      });
      setError('');
    } catch {
      setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <Loader text="Loading dashboard..." />;

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name.toUpperCase()}: {p.value?.toFixed(1)}%
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Real-time cloud infrastructure overview"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={fetchData} style={{
              padding: '7px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ⟳ Refresh
            </button>
          </div>
        }
      />

      {error && <Alert type="error" message={error} />}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="TOTAL RESOURCES" value={overview?.resources?.total ?? '—'} icon="◈" color="var(--accent)" sub={`${overview?.resources?.online ?? 0} online`} />
        <StatCard label="ONLINE" value={overview?.resources?.online ?? '—'} icon="◉" color="var(--green)" sub="Healthy" />
        <StatCard label="OFFLINE" value={overview?.resources?.offline ?? '—'} icon="◌" color="var(--red)" sub="Requires attention" />
        <StatCard label="MAINTENANCE" value={overview?.resources?.maintenance ?? '—'} icon="◑" color="var(--yellow)" sub="Scheduled" />
        {isAdmin && <StatCard label="TOTAL USERS" value={overview?.users?.total ?? '—'} icon="◉" color="var(--purple)" sub="Registered" />}
        {isAdmin && <StatCard label="ACTIVITY (24h)" value={overview?.activity?.logsLast24h ?? '—'} icon="≡" color="var(--cyan)" sub="Log entries" />}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>SYSTEM LOAD HISTORY</h3>
            <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3b82f6' }}><span style={{ width: 10, height: 2, background: '#3b82f6', display: 'inline-block' }} /> CPU</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8b5cf6' }}><span style={{ width: 10, height: 2, background: '#8b5cf6', display: 'inline-block' }} /> RAM</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={customTooltip} />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fill="url(#cpu)" dot={false} />
              <Area type="monotone" dataKey="ram" stroke="#8b5cf6" strokeWidth={2} fill="url(#ram)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', marginBottom: 20 }}>SYSTEM RESOURCES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <MetricBar label="CPU Usage" value={overview?.system?.cpu} color="var(--accent)" />
            <MetricBar label="RAM Usage" value={overview?.system?.ram} color="var(--purple)" />
            <MetricBar label="Disk Usage" value={overview?.system?.disk} color="var(--cyan)" />
            <MetricBar label="Network I/O" value={overview?.system?.network} color="var(--green)" />
          </div>
        </Card>
      </div>

      {/* Resource metrics table */}
      {metrics.length > 0 && (
        <Card>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', marginBottom: 16 }}>RESOURCE METRICS</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['RESOURCE', 'TYPE', 'CPU', 'RAM', 'NET IN (KB/s)', 'NET OUT (KB/s)'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, padding: '2px 7px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{m.type}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {m.cpuUsage !== null ? (
                        <span style={{ color: m.cpuUsage > 80 ? 'var(--red)' : m.cpuUsage > 60 ? 'var(--yellow)' : 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.cpuUsage?.toFixed(1)}%</span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {m.ramUsage !== null ? (
                        <span style={{ color: m.ramUsage > 80 ? 'var(--red)' : m.ramUsage > 60 ? 'var(--yellow)' : 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.ramUsage?.toFixed(1)}%</span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{m.networkIn}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{m.networkOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
