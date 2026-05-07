import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Button, Modal, FormField, Select, StatusBadge, Table, Loader, Alert, Card } from '../components/ui';
import api from '../services/api';

const ACCESS_ROLES = ['OWNER', 'EDITOR', 'VIEWER'];

export default function AccessPage() {
  const [accesses, setAccesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', resourceId: '', role: 'VIEWER' });
  const [saving, setSaving] = useState(false);
  const [filterResource, setFilterResource] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [acRes, uRes, rRes] = await Promise.all([
        api.get('/access'),
        api.get('/users'),
        api.get('/resources'),
      ]);
      setAccesses(acRes.data);
      setUsers(uRes.data);
      setResources(rRes.data.resources);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleGrant = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/access/grant', form);
      setSuccess('Access granted successfully');
      setModalOpen(false);
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to grant access');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (userId, resourceId, email, resourceName) => {
    if (!window.confirm(`Revoke ${email}'s access to ${resourceName}?`)) return;
    try {
      await api.post('/access/revoke', { userId, resourceId });
      setSuccess('Access revoked');
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Revoke failed');
    }
  };

  const filtered = filterResource
    ? accesses.filter(a => a.resource?.id === filterResource)
    : accesses;

  const columns = [
    {
      key: 'user', label: 'USER',
      render: (v) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{v?.email}</div>
        </div>
      )
    },
    {
      key: 'resource', label: 'RESOURCE',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500 }}>{v?.name}</span>
          <span style={{ fontSize: 10, padding: '1px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{v?.type}</span>
          <StatusBadge status={v?.status} />
        </div>
      )
    },
    { key: 'role', label: 'ACCESS ROLE', render: v => <StatusBadge status={v} /> },
    {
      key: 'grantedAt', label: 'GRANTED',
      render: v => <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(v).toLocaleString()}</span>
    },
    {
      key: 'userId', label: 'ACTIONS',
      render: (userId, row) => (
        <Button size="sm" variant="danger" onClick={() => handleRevoke(userId, row.resource?.id, row.user?.email, row.resource?.name)}>
          Revoke
        </Button>
      )
    },
  ];

  // Group by resource for summary
  const byResource = resources.map(r => ({
    ...r,
    userCount: accesses.filter(a => a.resource?.id === r.id).length,
  })).filter(r => r.userCount > 0);

  return (
    <div>
      <PageHeader
        title="Access Control"
        subtitle={`${accesses.length} access grants across ${resources.length} resources`}
        action={<Button onClick={() => { setForm({ userId: users[0]?.id || '', resourceId: resources[0]?.id || '', role: 'VIEWER' }); setModalOpen(true); }}>+ Grant Access</Button>}
      />

      {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} /></div>}
      {success && <div style={{ marginBottom: 16 }}><Alert type="success" message={success} /></div>}

      {/* Resource access summary */}
      {byResource.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {byResource.map(r => (
            <div
              key={r.id}
              onClick={() => setFilterResource(filterResource === r.id ? '' : r.id)}
              style={{
                background: filterResource === r.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                border: `1px solid ${filterResource === r.id ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.name}</div>
                  <StatusBadge status={r.status} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{r.userCount}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{r.userCount} user{r.userCount !== 1 ? 's' : ''} with access</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FILTER BY RESOURCE:</span>
          <Select value={filterResource} onChange={e => setFilterResource(e.target.value)} style={{ width: 220 }}>
            <option value="">All Resources</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          {filterResource && <Button variant="ghost" size="sm" onClick={() => setFilterResource('')}>✕ Clear</Button>}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        {loading ? <Loader /> : <Table columns={columns} data={filtered} emptyMsg="No access records found" />}
      </Card>

      {/* Grant modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Grant Resource Access" width={440}>
        <form onSubmit={handleGrant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="USER">
            <Select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </Select>
          </FormField>
          <FormField label="RESOURCE">
            <Select value={form.resourceId} onChange={e => setForm(p => ({ ...p, resourceId: e.target.value }))}>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name} [{r.type}]</option>)}
            </Select>
          </FormField>
          <FormField label="ACCESS ROLE">
            <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ACCESS_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </FormField>
          <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Role permissions:</strong> OWNER (full), EDITOR (read/write), VIEWER (read-only)
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving || !form.userId || !form.resourceId}>
              {saving ? 'Granting...' : 'Grant Access'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
