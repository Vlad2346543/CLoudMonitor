import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    background: '#0f172a',
    border: '1px solid #1e2d45',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (form.password.length < 6) {
      return setError(
        'Пароль повинен містити щонайменше 6 символів'
      );
    }

    setLoading(true);

    try {
      await register(form);

      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Не вдалося створити акаунт'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background:
          'radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.06) 0%, transparent 60%), #0a0f1e',

        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,

          background: '#141d2e',
          border: '1px solid #1e2d45',

          borderRadius: 14,
          padding: '40px 36px',

          boxShadow:
            '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 36,
              marginBottom: 8,
            }}
          >
            ⬡
          </div>

          <h1
            style={{
              fontFamily:
                'Space Mono, monospace',

              fontSize: 18,
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            Створити обліковий запис
          </h1>

          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              marginTop: 4,
            }}
          >
            Приєднатися до платформи CloudGuard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',

              background:
                'rgba(239,68,68,0.1)',

              border:
                '1px solid rgba(239,68,68,0.3)',

              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {[
            {
              key: 'name',
              label: 'ПОВНЕ ІМ’Я',
              type: 'text',
              placeholder: 'Іван Петренко',
            },

            {
              key: 'email',
              label: 'EMAIL',
              type: 'email',
              placeholder: 'ivan@company.com',
            },

            {
              key: 'password',
              label: 'ПАРОЛЬ',
              type: 'password',
              placeholder:
                'Мінімум 6 символів',
            },
          ].map(f => (
            <div key={f.key}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: 6,
                  letterSpacing: '0.05em',
                }}
              >
                {f.label}
              </label>

              <input
                type={f.type}
                required
                value={form[f.key]}
                placeholder={f.placeholder}
                onChange={e =>
                  setForm(p => ({
                    ...p,
                    [f.key]:
                      e.target.value,
                  }))
                }
                style={inputStyle}
                onFocus={e =>
                  (e.target.style.borderColor =
                    '#3b82f6')
                }
                onBlur={e =>
                  (e.target.style.borderColor =
                    '#1e2d45')
                }
              />
            </div>
          ))}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: 6,
                letterSpacing: '0.05em',
              }}
            >
              РОЛЬ
            </label>

            <select
              value={form.role}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  role: e.target.value,
                }))
              }
              style={{
                ...inputStyle,
                cursor: 'pointer',
              }}
            >
              <option value="USER">
                Користувач
              </option>

              <option value="VIEWER">
                Спостерігач
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '12px',

              background: '#3b82f6',
              color: '#fff',

              border: 'none',
              borderRadius: 8,

              fontSize: 14,
              fontWeight: 600,

              cursor: loading
                ? 'not-allowed'
                : 'pointer',

              opacity: loading ? 0.7 : 1,

              fontFamily:
                'DM Sans, sans-serif',
            }}
          >
            {loading
              ? 'Створення акаунта...'
              : 'Створити акаунт'}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: 13,
            color: '#475569',
          }}
        >
          Вже маєте акаунт?{' '}
          <Link
            to="/login"
            style={{
              color: '#60a5fa',
            }}
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}