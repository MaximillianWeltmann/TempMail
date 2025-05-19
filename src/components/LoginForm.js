import React, { useState, useEffect } from 'react';
import { FaSpinner, FaRandom, FaEnvelope, FaShieldAlt, FaUserSecret, FaRocket, FaUserAstronaut } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RANDOM_USERNAMES = [
  'mavi', 'yesil', 'kirmizi', 'turuncu', 'mor', 'sari', 
  'bulut', 'deniz', 'gokyuzu', 'doga', 'cicek', 'agac',
  'kelebek', 'kuslar', 'gezegen', 'yildiz', 'gunes', 'ay'
];

const LoginForm = ({ onCreateAccount, fetchDomains, domains, loading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('tempmail123'); // Basit bir varsayılan şifre
  const [selectedDomain, setSelectedDomain] = useState('');
  const navigate = useNavigate();

  // Component yüklendiğinde alan adlarını getir
  useEffect(() => {
    if (typeof fetchDomains === 'function') {
      fetchDomains();
    }
  }, [fetchDomains]);

  // Alan adları yüklendiğinde ilk alan adını seç
  useEffect(() => {
    if (domains.length > 0 && !selectedDomain) {
      setSelectedDomain(domains[0].domain);
    }
  }, [domains, selectedDomain]);

  // Rastgele kullanıcı adı oluştur
  const generateRandomUsername = () => {
    const adjective = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    const randomNum = Math.floor(Math.random() * 10000);
    return `${adjective}${randomNum}`;
  };

  // Rastgele kullanıcı adı ata
  const handleRandomUsername = () => {
    setUsername(generateRandomUsername());
  };

  // Form gönderildiğinde
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !selectedDomain) return;
    
    try {
      // Hesap oluştur ve promise'in çözülmesini bekle
      const result = await onCreateAccount(username, selectedDomain, password);
      console.log("Hesap oluşturuldu:", result);
      
      // Başarılı giriş sonrasında ana sayfaya yönlendir
      if (result && result.token) {
        console.log("Anasayfaya yönlendiriliyor...");
        navigate('/');
      }
    } catch (error) {
      console.error('Hesap oluşturma hatası:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-black to-indigo-950/40">
      <div className="w-full max-w-4xl backdrop-blur-lg">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.7)] mb-8 animate-pulse">
            <FaEnvelope className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold futuristic-text-gradient mb-3">NOVA MAIL</h1>
          <p className="text-xl text-gray-300">
            Ücretsiz, güvenli ve gizlilik odaklı geçici e-posta
          </p>
        </div>
        
        <div className="w-full max-w-xl mx-auto px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="username" className="block text-base font-medium text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <div className="flex rounded-md shadow-[0_0_20px_rgba(99,102,241,0.3)] overflow-hidden border border-indigo-500/40">
                <div className="relative flex items-stretch flex-grow">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-black/60 text-white placeholder-gray-500 border-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                    placeholder="kullaniciadi"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleRandomUsername}
                    className="absolute right-0 h-full px-4 flex items-center justify-center text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <FaRandom className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-shrink-0 bg-black/80 border-l border-indigo-500/40">
                  <select
                    id="domain"
                    name="domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="h-full py-0 pl-4 pr-8 bg-transparent text-indigo-400 focus:outline-none focus:ring-0 border-none text-lg"
                    disabled={domains.length === 0}
                  >
                    {domains.length === 0 ? (
                      <option>Yükleniyor...</option>
                    ) : (
                      domains.map((domain) => (
                        <option key={domain.id} value={domain.domain}>
                          @{domain.domain}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-medium rounded-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] flex items-center justify-center"
                disabled={loading || !username || !selectedDomain}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin h-6 w-6 mr-3" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "E-posta Oluştur"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-500/30"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-4 bg-black/40 backdrop-blur-sm rounded-lg text-gray-300 border border-indigo-500/20">
                  Neden geçici e-posta?
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="bg-indigo-900/20 border border-indigo-500/20 py-3 px-4 rounded-lg hover:bg-indigo-900/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                    <FaShieldAlt className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="ml-4 text-base text-gray-300">
                    İstenmeyen e-postalardan kaçının
                  </p>
                </div>
              </div>
              
              <div className="bg-emerald-900/20 border border-emerald-500/20 py-3 px-4 rounded-lg hover:bg-emerald-900/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <FaUserSecret className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="ml-4 text-base text-gray-300">
                    Kişisel bilgilerinizi koruyun
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-900/20 border border-amber-500/20 py-3 px-4 rounded-lg hover:bg-amber-900/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-900/50 rounded-full flex items-center justify-center border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <FaRocket className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="ml-4 text-base text-gray-300">
                    Kayıt olmadan hızlıca kullanın
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 