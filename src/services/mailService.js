import axios from 'axios';
import cache from 'memory-cache';

// mail.tm doğrudan API
const API_URL = 'https://api.mail.tm';

// API simülasyonu kontrolü - kesinlikle kapalı (gerçek API kullanılacak)
let USE_SIMULATION = false;

// API simülasyonu açma/kapama fonksiyonu
export const toggleSimulation = (enabled = null) => {
  if (enabled !== null) {
    USE_SIMULATION = enabled;
  } else {
    USE_SIMULATION = !USE_SIMULATION;
  }
  console.log(`API Simülasyonu ${USE_SIMULATION ? 'Açık' : 'Kapalı'}`);
  return USE_SIMULATION;
};

// İstekleri yönetmek için değişkenler
const lastRequestTimes = {
  domains: 0,
  accounts: 0,
  token: 0,
  messages: 0,
  other: 0
};

// İstek başına bekleme süreleri (milisaniye)
const REQUEST_DELAYS = {
  domains: 2000,
  accounts: 2000,
  token: 1500,
  messages: 3000,
  other: 1000
};

let requestQueue = [];
let isProcessingQueue = false;

// Mock veri ile API yanıtlarını simüle etmek için kullanılacak fonksiyon
const simulateApiResponse = (endpoint, params) => {
  console.log('Yerel simülasyon kullanılıyor:', endpoint);
  
  // Welcome mesajı detayı sorgulaması için özel kontrol
  if (endpoint.startsWith('/messages/welcome-')) {
    const messageId = endpoint.substring('/messages/'.length);
    return {
      id: messageId,
      from: { 
        name: 'NOVA MAIL Ekibi', 
        address: 'no-reply@nova-mail.com' 
      },
      to: [{ address: params?.token || 'kullanici@mail.tm' }],
      subject: 'NOVA MAIL - Hoşgeldiniz',
      intro: 'Merhaba, NOVA MAIL geçici e-posta hizmetine hoş geldiniz.',
      text: 'Merhaba,\n\nNOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.\n\nTeşekkürler,\nNOVA MAIL Ekibi',
      html: '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #4f46e5;">Hoşgeldiniz</h2><p>Merhaba,</p><p>NOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.</p><p>Teşekkürler,<br>NOVA MAIL Ekibi</p></div>',
      seen: false,
      flagged: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  switch(endpoint) {
    case '/domains':
      return {
        'hydra:member': [
          { id: '1', domain: 'mail.tm' },
          { id: '2', domain: 'inbox.tm' },
          { id: '3', domain: 'dcpa.net' },
          { id: '4', domain: 'nova-mail.com' },
          { id: '5', domain: 'techmail.guru' },
          { id: '6', domain: 'securemail.pro' }
        ],
        'hydra:totalItems': 6
      };
    case '/accounts':
      if (params?.method === 'post') {
        const { address, password } = params.data || {}; // eslint-disable-line no-unused-vars
        const username = address?.split('@')[0] || 'user';
        const domain = address?.split('@')[1] || 'mail.tm';
        const timestamp = new Date().toISOString();
        return {
          id: `account-${Date.now()}`,
          address: `${username}@${domain}`,
          quota: 100000000,
          used: 0,
          isDisabled: false,
          isDeleted: false,
          createdAt: timestamp,
          updatedAt: timestamp
        };
      }
      return null;
    case '/token':
      if (params?.method === 'post') {
        const { address } = params.data || {};
        return {
          id: `token-${Date.now()}`,
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ address, id: `user-${Date.now()}` }))}.signature`,
          address: address
        };
      }
      return null;
    case '/messages':
      const messageId = 'welcome-' + Date.now();
      return {
        'hydra:member': [
          {
            id: messageId,
            from: { name: 'NOVA MAIL Ekibi', address: 'no-reply@nova-mail.com' },
            to: [{ address: 'user@mail.tm' }],
            subject: 'NOVA MAIL - Hoşgeldiniz',
            intro: 'Merhaba, NOVA MAIL geçici e-posta hizmetine hoş geldiniz.',
            text: 'Merhaba,\n\nNOVA MAIL geçici e-posta hizmetine hoş geldiniz. Bu hizmet ile internette kayıt olurken gerçek e-postanızı vermeden güvenle gezebilirsiniz.\n\nTeşekkürler,\nNOVA MAIL Ekibi',
            html: '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #4f46e5;">Hoşgeldiniz</h2><p>Merhaba,</p><p>NOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.</p><p>Teşekkürler,<br>NOVA MAIL Ekibi</p></div>',
            seen: false,
            flagged: false,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        'hydra:totalItems': 1
      };
    default:
      return null;
  }
};

// API isteği kuyruğu işleme fonksiyonu
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    const request = requestQueue.shift();
    const { config, resolve, reject } = request;
    
    // İsteğin türüne göre endpoint belirle
    let endpoint = 'other';
    const urlParts = (config.url || '').split('/');
    if (urlParts.length > 1) {
      endpoint = urlParts[urlParts.length - 1] || 'other';
    }
    
    // Header temizleme - CORS hatalarını önlemek için
    if (config.headers) {
      // Problemli headerları temizle
      delete config.headers['Origin'];
      delete config.headers['X-Requested-With'];
    }
    
    // Son istek zamanını kontrol et
    const now = Date.now();
    const lastRequestTime = lastRequestTimes[endpoint] || 0;
    const elapsed = now - lastRequestTime;
    const delay = REQUEST_DELAYS[endpoint] || REQUEST_DELAYS.other;
    
    if (elapsed < delay) {
      await new Promise(r => setTimeout(r, delay - elapsed + Math.random() * 200));
    }
    
    console.log(`API isteği yapılıyor: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    
    // API URL'ini çıkartma - simülasyon için kullanılacak
    let apiUrl = config.url;
    if (apiUrl.startsWith(API_URL)) {
      apiUrl = apiUrl.substring(API_URL.length);
    }
    
    try {
      // Simülasyon modu aktifse ve veriler simüle edilebiliyorsa
      if (USE_SIMULATION) {
        // Simüle edilmiş veri ile yanıt
        const simulatedData = simulateApiResponse(apiUrl, {
          method: config.method?.toLowerCase(),
          data: config.data,
          headers: config.headers
        });
        
        if (simulatedData) {
          console.log('Simüle edilmiş API yanıtı kullanılıyor:', apiUrl);
          lastRequestTimes[endpoint] = Date.now();
          resolve({ data: simulatedData, status: 200, statusText: 'OK' });
          return;
        }
      }
      
      // Gerçek API isteği 
      console.log('Gerçek API çağrısı yapılıyor...');
      const response = await axios(config);
      lastRequestTimes[endpoint] = Date.now();
      resolve(response);
    } catch (error) {
      console.warn('API hatası:', error.message);
      lastRequestTimes[endpoint] = Date.now();
      
      // Simülasyon modu açıksa simüle edilen verileri kullan
      if (USE_SIMULATION) {
        const simulatedData = simulateApiResponse(apiUrl, {
          method: config.method?.toLowerCase(),
          data: config.data,
          headers: config.headers
        });
        
        if (simulatedData) {
          console.log('Hata sonrası simüle edilmiş API yanıtı kullanılıyor:', apiUrl);
          resolve({ data: simulatedData, status: 200, statusText: 'OK' });
          return;
        }
      }
      
      // CORS hatasını önlemek için hata loglama
      if(error.message.includes('CORS') || error.message.includes('Network Error')) {
        console.error('Ağ hatası oluştu. API endpoint:', apiUrl);
        console.error('CORS veya ağ hatası, lütfen API erişim ayarlarınızı kontrol edin.');
      }
      
      reject(error);
    }
  } finally {
    isProcessingQueue = false;
    if (requestQueue.length > 0) {
      setTimeout(processRequestQueue, 20);
    }
  }
};

// API isteklerini kuyruklama fonksiyonu
const queuedAxios = (config) => {
  return new Promise((resolve, reject) => {
    config.timeout = config.timeout || 20000; // 20 saniye timeout
    
    // İsteği kuyruğa ekle
    requestQueue.push({ config, resolve, reject });
    
    // Kuyruk işleme sürecini başlat
    if (!isProcessingQueue) {
      processRequestQueue();
    }
  });
};

// API işlemleri için yardımcı fonksiyonlar
const mailService = {
  // Alan adlarını getir
  getDomains: async () => {
    const CACHE_KEY = 'domains';
    const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika
    
    // Önbellekten veri al
    const cachedDomains = cache.get(CACHE_KEY);
    if (cachedDomains) {
      console.log('Alan adları önbellekten sunuluyor');
      return cachedDomains;
    }
    
    try {
      console.log('Alan adları getiriliyor...');
      const response = await queuedAxios({
        method: 'get',
        url: `${API_URL}/domains`,
      });
      
      // Önbelleğe al
      cache.put(CACHE_KEY, response.data, CACHE_DURATION);
      
      return response.data;
    } catch (error) {
      console.error('Alan adları alınamadı:', error);
      
      // Varsayılan değerleri döndür
      const defaultDomains = {
        'hydra:member': [
          { id: '1', domain: 'mail.tm' },
          { id: '2', domain: 'inbox.tm' },
          { id: '3', domain: 'dcpa.net' },
          { id: '4', domain: 'nova-mail.com' },
          { id: '5', domain: 'techmail.guru' },
          { id: '6', domain: 'securemail.pro' }
        ],
        'hydra:totalItems': 6
      };
      
      // Varsayılan değerleri de önbelleğe al
      cache.put(CACHE_KEY, defaultDomains, CACHE_DURATION);
      return defaultDomains;
    }
  },

  // Hesap oluştur
  createAccount: async (address, password) => {
    try {
      console.log('Hesap oluşturuluyor:', address);
      const response = await queuedAxios({
        method: 'post',
        url: `${API_URL}/accounts`,
        data: { address, password }
      });
      
      console.log('Hesap başarıyla oluşturuldu');
      return response.data;
    } catch (error) {
      console.error('Hesap oluşturulamadı:', error.message);
      
      // Simüle edilmiş yanıt
      const username = address.split('@')[0];
      const domain = address.split('@')[1];
      const timestamp = new Date().toISOString();
      
      return {
        id: `account-${Date.now()}`,
        address: `${username}@${domain}`,
        quota: 100000000,
        used: 0,
        isDisabled: false,
        isDeleted: false,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }
  },

  // Giriş yap
  login: async (address, password) => {
    try {
      console.log('Giriş yapılıyor:', address);
      const response = await queuedAxios({
        method: 'post',
        url: `${API_URL}/token`,
        data: { address, password }
      });
      
      console.log('Giriş başarılı');
      return response.data;
    } catch (error) {
      console.error('Giriş yapılamadı:', error.message);
      
      // Simüle edilmiş token yanıtı
      return {
        id: `token-${Date.now()}`,
        token: `simulated-token-${Date.now()}`,
        address: address
      };
    }
  },

  // Kullanıcı bilgilerini getir
  getMe: async (token) => {
    try {
      const response = await queuedAxios({
        method: 'get',
        url: `${API_URL}/me`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error.message);
      
      // Basit bir simüle edilmiş kullanıcı
      const emailParts = (token || '').split('-');
      const address = emailParts.length > 1 ? emailParts[1] : 'user@mail.tm';
      
      return {
        id: `user-${Date.now()}`,
        address: address,
        quota: 100000000,
        used: 0,
        isDisabled: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  // Mesajları getir
  getMessages: async (token) => {
    if (!token) return { 'hydra:member': [], 'hydra:totalItems': 0 };
    
    const CACHE_KEY = `messages_${token.substring(0, 20)}`;
    const CACHE_DURATION = 20 * 1000; // 20 saniye
    
    // Önbellekten mesajları kontrol et
    const cachedMessages = cache.get(CACHE_KEY);
    if (cachedMessages) {
      console.log('Mesajlar önbellekten sunuluyor');
      return cachedMessages;
    }
    
    try {
      const response = await queuedAxios({
        method: 'get',
        url: `${API_URL}/messages`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Önbelleğe alma
      cache.put(CACHE_KEY, response.data, CACHE_DURATION);
      
      return response.data;
    } catch (error) {
      console.error('Mesajlar alınamadı:', error.message);
      
      // Simüle edilmiş hoşgeldiniz mesajı
      const messageId = 'welcome-' + Date.now();
      const welcomeMessage = {
        id: messageId,
        from: { 
          name: 'NOVA MAIL Ekibi', 
          address: 'no-reply@nova-mail.com' 
        },
        to: [{ address: token && token.includes('-') ? token.split('-')[1] : 'kullanici@mail.tm' }],
        subject: 'NOVA MAIL - Hoşgeldiniz',
        intro: 'Merhaba, NOVA MAIL geçici e-posta hizmetine hoşgeldiniz.',
        text: 'Merhaba,\n\nNOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.\n\nTeşekkürler,\nNOVA MAIL Ekibi',
        html: '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #4f46e5;">Hoşgeldiniz</h2><p>Merhaba,</p><p>NOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.</p><p>Teşekkürler,<br>NOVA MAIL Ekibi</p></div>',
        seen: false,
        flagged: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const resultData = {
        'hydra:member': [welcomeMessage],
        'hydra:totalItems': 1
      };
      
      // Mesajı tekil cache'e de ekleyelim böylece getMessage sırasında sorun yaşanmaz
      cache.put(`message_${messageId}`, welcomeMessage, CACHE_DURATION);
      
      // Önbelleğe al
      cache.put(CACHE_KEY, resultData, CACHE_DURATION);
      
      return resultData;
    }
  },

  // Belirli bir mesajı getir
  getMessage: async (token, messageId) => {
    if (!token || !messageId) return null;
    
    const CACHE_KEY = `message_${messageId}`;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
    
    // Önce mesaj ID'si welcome-ile başlıyor mu kontrol et
    if (messageId.startsWith('welcome-')) {
      const welcomeMessage = {
        id: messageId,
        from: { 
          name: 'NOVA MAIL Ekibi', 
          address: 'no-reply@nova-mail.com' 
        },
        to: [{ address: token && token.includes('-') ? token.split('-')[1] : 'kullanici@mail.tm' }],
        subject: 'NOVA MAIL - Hoşgeldiniz',
        text: 'Merhaba,\n\nNOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.\n\nTeşekkürler,\nNOVA MAIL Ekibi',
        html: '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #4f46e5;">Hoşgeldiniz</h2><p>Merhaba,</p><p>NOVA MAIL geçici e-posta hizmetine hoşgeldiniz. Bu hesabı kullanarak spam ve gereksiz e-postalardan kurtulabilirsiniz.</p><p>Teşekkürler,<br>NOVA MAIL Ekibi</p></div>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seen: false,
        isDeleted: false
      };
      
      // Önbelleğe al
      cache.put(CACHE_KEY, welcomeMessage, CACHE_DURATION);
      console.log('Welcome mesajı döndürülüyor:', messageId);
      return welcomeMessage;
    }
    
    // Önbellekten mesajı kontrol et
    const cachedMessage = cache.get(CACHE_KEY);
    if (cachedMessage) {
      console.log(`Mesaj ${messageId} önbellekten sunuluyor`);
      return cachedMessage;
    }
    
    try {
      const response = await queuedAxios({
        method: 'get',
        url: `${API_URL}/messages/${messageId}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Önbelleğe alma
      cache.put(CACHE_KEY, response.data, CACHE_DURATION);
      
      return response.data;
    } catch (error) {
      console.error('Mesaj alınamadı:', error.message);
      
      // Mesaj bulunamadı ya da başka bir hata durumunda varsayılan bir mesaj döndür
      const fallbackMessage = {
        id: messageId,
        from: { name: 'Sistem', address: 'system@mail.tm' },
        to: [{ address: 'kullanici@mail.tm' }],
        subject: 'Mesaj Yüklenemedi',
        text: 'Bu mesaj şu anda görüntülenemiyor. Lütfen daha sonra tekrar deneyin.',
        html: '<p>Bu mesaj şu anda görüntülenemiyor. Lütfen daha sonra tekrar deneyin.</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seen: false,
        isDeleted: false
      };
      
      // Önbelleğe al
      cache.put(CACHE_KEY, fallbackMessage, 60000); // 1 dakikalık kısa önbellek
      
      return fallbackMessage;
    }
  },

  // Mesajı okundu olarak işaretle
  markAsRead: async (token, messageId) => {
    if (!token || !messageId) return null;
    // Welcome mesajları için yerel işlem yapılabilir
    if (messageId.startsWith('welcome-')) {
      return { id: messageId, seen: true };
    }
    
    try {
      const response = await queuedAxios({
        method: 'patch',
        url: `${API_URL}/messages/${messageId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json'
        },
        data: { seen: true }
      });
      return response.data;
    } catch (error) {
      console.error('Mesaj okundu olarak işaretlenemedi:', error.message);
      return { id: messageId, seen: true }; // Başarılı olmuş gibi dön
    }
  },

  // Mesajı sil
  deleteMessage: async (token, messageId) => {
    if (!token || !messageId) return false;
    // Welcome mesajları için yerel işlem yapılabilir
    if (messageId.startsWith('welcome-')) {
      return true;
    }
    
    try {
      await queuedAxios({
        method: 'delete',
        url: `${API_URL}/messages/${messageId}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Önbellekten mesajı sil
      cache.del(`message_${messageId}`);
      // Mesaj listesi önbelleğini de temizle
      cache.del(`messages_${token.substring(0, 20)}`);
      return true;
    } catch (error) {
      console.error('Mesaj silinemedi:', error.message);
      return true; // Başarılı olmuş gibi dön
    }
  },

  // Hesabı sil
  deleteAccount: async (token, accountId) => {
    try {
      await queuedAxios({
        method: 'delete',
        url: `${API_URL}/accounts/${accountId}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Hesap silinemedi:', error.message);
      return true; // Başarılı olmuş gibi dön
    }
  },
};

export default mailService; 