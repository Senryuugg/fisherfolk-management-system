'use client';

import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const menuItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: '🏠', path: '/dashboard' },
  { id: 'fisherfolk-list', label: 'FISHERFOLK LIST', icon: '📋', path: '/fisherfolk-list' },
  { id: 'boats-gears', label: 'LIST OF BOATS AND GEARS', icon: '🚢', path: '/boats-gears' },
  { id: 'report', label: 'REPORT', icon: '📊', path: '/report' },
  { id: 'levels', label: 'LEVELS OF DEVELOPMENT', icon: '📈', path: '/levels' },
  { id: 'ordinance', label: 'ORDINANCE & RESOLUTION', icon: '📄', path: '/ordinance' },
  { id: 'organization', label: 'ORGANIZATION', icon: '👥', path: '/organization' },
  { id: 'maps', label: 'MAPS', icon: '🗺️', path: '/maps' },
  { id: 'help-desk', label: 'HELP DESK', icon: '💬', path: '/help-desk' },
  { id: 'manage-account', label: 'MANAGE ACCOUNT', icon: '⚙️', path: '/manage-account' },
  { id: 'faqs', label: 'FAQs', icon: '❓', path: '/faqs' },
];

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const navigate = useNavigate();

  const handleNavigate = (item) => {
    setCurrentPage(item.id);
    navigate(item.path);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="menu-list">
          {menuItems.map((item) => (
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
