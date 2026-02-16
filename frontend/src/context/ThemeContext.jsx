import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Determine auto theme based on time (6 AM - 6 PM = light, else dark)
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'auto';
    setTheme(storedTheme);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const documentElement = document.documentElement;
    let activeTheme = theme;

    // If auto mode, determine based on time
    if (theme === 'auto') {
      activeTheme = getAutoTheme();
    }

    // Remove existing theme classes
    documentElement.classList.remove('light-mode', 'dark-mode');
    // Add new theme class
    documentElement.classList.add(`${activeTheme}-mode`);
  }, [theme]);

  // Update theme when user changes it
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Re-check auto theme every minute
  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        const newAutoTheme = getAutoTheme();
        const documentElement = document.documentElement;
        
        // Update if time-based theme changed
        const currentTheme = documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        if (currentTheme !== newAutoTheme) {
          documentElement.classList.remove('light-mode', 'dark-mode');
          documentElement.classList.add(`${newAutoTheme}-mode`);
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
