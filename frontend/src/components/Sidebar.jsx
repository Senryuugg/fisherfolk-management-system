'use client';

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { canManageUsers } from '../utils/permissions';
import '../styles/Sidebar.css';

const menuItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '🏠', path: '/dashboard', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'fisherfolk-list', label: 'FISHERFOLK LIST', icon: '📋', path: '/fisherfolk-list', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'boats-gears', label: 'LIST OF BOATS AND GEARS', icon: '🚢', path: '/boats-gears', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'report', label: 'REPORT', icon: '📊', path: '/report', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'levels', label: 'LEVELS OF DEVELOPMENT', icon: '📈', path: '/levels', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'ordinance', label: 'ORDINANCE & RESOLUTION', icon: '📄', path: '/ordinance', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'organization', label: 'ORGANIZATION', icon: '👥', path: '/organization', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'maps', label: 'MAPS', icon: '🗺️', path: '/maps', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'help-desk', label: 'HELP DESK', icon: '💬', path: '/help-desk', roles: ['admin', 'viewer', 'lgu'] },
  { id: 'manage-account', label: 'MANAGE ACCOUNT', icon: '⚙️', path: '/manage-account', roles: ['admin', 'viewer'] },
  { id: 'faqs', label: 'FAQs', icon: '❓', path: '/faqs', roles: ['admin', 'viewer', 'lgu'] },
];

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

      <button className="logout-btn" onClick={onLogout}>
        <span className="menu-icon">🚪</span>
        <span className="menu-label">LOGOUT</span>
      </button>
    </aside>
  );
}
