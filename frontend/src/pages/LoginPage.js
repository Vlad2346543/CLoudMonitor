import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import css from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Помилка входу'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.page}>
      {/* Фонова сітка */}
      <div className={css.backgroundGrid} />

      <div className={css.loginCard}>
        {/* Логотип */}
        <div className={css.logoBlock}>
          <div className={css.logoIcon}>
            ⬡
          </div>

          <h1 className={css.logoTitle}>
            CloudGuard
          </h1>

          <p className={css.logoSubtitle}>
            Керування хмарними ресурсами
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
          <div>
            <label className={css.label}>
              EMAIL
            </label>

            <input
              type="email"
              required
              value={form.email}
              placeholder="admin@cloudguard.io"
              onChange={e =>
                setForm(f => ({
                  ...f,
                  email: e.target.value,
                }))
              }
              className={css.input}
            />
          </div>

          <div>
            <label className={css.label}>
              ПАРОЛЬ
            </label>

            <input
              type="password"
              required
              value={form.password}
              placeholder="••••••••"
              onChange={e =>
                setForm(f => ({
                  ...f,
                  password: e.target.value,
                }))
              }
              className={css.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={css.submitButton}
          >
            {loading
              ? 'Вхід у систему...'
              : 'Увійти'}
          </button>
        </form>

        {/* Демонстраційні акаунти */}
        <div className={css.demoAccounts}>
          <p className={css.demoTitle}>
            ДЕМОНСТРАЦІЙНІ ДАНІ
          </p>

          {[
            {
              label: 'Адміністратор',
              email: 'admin@cloudguard.io',
              pass: 'admin123',
            },

            {
              label: 'Користувач',
              email: 'alice@cloudguard.io',
              pass: 'user123',
            },
          ].map(c => (
            <div
              key={c.label}
              className={css.demoItem}
            >
              <span className={css.demoText}>
                {c.label}:{' '}
                <span className={css.demoEmail}>
                  {c.email}
                </span>
              </span>

              <button
                onClick={() =>
                  setForm({
                    email: c.email,
                    password: c.pass,
                  })
                }
                className={css.demoButton}
              >
                Використати
              </button>
            </div>
          ))}
        </div>

        <p className={css.registerText}>
          Немає акаунта?{' '}
          <Link
            to="/register"
            className={css.registerLink}
          >
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
}