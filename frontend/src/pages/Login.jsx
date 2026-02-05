'use client';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-gradient"></div>
      <div className="login-content">
        <div className="login-form-section">
          <div className="logo-container">
            <img src="/bfar-logo.png" alt="BFAR Logo" className="bfar-logo" />
          </div>
          <h2 className="login-title">FARMC Database System</h2>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
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
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>

        <div className="login-info-section">
          <h1>Welcome to<br /><strong>FARMC</strong></h1>
          <h3>WHAT IS FARMC DATABASE SYSTEM</h3>
          <p>
            The FARMC is a multi-sectoral advisory body established under Republic Act No. 8550 
            (The Philippine Fisheries Code of 1998, as amended by RA 10654). It is designed to 
            institutionalize the active participation of fisherfolk and local stakeholders in the 
            planning and implementation of policies for the sustainable management, conservation, 
            and protection of fisheries and aquatic resources.
          </p>
          <p className="copyright">
            Copyright © 2026 All rights reserved - Bureau of Fisheries and Aquatic Resources
          </p>
        </div>
      </div>
    </div>
  );
}
