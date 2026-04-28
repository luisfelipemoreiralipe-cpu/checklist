import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlinePlay,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineBell,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import './Layout.css';

const navItems = [
  { section: 'Principal', items: [
    { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard', minRole: 'MANAGER' },
    { to: '/checklists', icon: HiOutlineClipboardList, label: 'Checklists', minRole: 'MANAGER' },
    { to: '/executar', icon: HiOutlinePlay, label: 'Executar', minRole: null },
    { to: '/historico', icon: HiOutlineClock, label: 'Histórico', minRole: null },
  ]},
  { section: 'Insights', items: [
    { to: '/ranking', icon: HiOutlineStar, label: 'Ranking', minRole: null },
    { to: '/alertas', icon: HiOutlineBell, label: 'Alertas', minRole: 'MANAGER' },
  ]},
  { section: 'Admin', items: [
    { to: '/usuarios', icon: HiOutlineUsers, label: 'Usuários', minRole: 'ADMIN' },
  ]},
];

const roleLevel = { STAFF: 1, MANAGER: 2, ADMIN: 3 };

export default function Layout() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  const userLevel = roleLevel[user?.role] || 0;

  const roleLabels = { ADMIN: 'Administrador', MANAGER: 'Gerente', STAFF: 'Colaborador' };

  return (
    <div className="layout">
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>CheckOps</h1>
          <span>Performance Operacional</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => {
            const visibleItems = section.items.filter(item =>
              !item.minRole || userLevel >= roleLevel[item.minRole]
            );
            if (visibleItems.length === 0) return null;

            return (
              <div className="sidebar-section" key={section.section}>
                <div className="sidebar-section-title">{section.section}</div>
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{roleLabels[user?.role] || user?.role}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sair">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
