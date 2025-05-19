import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Component yüklendiğinde mevcut temayı kontrol et
  useEffect(() => {
    setMounted(true);
    try {
      // localStorage'dan tema tercihini kontrol et
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Tarayıcı tercihine göre ayarla
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error("Tema kontrolü sırasında hata:", error);
    }
  }, []);

  // Temayı değiştir
  const toggleDarkMode = () => {
    if (!mounted) return;
    
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      
      // localStorage'a kaydet
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      
      // HTML'de dark class'ını değiştir
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error("Tema değiştirme sırasında hata:", error);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full focus:outline-none transition-colors duration-200 
                 dark:bg-dark-700 bg-gray-100 hover:bg-gray-200 dark:hover:bg-dark-600"
      aria-label={darkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
    >
      {darkMode ? (
        <FaSun className="h-5 w-5 text-yellow-300 animate-pulse-slow" />
      ) : (
        <FaMoon className="h-5 w-5 text-primary-600" />
      )}
    </button>
  );
};

export default ThemeToggle; 