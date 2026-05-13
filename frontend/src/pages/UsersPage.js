import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Table, StatusBadge, Button, Modal, Select, FormField, Loader, Alert, Card } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import css from './UsersPage.module.css';
const ROLES = [
  'ADMIN',
  'USER',
  'VIEWER'
];

export default function UsersPage() {
  const { user: me } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [roleModal, setRoleModal] =
    useState(null);

  const [newRole, setNewRole] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const fetchUsers = useCallback(
    async () => {
      setLoading(true);

      try {
        const res = await api.get(
          '/users'
        );

        setUsers(res.data);
      } catch {
        setError(
          'Не вдалося завантажити користувачів'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openRoleModal = (u) => {
    setRoleModal(u);
    setNewRole(u.role);
  };

  const handleRoleUpdate =
    async () => {
      setSaving(true);

      try {
        await api.patch(
          `/users/${roleModal.id}/role`,
          { role: newRole }
        );

        setSuccess(
          `Роль для ${roleModal.email} оновлено`
        );

        setRoleModal(null);

        fetchUsers();

        setTimeout(
          () => setSuccess(''),
          3000
        );
      } catch (err) {
        setError(
          err.response?.data?.error ||
          'Не вдалося оновити роль'
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete = async (
    id,
    email
  ) => {
    if (
      !window.confirm(
        `Видалити користувача "${email}"? Цю дію неможливо скасувати.`
      )
    ) return;

    try {
      await api.delete(
        `/users/${id}`
      );

      setSuccess(
        `Користувача ${email} видалено`
      );

      fetchUsers();

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

  const roleCounts = ROLES.reduce(
    (acc, r) => ({
      ...acc,
      [r]: users.filter(
        u => u.role === r
      ).length,
    }),
    {}
  );

  const columns = [
    {
      key: 'name',
      label: 'КОРИСТУВАЧ',

      render: (v, row) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,

              borderRadius: '50%',

              background:
                row.id === me?.id
                  ? 'var(--accent)'
                  : 'var(--bg-secondary)',

              border:
                '1px solid var(--border)',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              fontWeight: 700,
              fontSize: 13,

              color:
                row.id === me?.id
                  ? '#fff'
                  : 'var(--text-secondary)',
            }}
          >
            {v?.[0]?.toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
              }}
            >
              {v}{' '}

              {row.id === me?.id && (
                <span
                  style={{
                    fontSize: 10,
                    color:
                      'var(--accent)',

                    fontFamily:
                      'var(--font-mono)',
                  }}
                >
                  (ви)
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: 11,
                color:
                  'var(--text-muted)',

                fontFamily:
                  'var(--font-mono)',
              }}
            >
              {row.email}
            </div>
          </div>
        </div>
      ),
    },

    {
      key: 'role',
      label: 'РОЛЬ',

      render: v => (
        <StatusBadge status={v} />
      ),
    },

    {
      key: 'createdAt',
      label: 'ДАТА РЕЄСТРАЦІЇ',

      render: v => (
        <span
          style={{
            fontSize: 12,
            color:
              'var(--text-muted)',

            fontFamily:
              'var(--font-mono)',
          }}
        >
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },

    {
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
              openRoleModal(row)
            }
          >
            Змінити роль
          </Button>

          {row.id !== me?.id && (
            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                handleDelete(
                  id,
                  row.email
                )
              }
            >
              Видалити
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Керування користувачами"
        subtitle={`${users.length} зареєстрованих користувачів`}
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

      {/* Статистика ролей */}
      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(3, 1fr)',

          gap: 14,
          marginBottom: 24,
        }}
      >
        {ROLES.map(role => {
          const colors = {
            ADMIN:
              'var(--purple)',

            USER:
              'var(--accent)',

            VIEWER:
              'var(--green)',
          };

          return (
            <div
              key={role}
              style={{
                background:
                  'var(--bg-card)',

                border:
                  '1px solid var(--border)',

                borderRadius:
                  'var(--radius)',

                padding: '16px 20px',

                display: 'flex',
                justifyContent:
                  'space-between',

                alignItems:
                  'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,

                    color:
                      'var(--text-muted)',

                    fontFamily:
                      'var(--font-mono)',

                    marginBottom: 4,
                  }}
                >
                  {role}S
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,

                    fontFamily:
                      'var(--font-mono)',

                    color:
                      colors[role],
                  }}
                >
                  {roleCounts[role]}
                </div>
              </div>

              <StatusBadge
                status={role}
              />
            </div>
          );
        })}
      </div>

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
            data={users}
            emptyMsg="Користувачів не знайдено"
          />
        )}
      </Card>

      {/* Модальне вікно */}
      <Modal
        open={!!roleModal}
        onClose={() =>
          setRoleModal(null)
        }
        title="Зміна ролі користувача"
        width={380}
      >
        {roleModal && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div
              style={{
                padding: '12px 14px',

                background:
                  'var(--bg-secondary)',

                borderRadius:
                  'var(--radius-sm)',

                border:
                  '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {roleModal.name}
              </div>

              <div
                style={{
                  fontSize: 11,

                  color:
                    'var(--text-muted)',

                  fontFamily:
                    'var(--font-mono)',
                }}
              >
                {roleModal.email}
              </div>
            </div>

            <FormField label="НОВА РОЛЬ">
              <Select
                value={newRole}
                onChange={e =>
                  setNewRole(
                    e.target.value
                  )
                }
              >
                {ROLES.map(r => (
                  <option
                    key={r}
                    value={r}
                  >
                    {r}
                  </option>
                ))}
              </Select>
            </FormField>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',

                gap: 10,
              }}
            >
              <Button
                variant="secondary"
                onClick={() =>
                  setRoleModal(null)
                }
              >
                Скасувати
              </Button>

              <Button
                onClick={
                  handleRoleUpdate
                }
                disabled={
                  saving ||
                  newRole ===
                    roleModal.role
                }
              >
                {saving
                  ? 'Збереження...'
                  : 'Оновити роль'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}