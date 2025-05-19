import React from 'react';
import { FaEnvelope, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const Header = ({ account, onLogout, onDeleteAccount }) => {
  return (
    <header className="bg-white dark:bg-dark-700 shadow-sm dark:shadow-md border-b border-gray-200 dark:border-dark-600 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-400 p-2 rounded-lg shadow-md">
              <FaEnvelope className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 text-transparent bg-clip-text transition-all duration-300">Geçici E-posta</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {account && (
              <div className="flex items-center animate-slide-in">
                <p className="text-sm text-gray-600 dark:text-gray-300 mr-6 hidden sm:block">
                  <span className="font-medium">{account.address}</span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={onDeleteAccount}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-500 text-sm font-medium rounded text-red-700 dark:text-red-400 bg-white dark:bg-dark-700 hover:bg-red-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-800 transition-colors duration-200"
                  >
                    <FaTrash className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">Hesabı Sil</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:focus:ring-offset-dark-800 transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">Çıkış</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 