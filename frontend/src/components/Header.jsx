import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/Header.css';

export default function Header({ title, user }) {
  const { theme, changeTheme } = useContext(ThemeContext);

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-left">
          <img src="/bfar-logo.png" alt="BFAR" className="header-logo" />
          <div className="header-text">
            <p className="header-gov">REPUBLIC OF THE PHILIPPINES</p>
            <p className="header-dept">DEPARTMENT OF AGRICULTURE</p>
            <p className="header-bureau">BUREAU OF FISHERIES AND AQUATIC RESOURCES - NCR</p>
            <p className="header-title">FISHERIES AND AQUATIC RESOURCES MANAGEMENT COUNCILS DATABASE SYSTEM</p>
          </div>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-menu-container">
              <span className="user-badge">{user.fullName}</span>
              <div className="theme-menu">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <span className="theme-icon">☀️</span> Light Mode
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <span className="theme-icon">🌙</span> Dark Mode
                </button>
                <button
                  className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('auto')}
                >
                  <span className="theme-icon">🔄</span> Auto
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="page-title">{title}</h2>
    </header>
  );
}
