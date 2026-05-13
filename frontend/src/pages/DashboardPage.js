import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard, MetricBar, Card, Loader, Alert, PageHeader, StatusBadge } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer} from 'recharts';
import css from './DashboardPage.module.css';
import api from '../services/api';



export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const [overview, setOverview] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [history, setHistory] = useState([]);
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

          const cpu =
            mRes.data?.[0]?.cpuUsage || 0;

          const ram =
            mRes.data?.[0]?.ramUsage || 0;

          const next = [
            ...prev.slice(-11),
            {
              time: new Date().toLocaleTimeString(),
              cpu,
              ram,
            },
          ];

  return next;
});

      setError('');
    } catch {
      setError('Не вдалося завантажити дані моніторингу');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 15000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return <Loader text="Завантаження панелі..." />;
  }

const customTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={css.chartTooltip}>
      {payload.map(p => (
        <div
          key={p.name}
          className={css.chartTooltipItem}
          style={{ color: p.color }}
        >
          {p.name.toUpperCase()}: {p.value?.toFixed(1)}%
        </div>
      ))}
    </div>
  );
};

return (
  <div>
    <PageHeader
      title={`З поверненням, ${user?.name?.split(' ')[0]}`}
      subtitle="Моніторинг хмарної інфраструктури у реальному часі"
      action={
        <div className={css.headerActions}>
          {lastUpdated && (
            <span className={css.lastUpdated}>
              Оновлено {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={fetchData}
            className={css.refreshButton}
          >
            ⟳ Оновити
          </button>
        </div>
      }
    />

    {error && (
      <Alert type="error" message={error} />
    )}

    {/* Статистика */}
    <div className={css.statsGrid}>
      <StatCard
        label="УСЬОГО РЕСУРСІВ"
        value={overview?.resources?.total ?? '—'}
        color="var(--white)"
        sub={`${overview?.resources?.online ?? 0} онлайн`}
      />

      <StatCard
        label="ОНЛАЙН"
        value={overview?.resources?.online ?? '—'}
        color="var(--white)"
        sub="Працюють"
      />

      <StatCard
        label="ОФЛАЙН"
        value={overview?.resources?.offline ?? '—'}
        color="var(--white)"
        sub="Потребують уваги"
      />

      <StatCard
        label="ОБСЛУГОВУВАННЯ"
        value={overview?.resources?.maintenance ?? '—'}
        color="var(--white)"
        sub="Заплановано"
      />

      {isAdmin && (
        <StatCard
          label="УСЬОГО КОРИСТУВАЧІВ"
          value={overview?.users?.total ?? '—'}
          color="var(--white)"
          sub="Зареєстровано"
        />
      )}

      {isAdmin && (
        <StatCard
          label="АКТИВНІСТЬ (24г)"
          value={overview?.activity?.logsLast24h ?? '—'}
          color="var(--white)"
          sub="Записів журналу"
        />
      )}
    </div>

    {/* Графіки */}
    <div className={css.chartsGrid}>
      <Card>
        <div className={css.chartHeader}>
          <h3 className={css.chartTitle}>
            ІСТОРІЯ НАВАНТАЖЕННЯ СИСТЕМИ
          </h3>

          <div className={css.chartLegend}>
            <span className={`${css.legendItem} ${css.legendCpu}`}>
              <span className={`${css.legendLine} ${css.legendCpuLine}`} />
              CPU
            </span>

            <span className={`${css.legendItem} ${css.legendRam}`}>
              <span className={`${css.legendLine} ${css.legendRamLine}`} />
              RAM
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={history}>

            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 10, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />

            <Tooltip content={customTooltip} />

            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#0062ff"
              strokeWidth={2}
              fill="url(#cpu)"
              dot={false}
            />

            <Area
              type="monotone"
              dataKey="ram"
              stroke="#fff200"
              strokeWidth={2}
              fill="url(#ram)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className={css.systemTitle}>
          СИСТЕМНІ РЕСУРСИ
        </h3>

        <div className={css.metricsList}>
          <MetricBar
            label="Використання CPU"
            value={metrics?.[0]?.cpuUsage || 0}
            color="var(--white)"
          />

          <MetricBar
            label="Використання RAM"
            value={metrics?.[0]?.ramUsage || 0}
            color="var(--white)"
          />

          <MetricBar
            label="Використання диска"
            value={overview?.system?.disk}
            color="var(--white)"
          />

          <MetricBar
            label="Мережева активність"
            value={metrics?.[0]?.networkOut || 0}
            color="var(--white)"
          />
        </div>
      </Card>
    </div>
  </div>
);
}