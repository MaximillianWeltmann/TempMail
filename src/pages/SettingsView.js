import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaTheme, FaPalette, FaGlobe, FaKey, FaClock, FaTrash, FaChartArea, FaMoon, FaSun, FaExclamationTriangle } from 'react-icons/fa';
import { useMailStore } from '../hooks/useMailStore';

const SettingsView = () => {
  const { deleteAccount } = useMailStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sayfa geçiş animasyonu
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  // Varsayılan ayarlar
  const [settings] = useState({
    theme: 'dark',
    accentColor: 'indigo',
    language: 'tr',
    autoRefresh: true,
    refreshInterval: 60,
    deleteAfterRead: false,
    notifications: true,
    analytics: false
  });

  // Renk seçenekleri
  const accentColors = [
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Mor', value: 'purple', class: 'bg-purple-500' },
    { name: 'Mavi', value: 'blue', class: 'bg-blue-500' },
    { name: 'Yeşil', value: 'green', class: 'bg-green-500' },
    { name: 'Turuncu', value: 'orange', class: 'bg-orange-500' },
    { name: 'Kırmızı', value: 'red', class: 'bg-red-500' },
  ];

  // Dil seçenekleri
  const languages = [
    { name: 'Türkçe', value: 'tr' },
    { name: 'English', value: 'en' },
    { name: 'Deutsch', value: 'de' },
    { name: 'Español', value: 'es' },
    { name: 'Français', value: 'fr' }
  ];

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="h-full w-full p-6 overflow-auto"
    >
      <div className="futuristic-panel p-6 bg-black/30 mb-6">
        <div className="flex items-center mb-6">
          <FaCog className="text-indigo-400 mr-3 h-6 w-6" />
          <h1 className="text-2xl font-bold futuristic-text-gradient">Ayarlar</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Görünüm Ayarları */}
          <motion.div 
            className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center mb-4">
              <FaPalette className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Görünüm</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-400">Tema</label>
                <div className="flex space-x-4">
                  <button className={`flex items-center justify-center p-3 rounded-lg ${settings.theme === 'dark' ? 'bg-indigo-900/40 border border-indigo-500/50' : 'bg-black/40 border border-indigo-500/20'}`}>
                    <FaMoon className="mr-2 text-indigo-400" />
                    <span className="text-sm">Karanlık</span>
                  </button>
                  <button className={`flex items-center justify-center p-3 rounded-lg ${settings.theme === 'light' ? 'bg-indigo-900/40 border border-indigo-500/50' : 'bg-black/40 border border-indigo-500/20'}`}>
                    <FaSun className="mr-2 text-amber-400" />
                    <span className="text-sm">Aydınlık</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-400">Vurgu Rengi</label>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map(color => (
                    <button 
                      key={color.value}
                      className={`w-8 h-8 rounded-full ${color.class} ${settings.accentColor === color.value ? 'ring-2 ring-white' : 'opacity-70'}`}
                      title={color.name}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dil Ayarları */}
          <motion.div 
            className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <FaGlobe className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Dil</h2>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-400">Arayüz Dili</label>
              <select className="bg-black/40 border border-indigo-500/30 rounded-lg p-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {languages.map(lang => (
                  <option 
                    key={lang.value} 
                    value={lang.value}
                    selected={settings.language === lang.value}
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Oturum Ayarları */}
          <motion.div 
            className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <FaClock className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Zamanlama</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Otomatik Yenileme</p>
                  <p className="text-gray-500 text-xs">Belirli aralıklarla gelen kutusu yenilenir</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="auto-refresh" defaultChecked={settings.autoRefresh} />
                  <label htmlFor="auto-refresh" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                    <span className={`absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform ${settings.autoRefresh ? 'translate-x-7' : 'translate-x-0'}`}></span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-400">Yenileme Aralığı</label>
                <select 
                  className="bg-black/40 border border-indigo-500/30 rounded-lg p-2 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  disabled={!settings.autoRefresh}
                >
                  <option value="30">30 saniye</option>
                  <option value="60" selected={settings.refreshInterval === 60}>60 saniye</option>
                  <option value="120">2 dakika</option>
                  <option value="300">5 dakika</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Güvenlik Ayarları */}
          <motion.div 
            className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center mb-4">
              <FaKey className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Güvenlik ve Gizlilik</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Okuduktan Sonra Sil</p>
                  <p className="text-gray-500 text-xs">E-postalar okunduktan 1 saat sonra otomatik silinir</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="delete-after-read" defaultChecked={settings.deleteAfterRead} />
                  <label htmlFor="delete-after-read" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                    <span className={`absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform ${settings.deleteAfterRead ? 'translate-x-7' : 'translate-x-0'}`}></span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Kullanım İstatistikleri</p>
                  <p className="text-gray-500 text-xs">Anonim kullanım verileri toplanır</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" id="analytics" defaultChecked={settings.analytics} />
                  <label htmlFor="analytics" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                    <span className={`absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform ${settings.analytics ? 'translate-x-7' : 'translate-x-0'}`}></span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hesap Tehlikeli Bölge */}
          <motion.div 
            className="futuristic-card p-4 bg-red-900/10 border border-red-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Tehlikeli Bölge</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Bu bölümdeki işlemler geri alınamaz. Dikkatli olun!
            </p>
            
            {showDeleteConfirm ? (
              <div className="bg-black/30 p-4 rounded-lg border border-red-500/30">
                <p className="text-gray-300 text-sm mb-3">
                  Bu işlem kalıcıdır. Tüm e-postalarınız ve hesap bilgileriniz silinecektir. Emin misiniz?
                </p>
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                    onClick={deleteAccount}
                  >
                    Hesabımı Sil
                  </button>
                  <button 
                    className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-md text-sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="px-4 py-2 bg-black/30 border border-red-500/30 hover:bg-red-900/20 text-red-400 rounded-md flex items-center"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FaTrash className="mr-2 h-4 w-4" />
                Hesabı Sil
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="text-center text-gray-500 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        NOVA MAIL v1.0.0 • Tüm Hakları Saklıdır.
      </motion.div>
    </motion.div>
  );
};

export default SettingsView; 