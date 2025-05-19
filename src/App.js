import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './components/LoginForm';
import InboxView from './components/InboxView';
import { useMailStore } from './hooks/useMailStore';
import './styles/index.css';
import { FaEnvelope, FaSyncAlt, FaRocket, FaSignOutAlt, FaTrash, FaUserAstronaut, FaGlobe, FaBell, FaCog, FaChartBar } from 'react-icons/fa';
import ThemeToggle from './components/ThemeToggle';

// framer-motion'u doğrudan import ediyoruz (lazy loading yapmıyoruz)
import { AnimatePresence } from 'framer-motion';

// Lazy loading ile yüklenen bileşenler için Suspense fallback oluştur
const SuspenseFallback = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <div className="text-center">
      <div className="inline-block mx-auto mb-4">
        <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
      </div>
      <p className="text-indigo-400">Yükleniyor...</p>
    </div>
  </div>
);

// Lazy loading ile yüklenen bileşenler - daha geç yüklenecek şekilde ayarlanıyor
const ProfilePage = lazy(() => {
  return new Promise(resolve => {
    // Küçük bir gecikme ile yükleme
    setTimeout(() => resolve(import('./pages/ProfilePage')), 300);
  });
});

const ExploreView = lazy(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve(import('./pages/ExploreView')), 300);
  });
});

const StatisticsView = lazy(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve(import('./pages/StatisticsView')), 300);
  });
});

const NotificationsView = lazy(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve(import('./pages/NotificationsView')), 300);
  });
});

const SettingsView = lazy(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve(import('./pages/SettingsView')), 300);
  });
});

// AnimatePresence için wrapper bileşeni
function AnimatedRoutes() {
  const { isLoggedIn, account, messages, loading, selectedMessage, fetchMessages, 
    fetchMessage, deleteMessage, deleteAccount, logout } = useMailStore();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('inbox');
  const firstRenderRef = useRef(true);

  // URL değiştiğinde aktif bağlantıyı güncelle
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveLink('inbox');
    else if (path === '/profile') setActiveLink('profile');
    else if (path === '/explore') setActiveLink('explore');
    else if (path === '/statistics') setActiveLink('statistics');
    else if (path === '/notifications') setActiveLink('notifications');
    else if (path === '/settings') setActiveLink('settings');
  }, [location]);

  // Otomatik yönlendirmeyi kaldırdık
  // Eğer giriş yapılmadıysa farklı bir içerik gösterilebilir
  if (!isLoggedIn) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center p-6 bg-black/30 rounded-xl border border-indigo-500/20 shadow-lg">
          <h2 className="text-xl text-indigo-400 mb-2">Giriş yapmanız gerekiyor</h2>
          <p className="text-gray-400">Lütfen önce bir hesap oluşturun</p>
          <Link to="/login" className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 inline-block rounded-md text-white">
            Giriş Sayfasına Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="futuristic-layout">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark" 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      
      {/* Sol Kenar Çubuğu */}
      <aside className="futuristic-navbar">
        <div className="futuristic-logo">
          <div className="flex flex-col items-center space-y-1">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <FaRocket className="h-7 w-7 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold futuristic-text-gradient">NOVA MAIL</span>
          </div>
        </div>
        
        <nav className="mt-8 px-2">
          <Link to="/">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'inbox' ? 'active' : ''}`} 
              onClick={() => {
                if (messages.length === 0) {
                  fetchMessages();
                }
              }}
            >
              <FaEnvelope className="futuristic-nav-icon" />
              <span>Gelen Kutusu</span>
            </div>
          </Link>
          
          <div 
            className={`futuristic-nav-item group ${activeLink === 'refresh' ? 'active' : ''}`} 
            onClick={() => { 
              setActiveLink('refresh'); 
              fetchMessages(); 
              setTimeout(() => setActiveLink('inbox'), 500);
            }}
          >
            <FaSyncAlt className="futuristic-nav-icon" />
            <span>Yenile</span>
          </div>
          
          <Link to="/profile">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'profile' ? 'active' : ''}`} 
            >
              <FaUserAstronaut className="futuristic-nav-icon" />
              <span>Profil</span>
            </div>
          </Link>

          <Link to="/explore">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'explore' ? 'active' : ''}`} 
            >
              <FaGlobe className="futuristic-nav-icon" />
              <span>Keşfet</span>
            </div>
          </Link>

          <Link to="/statistics">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'statistics' ? 'active' : ''}`} 
            >
              <FaChartBar className="futuristic-nav-icon" />
              <span>İstatistikler</span>
            </div>
          </Link>

          <Link to="/notifications">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'notifications' ? 'active' : ''}`} 
            >
              <FaBell className="futuristic-nav-icon" />
              <span>Bildirimler</span>
            </div>
          </Link>

          <Link to="/settings">
            <div 
              className={`futuristic-nav-item group ${activeLink === 'settings' ? 'active' : ''}`} 
            >
              <FaCog className="futuristic-nav-icon" />
              <span>Ayarlar</span>
            </div>
          </Link>
        </nav>
        
        <div className="mt-auto mb-6 px-6">
          {isLoggedIn && (
            <div className="futuristic-card p-4 animate-fade-in">
              <div className="text-xs text-gray-400 mb-2 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span>Depolama:</span>
                  <span className="futuristic-badge">0 B / 40 MB</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 rounded-full w-[2%]"></div>
                </div>
              </div>
              <div className="futuristic-divider"></div>
              <div className="text-center text-xs text-indigo-400 mt-2">
                © NOVA MAIL {new Date().getFullYear()}
              </div>
            </div>
          )}
        </div>
      </aside>
      
      {/* Ana İçerik */}
      <main className="futuristic-content">
        {/* Üst Bar - Email adresi ve logout butonu */}
        {isLoggedIn && (
          <div className="futuristic-header">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium bg-black/20 rounded-md px-3 py-1.5 border border-indigo-500/20">
                {account?.address}
              </div>
              <div className="futuristic-badge">
                <FaRocket className="w-3 h-3 mr-1" /> Premium
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              <button 
                onClick={deleteAccount}
                className="futuristic-icon-button"
                title="Hesabı Sil"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              
              <button 
                onClick={logout}
                className="futuristic-icon-button"
                title="Çıkış"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* İçerik Alanı / Router */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <InboxView 
                  account={account}
                  messages={messages}
                  loading={loading}
                  fetchMessages={fetchMessages}
                  selectedMessage={selectedMessage}
                  fetchMessage={fetchMessage}
                  deleteMessage={deleteMessage}
                />
              } />
              <Route path="/profile" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ProfilePage />
                </Suspense>
              } />
              <Route path="/explore" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ExploreView />
                </Suspense>
              } />
              <Route path="/statistics" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <StatisticsView />
                </Suspense>
              } />
              <Route path="/notifications" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <NotificationsView />
                </Suspense>
              } />
              <Route path="/settings" element={
                <Suspense fallback={<SuspenseFallback />}>
                  <SettingsView />
                </Suspense>
              } />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark" 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { fetchDomains, domains, loading, createAccount, isLoggedIn } = useMailStore();
  const initRef = useRef(false);
  const navigate = useNavigate();
  
  // Giriş durumu değiştiğinde yönlendirme yap
  useEffect(() => {
    // Eğer giriş yapıldıysa ve /login sayfasındaysa, ana sayfaya yönlendir
    if (isLoggedIn && window.location.pathname === '/login') {
      navigate('/');
    }
    // Eğer giriş yapılmadıysa ve ana sayfadaysa veya korunan bir sayfadaysa, login sayfasına yönlendir
    else if (!isLoggedIn && window.location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      if (domains && domains.length === 0 && typeof fetchDomains === 'function') {
        console.log("Domainler yükleniyor...");
        try {
          fetchDomains();
        } catch (error) {
          console.error("Domain yükleme hatası:", error);
        }
      }
    }
  }, [domains, fetchDomains]);
  
  return (
    <Routes>
      {/* Login sayfası - her zaman erişilebilir */}
      <Route path="/login" element={
        <LoginForm 
          onCreateAccount={async (username, domain, password) => {
            try {
              return await createAccount(username, domain, password);
            } catch (error) {
              console.error('Hesap oluşturma hatası:', error);
              throw error;
            }
          }} 
          fetchDomains={fetchDomains} 
          domains={domains || []} 
          loading={loading} 
        />
      } />

      {/* Diğer tüm sayfalar */}
      <Route path="*" element={
        <Suspense fallback={<SuspenseFallback />}>
          <AnimatedRoutes />
        </Suspense>
      } />
    </Routes>
  );
}

export default App; 