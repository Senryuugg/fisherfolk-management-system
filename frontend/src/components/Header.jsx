import '../styles/Header.css';

export default function Header({ title, user }) {
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
          {user && <span className="user-badge">{user.fullName}</span>}
        </div>
      </div>
      <h2 className="page-title">{title}</h2>
    </header>
  );
}
