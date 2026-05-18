import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Панель керування',  roles: ['ADMIN','USER','VIEWER'] },
  { path: '/resources', label: 'Ресурси', roles: ['ADMIN','USER','VIEWER'] },
  { path: '/access', label: 'Керування доступом',  roles: ['ADMIN'] },
  { path: '/users', label: 'Користувачі',  roles: ['ADMIN'] },
  
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⬡</span>
          {!collapsed && <span className={styles.brandName}>CloudGuard</span>}
        </div>

        <nav className={styles.nav}>
          {visibleNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={`${styles.userRole} ${styles[`role_${user?.role}`]}`}>{user?.role}</span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <span>⏏</span>
            {!collapsed && <span>Вийти</span>}
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(v => !v)}>
            {collapsed ? '▶' : '◀'}
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>Система онлайн</span>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
