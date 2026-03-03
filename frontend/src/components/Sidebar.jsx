'use client';

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { canViewAuditLog, canApprove, ROLES } from '../utils/permissions';
import '../styles/Sidebar.css';

const ALL_ROLES    = [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.BFAR_VIEWER, ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR];
const WRITE_ROLES  = [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.LGU_SUPERVISOR, ROLES.LGU_EDITOR];
const ADMIN_TIER   = [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR];
const APPROVER_TIER= [ROLES.ADMIN, ROLES.BFAR_SUPERVISOR, ROLES.LGU_SUPERVISOR];

const menuItems = [
  { id: 'dashboard',      label: 'DASHBOARD',              icon: '🏠', path: '/dashboard',      roles: ALL_ROLES },
  { id: 'fisherfolk-list',label: 'FISHERFOLK LIST',         icon: '📋', path: '/fisherfolk-list', roles: ALL_ROLES },
  { id: 'boats-gears',    label: 'LIST OF BOATS AND GEARS', icon: '🚢', path: '/boats-gears',    roles: ALL_ROLES },
  { id: 'report',         label: 'REPORT',                  icon: '📊', path: '/report',         roles: ALL_ROLES },
  { id: 'levels',         label: 'LEVELS OF DEVELOPMENT',   icon: '📈', path: '/levels',         roles: ALL_ROLES },
  { id: 'ordinance',      label: 'ORDINANCE & RESOLUTION',  icon: '📄', path: '/ordinance',      roles: ALL_ROLES },
  { id: 'organization',   label: 'ORGANIZATION',            icon: '👥', path: '/organization',   roles: ALL_ROLES },
  { id: 'maps',           label: 'MAPS',                    icon: '🗺️', path: '/maps',           roles: ALL_ROLES },
  { id: 'help-desk',      label: 'HELP DESK',               icon: '💬', path: '/help-desk',      roles: ALL_ROLES },
  { id: 'approvals',      label: 'APPROVALS',               icon: '✅', path: '/approvals',      roles: APPROVER_TIER },
  { id: 'manage-account', label: 'MANAGE ACCOUNT',          icon: '⚙️', path: '/manage-account', roles: ALL_ROLES },
  { id: 'audit-log',      label: 'AUDIT LOG',               icon: '🔍', path: '/audit-log',      roles: ADMIN_TIER },
  { id: 'faqs',           label: 'FAQs',                    icon: '❓', path: '/faqs',           roles: ALL_ROLES },
];

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme, changeTheme } = useContext(ThemeContext);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  const handleNavigate = (item) => {
    setCurrentPage(item.id);
    navigate(item.path);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="theme-selector">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => changeTheme('light')}
          >
            <span className="theme-icon">☀️</span>
            <span className="theme-label">Light</span>
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => changeTheme('dark')}
          >
            <span className="theme-icon">🌙</span>
            <span className="theme-label">Dark</span>
          </button>
          <button
            className={`theme-btn ${theme === 'auto' ? 'active' : ''}`}
            onClick={() => changeTheme('auto')}
          >
            <span className="theme-icon">◐</span>
            <span className="theme-label">Auto</span>
          </button>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <span className="menu-icon">🚪</span>
          <span className="menu-label">LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}
