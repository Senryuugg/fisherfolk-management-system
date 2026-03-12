import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  // Show session-expired message when redirected from the axios interceptor
  const params = new URLSearchParams(window.location.search);
  const sessionExpired = params.get('reason') === 'session_expired';
  const [error, setError] = useState(sessionExpired ? 'Your session has expired. Please log in again.' : '');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-gradient"></div>
      <div className="login-content">

        {/* Left: form */}
        <div className="login-form-section">
          <div className="logo-container">
            <img src="/bfar-logo.png" alt="BFAR Logo" className="bfar-logo" />
          </div>
          <h2 className="login-title">FARMC Information System</h2>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        {/* Right: info panel */}
        <div className="login-info-section">
          <h1>Welcome to<br /><strong>FARMC</strong></h1>
          <h3>WHAT IS FARMC INFORMATION SYSTEM</h3>
          <p>
            The FARMC Database System is a centralized digital platform designed to streamline
            the management of Fisheries and Aquatic Resources Management Council (FARMC) records.
            The system supports efficient coordination among local government units, fisherfolk
            organizations, and relevant agencies, ensuring more responsive and data-driven
            fisheries governance.
          </p>
          <p className="copyright">
            Copyright &copy; 2026 All rights reserved - Bureau of Fisheries and Aquatic Resources
          </p>
        </div>

      </div>
    </div>
  );
}
