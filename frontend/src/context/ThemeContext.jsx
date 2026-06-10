import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // default to light as requested

  useEffect(() => {
    // Check local storage for theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // If no stored theme, default to light. We don't check OS preference 
      // because user explicitly requested "simple white web" as the new default.
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    // Update the HTML class and local storage when theme changes
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
