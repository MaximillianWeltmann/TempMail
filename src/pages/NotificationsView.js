import React, { useState } from 'react';
import { FaBell, FaEnvelope, FaShieldAlt, FaExclamationTriangle, FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const NotificationsView = () => {
  // Örnek bildirimler
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'E-posta Alındı',
      message: 'Yeni bir e-posta mesajı başarıyla alındı.',
      time: '2 dakika önce',
      icon: <FaEnvelope />,
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Oturum Süresi',
      message: 'Geçici e-posta hesabınızın süresi yakında dolacak.',
      time: '1 saat önce',
      icon: <FaExclamationTriangle />,
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Sistem Bakımı',
      message: 'Planlı bakım çalışması yarın 03:00-05:00 arasında gerçekleştirilecek.',
      time: '3 saat önce',
      icon: <FaInfoCircle />,
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Bağlantı Hatası',
      message: 'API sunucusuna bağlanırken bir sorun oluştu. Otomatik olarak yeniden deneniyor.',
      time: '5 saat önce',
      icon: <FaExclamationCircle />,
      read: true
    },
    {
      id: 5,
      type: 'success',
      title: 'Güvenlik Güncellemesi',
      message: 'Hesap güvenliğiniz için ek koruma önlemleri etkinleştirildi.',
      time: '1 gün önce',
      icon: <FaShieldAlt />,
      read: true
    }
  ]);

  // Bildirim Türü stilleri
  const notificationStyles = {
    success: {
      icon: "text-green-400",
      bg: "bg-green-900/20",
      border: "border-green-500/30"
    },
    warning: {
      icon: "text-amber-400",
      bg: "bg-amber-900/20",
      border: "border-amber-500/30"
    },
    error: {
      icon: "text-red-400",
      bg: "bg-red-900/20",
      border: "border-red-500/30"
    },
    info: {
      icon: "text-indigo-400",
      bg: "bg-indigo-900/20",
      border: "border-indigo-500/30"
    }
  };

  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full w-full p-6 overflow-auto">
      <div className="futuristic-panel p-6 bg-black/30 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FaBell className="text-indigo-400 mr-3 h-6 w-6" />
            <h1 className="text-2xl font-bold futuristic-text-gradient">Bildirimler</h1>
          </div>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} yeni
            </span>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-black/30 inline-flex rounded-full p-3 mb-4">
                <FaBell className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Henüz bildiriminiz bulunmuyor.</p>
            </div>
          ) : (
            notifications.map((notification, index) => {
              const style = notificationStyles[notification.type];
              
              return (
                <div
                  key={notification.id}
                  className={`futuristic-card p-4 ${style.bg} border ${style.border} ${!notification.read ? 'ring-1 ring-indigo-500/30' : ''}`}
                >
                  <div className="flex">
                    <div className={`flex-shrink-0 ${style.bg} rounded-lg p-3 mr-3 border ${style.border}`}>
                      <span className={`${style.icon}`}>
                        {notification.icon}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-200">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                          )}
                        </h3>
                        <span className="text-gray-500 text-xs">{notification.time}</span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                      
                      <div className="flex justify-end mt-2">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mr-3">
                          <FaCheck className="inline-block mr-1" /> İşaretle
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
                          <FaTimes className="inline-block mr-1" /> Kaldır
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div 
        className="futuristic-panel p-6 bg-black/30"
      >
        <h2 className="text-xl font-bold mb-4 futuristic-text-gradient">Bildirim Ayarları</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-indigo-500/20 rounded-lg bg-black/20">
            <div className="flex items-center">
              <FaEnvelope className="text-indigo-400 mr-3" />
              <span className="text-gray-300">Yeni E-posta Bildirimleri</span>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only" id="new-emails" defaultChecked />
              <label htmlFor="new-emails" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                <span className="absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform translate-x-7"></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-indigo-500/20 rounded-lg bg-black/20">
            <div className="flex items-center">
              <FaShieldAlt className="text-indigo-400 mr-3" />
              <span className="text-gray-300">Güvenlik Uyarıları</span>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only" id="security-alerts" defaultChecked />
              <label htmlFor="security-alerts" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                <span className="absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform translate-x-7"></span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-indigo-500/20 rounded-lg bg-black/20">
            <div className="flex items-center">
              <FaExclamationCircle className="text-indigo-400 mr-3" />
              <span className="text-gray-300">Sistem Uyarıları</span>
            </div>
            <div className="relative">
              <input type="checkbox" className="sr-only" id="system-alerts" defaultChecked />
              <label htmlFor="system-alerts" className="block w-14 h-7 bg-indigo-900/50 rounded-full cursor-pointer">
                <span className="absolute left-1 top-1 bg-indigo-500 w-5 h-5 rounded-full transition-transform duration-200 transform translate-x-7"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView; 