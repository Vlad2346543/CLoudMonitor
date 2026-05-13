import React, { useState, useEffect, useCallback} from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Button, Modal, FormField, Input, Select, StatusBadge, Table, Loader, Alert, Card, MetricBar} from '../components/ui';
import api from '../services/api';

import css from './ResourcesPage.module.css';
const TYPES = [
  'EC2',
  'S3',
  'RDS',
  'LAMBDA',
  'ECS',
  'EKS',
  'CLOUDFRONT',
  'VPC',
  'OTHER'
];

const STATUSES = [
  'ONLINE',
  'OFFLINE',
  'MAINTENANCE',
  'UNKNOWN'
];

const EMPTY = {
  name: '',
  type: 'EC2',
  status: 'UNKNOWN',
  region: '',
  description: '',
};

export default function ResourcesPage() {
  const { isViewer, isAdmin } = useAuth();

  const [resources, setResources] =
    useState([]);

  const [metrics, setMetrics] =
    useState([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editTarget, setEditTarget] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY);

  const [saving, setSaving] =
    useState(false);

  const [filterStatus, setFilterStatus] =
    useState('');

  const [filterType, setFilterType] =
    useState('');

  const fetchResources = useCallback(
    async () => {
      setLoading(true);

      try {
        const params = {};

        if (filterStatus) {
          params.status = filterStatus;
        }

        if (filterType) {
          params.type = filterType;
        }

        const res = await api.get(
          '/resources',
          { params }
        );

        const metricsRes =
          await api.get(
            '/monitor/metrics'
          );

        setMetrics(metricsRes.data);

        const mergedResources =
        res.data.resources.map(resource => {

        const metric =
            metricsRes.data.find(
              m =>
                m.name === resource.name
            );

          return {
            ...resource,

            cpuUsage:
              metric?.cpuUsage ?? null,

            ramUsage:
              metric?.ramUsage ?? null,
          };
        });

      setResources(mergedResources);
        setTotal(res.data.total);
      } catch {
        setError(
          'Не вдалося завантажити ресурси'
        );
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterType]
  );

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditTarget(r);

    setForm({
      name: r.name,
      type: r.type,
      status: r.status,
      region: r.region || '',
      description:
        r.description || '',
    });

    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      if (editTarget) {
        await api.put(
          `/resources/${editTarget.id}`,
          form
        );

        setSuccess(
          'Ресурс успішно оновлено'
        );
      } else {
        await api.post(
          '/resources',
          form
        );

        setSuccess(
          'Ресурс успішно створено'
        );
      }

      setModalOpen(false);

      fetchResources();

      setTimeout(
        () => setSuccess(''),
        3000
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Помилка збереження'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id,
    name
  ) => {
    if (
      !window.confirm(
        `Видалити ресурс "${name}"?`
      )
    ) return;

    try {
      await api.delete(
        `/resources/${id}`
      );

      setSuccess(
        'Ресурс успішно видалено'
      );

      fetchResources();

      setTimeout(
        () => setSuccess(''),
        3000
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Помилка видалення'
      );
    }
  };

  const columns = [
    {
  key: 'name',
  label: 'НАЗВА',

  render: (v, row) => (
    <div>
      <div className={css.resourceName}>
        {v}
      </div>

      {row.description && (
        <div className={css.resourceDescription}>
          {row.description}
        </div>
      )}
    </div>
  ),
},

{
  key: 'type',
  label: 'ТИП',

  render: v => (
    <span className={css.typeBadge}>
      {v}
    </span>
  ),
},

{
  key: 'status',
  label: 'СТАТУС',

  render: v => (
    <StatusBadge
      status={v}
      pulse={v === 'ONLINE'}
    />
  ),
},

{
  key: 'region',
  label: 'РЕГІОН',

  render: v =>
    v ? (
      <span className={css.regionText}>
        {v}
      </span>
    ) : '—',
},

{
  key: 'cpuUsage',
  label: 'CPU / RAM',

  render: (v, row) =>
    row.cpuUsage !== null ? (
      <div className={css.metricWrapper}>
        <MetricBar
          label="CPU"
          value={row.cpuUsage}
        />

        <MetricBar
          label="RAM"
          value={row.ramUsage}
          color="var(--purple)"
        />
      </div>
    ) : (
      <span className={css.noDataText}>
        Н/Д
      </span>
    ),
},

{
  key: '_count',
  label: 'ДОСТУП',

  render: (v) => (
    <span className={css.accessText}>
      {v?.accesses ?? 0} користувачів
    </span>
  ),
},

!isViewer && {
  key: 'id',
  label: 'ДІЇ',

  render: (id, row) => (
    <div className={css.actions}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          openEdit(row)
        }
      >
        Редагувати
      </Button>

      {isAdmin && (
        <Button
          size="sm"
          variant="danger"
          onClick={() =>
            handleDelete(
              id,
              row.name
            )
          }
        >
          Видалити
        </Button>
      )}
    </div>
  ),
},
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Хмарні ресурси"
        subtitle={`${total} ресурсів`}
        action={
          !isViewer && (
            <Button
              onClick={openCreate}
            >
              + Новий ресурс
            </Button>
          )
        }
      />

     {error && (
  <div className={css.alertWrapper}>
    <Alert
      type="error"
      message={error}
    />
  </div>
)}

{success && (
  <div className={css.alertWrapper}>
    <Alert
      type="success"
      message={success}
    />
  </div>
)}

{/* Фільтри */}
<Card
  style={{
    marginBottom: 20,
  }}
>
  <div className={css.filters}>
    <span className={css.filterLabel}>
      ФІЛЬТР:
    </span>

    <Select
      value={filterStatus}
      onChange={e =>
        setFilterStatus(
          e.target.value
        )
      }
      style={{ width: 140 }}
    >
      <option value="">
        Усі статуси
      </option>

      {STATUSES.map(s => (
        <option
          key={s}
          value={s}
        >
          {s}
        </option>
      ))}
    </Select>

    <Select
      value={filterType}
      onChange={e =>
        setFilterType(
          e.target.value
        )
      }
      style={{ width: 140 }}
    >
      <option value="">
        Усі типи
      </option>

      {TYPES.map(t => (
        <option
          key={t}
          value={t}
        >
          {t}
        </option>
      ))}
    </Select>

    {(filterStatus ||
      filterType) && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setFilterStatus('');
          setFilterType('');
        }}
      >
        ✕ Очистити
      </Button>
    )}

    {/* Статистика */}
          <div className={css.stats}>
            {STATUSES.map(s => (
              <div
                key={s}
                className={css.statItem}
              >
                <StatusBadge
                  status={s}
                />

                <span className={css.statCount}>
                  {
                    resources.filter(
                      r =>
                        r.status === s
                    ).length
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

            <Card
              style={{
                padding: 0,
              }}
            >
              {loading ? (
                <Loader />
              ) : (
                <Table
                  columns={columns}
                  data={resources}
                  emptyMsg="Ресурси не знайдено"
                />
              )}
            </Card>

            {/* Модальне вікно */}
            <Modal
              open={modalOpen}
              onClose={() =>
                setModalOpen(false)
              }
              title={
                editTarget
                  ? 'Редагування ресурсу'
                  : 'Новий ресурс'
              }
            >
            <form
        onSubmit={handleSave}
        className={css.modalForm}
      >
        <FormField label="НАЗВА *">
          <Input
            required
            value={form.name}
            onChange={e =>
              setForm(p => ({
                ...p,
                name:
                  e.target.value,
              }))
            }
            placeholder="prod-web-server-01"
          />
        </FormField>

        <div className={css.modalGrid}>
          <FormField label="ТИП *">
            <Select
              value={form.type}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  type:
                    e.target.value,
                }))
              }
            >
              {TYPES.map(t => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="СТАТУС">
            <Select
              value={form.status}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  status:
                    e.target.value,
                }))
              }
            >
              {STATUSES.map(s => (
                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="РЕГІОН">
          <Input
            value={form.region}
            onChange={e =>
              setForm(p => ({
                ...p,
                region:
                  e.target.value,
              }))
            }
            placeholder="us-east-1"
          />
        </FormField>

        <FormField label="ОПИС">
          <Input
            value={form.description}
            onChange={e =>
              setForm(p => ({
                ...p,
                description:
                  e.target.value,
              }))
            }
            placeholder="Короткий опис..."
          />
        </FormField>

        <div className={css.modalActions}>
          <Button
            variant="secondary"
            onClick={() =>
              setModalOpen(false)
            }
            type="button"
          >
            Скасувати
          </Button>

          <Button
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Збереження...'
              : editTarget
              ? 'Зберегти зміни'
              : 'Створити'}
          </Button>
        </div>
      </form>
      </Modal>
    </div>
  );
}