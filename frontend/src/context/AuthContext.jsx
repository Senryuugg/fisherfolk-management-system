import { createContext, useState, useEffect, useRef, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const inactivityTimerRef = useRef(null);
  // Always holds the latest logout fn so the timer callback never goes stale
  const logoutRef = useRef(null);

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  const logout = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Keep logoutRef current so timers always call the latest version
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Load user from localStorage on mount / token change
  useEffect(() => {
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        const legacyRoleMap = {
          lgu:            'lgu_supervisor',
          viewer:         'bfar_viewer',
          officer:        'lgu_editor',
          bfar_admin:     'bfar_supervisor',
          bfar_user:      'bfar_viewer',
          lgu_admin:      'lgu_supervisor',
          lgu_user:       'lgu_editor',
        };
        if (legacyRoleMap[storedUser.role]) {
          storedUser.role = legacyRoleMap[storedUser.role];
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        setUser(storedUser);
      }
    }
    setLoading(false);
  }, [token]);

  // Setup inactivity auto-logout — runs whenever auth state changes
  useEffect(() => {
    if (!token || !user) return;

    const startTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        logoutRef.current?.();
      }, INACTIVITY_TIMEOUT);
    };

    // Start the initial timer
    startTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(evt => document.addEventListener(evt, startTimer, { passive: true }));

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach(evt => document.removeEventListener(evt, startTimer));
    };
  }, [token, user]); // re-registers whenever login/logout happens

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
