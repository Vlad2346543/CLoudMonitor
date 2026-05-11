import React, {
  useState,
  useEffect,
  useCallback
} from 'react';

import { useAuth } from '../context/AuthContext';

import {
  PageHeader,
  Button,
  Modal,
  FormField,
  Input,
  Select,
  StatusBadge,
  Table,
  Loader,
  Alert,
  Card,
  MetricBar
} from '../components/ui';

import api from '../services/api';

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

        setResources(res.data.resources);
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
          <div
            style={{
              fontWeight: 600,
              color:
                'var(--text-primary)',
            }}
          >
            {v}
          </div>

          {row.description && (
            <div
              style={{
                fontSize: 11,
                color:
                  'var(--text-muted)',

                marginTop: 2,
              }}
            >
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
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',

            background:
              'var(--bg-secondary)',

            border:
              '1px solid var(--border)',

            borderRadius: 4,

            fontFamily:
              'var(--font-mono)',

            color:
              'var(--text-secondary)',
          }}
        >
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
          <span
            style={{
              fontFamily:
                'var(--font-mono)',

              fontSize: 11,
              color:
                'var(--text-muted)',
            }}
          >
            {v}
          </span>
        ) : '—',
    },

    {
      key: 'cpuUsage',
      label: 'CPU / RAM',

      render: (v, row) =>
        row.cpuUsage !== null ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 100,
            }}
          >
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
          <span
            style={{
              color:
                'var(--text-muted)',

              fontSize: 11,
            }}
          >
            Н/Д
          </span>
        ),
    },

    {
      key: '_count',
      label: 'ДОСТУП',

      render: (v) => (
        <span
          style={{
            fontFamily:
              'var(--font-mono)',

            fontSize: 12,
            color:
              'var(--text-secondary)',
          }}
        >
          {v?.accesses ?? 0} користувачів
        </span>
      ),
    },

    !isViewer && {
      key: 'id',
      label: 'ДІЇ',

      render: (id, row) => (
        <div
          style={{
            display: 'flex',
            gap: 6,
          }}
        >
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
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <Alert
            type="error"
            message={error}
          />
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: 16,
          }}
        >
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
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color:
                'var(--text-muted)',

              fontFamily:
                'var(--font-mono)',
            }}
          >
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
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: 12,
            }}
          >
            {STATUSES.map(s => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems:
                    'center',

                  gap: 5,
                }}
              >
                <StatusBadge
                  status={s}
                />

                <span
                  style={{
                    fontSize: 11,
                    color:
                      'var(--text-muted)',
                  }}
                >
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
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',

              gap: 12,
            }}
          >
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

          <div
            style={{
              display: 'flex',
              justifyContent:
                'flex-end',

              gap: 10,
              marginTop: 4,
            }}
          >
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