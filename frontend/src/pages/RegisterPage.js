import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import css from './RegisterPage.module.css';

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
    <div className={css.page}>
      <div className={css.card}>
        <div className={css.header}>
          <div className={css.logo}>
            ⬡
          </div>

          <h1 className={css.title}>
            Створити обліковий запис
          </h1>

          <p className={css.subtitle}>
            Приєднатися до платформи CloudGuard
          </p>
        </div>

        {error && (
          <div className={css.errorBox}>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={css.form}
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
              <label className={css.label}>
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
                className={css.input}
              />
            </div>
          ))}

          <div>
            <label className={css.label}>
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
              className={css.select}
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
            className={css.submitButton}
          >
            {loading
              ? 'Створення акаунта...'
              : 'Створити акаунт'}
          </button>
        </form>

        <p className={css.footerText}>
          Вже маєте акаунт?{' '}
          <Link
            to="/login"
            className={css.footerLink}
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
