import { useState, useEffect, useCallback, useRef } from 'react';
import mailService from '../services/mailService';
import { toast } from 'react-toastify';

// Tekrar denemeler için sabitler
const RETRY_DELAY = 3000; // ms
const MAX_RETRIES = 3;

export const useMailStore = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [domains, setDomains] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const refreshIntervalRef = useRef(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const lastFetchTimeRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const corsRetryCountRef = useRef(0);
  
  // Varsayılan şifre
  const DEFAULT_PASSWORD = 'tempmail123';

  // Çıkış yap
  const logout = useCallback(() => {
    setAccount(null);
    setToken(null);
    setMessages([]);
    setSelectedMessage(null);
    
    localStorage.removeItem('tempMailAccount');
    localStorage.removeItem('tempMailToken');
    
    // Tüm interval'ları temizle
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // LocalStorage'dan hesap verileri al
  useEffect(() => {
    const storedAccount = localStorage.getItem('tempMailAccount');
    const storedToken = localStorage.getItem('tempMailToken');
    
    if (storedAccount && storedToken) {
      setAccount(JSON.parse(storedAccount));
      setToken(storedToken);
    }
  }, []);

  // API çağrılarını güvenli şekilde yap ve CORS hatalarını yönet
  const safeApiCall = useCallback(async (apiFunc, ...args) => {
    let currentRetry = 0;
    
    while (currentRetry <= MAX_RETRIES) {
      try {
        return await apiFunc(...args);
      } catch (error) {
        // CORS hatası algılandıysa
        if (error.message && (
            error.message.includes('CORS') || 
            error.message.includes('network') ||
            error.message.includes('bağlanılamadı') ||
            error.code === 'ERR_NETWORK'
        )) {
          currentRetry++;
          corsRetryCountRef.current++;
          
          if (currentRetry <= MAX_RETRIES) {
            console.log(`CORS hatası, ${currentRetry}. deneme yapılıyor...`);
            await new Promise(r => setTimeout(r, RETRY_DELAY * currentRetry));
            continue; // Döngüde kalıp tekrar dene
          } else {
            // Maksimum deneme sayısı aşıldı
            console.error('Maksimum CORS yeniden deneme sayısı aşıldı');
            toast.error('API sunucusuna bağlanılamıyor. Lütfen farklı bir tarayıcı veya VPN kullanmayı deneyin.');
            throw new Error('API erişim hatası: Maksimum yeniden deneme sayısı aşıldı');
          }
        } else {
          // Başka bir hata
          throw error;
        }
      }
    }
  }, []);

  // Bağımlılık sorununu önlemek için - fetchMessages'i önce tanımlayalım
  const updateMessages = useCallback(async () => {
    if (!token) return;
    
    // Hız sınırlamasını önlemek için son istek üzerinden en az 10 saniye geçmişse istek at
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 10000) {
      console.log('Çok sık istek atılıyor, biraz bekleyiniz...');
      return;
    }
    
    lastFetchTimeRef.current = now;
    setLastFetchTime(now);
    
    try {
      setLoading(true);
      const response = await safeApiCall(mailService.getMessages, token);
      if (response && response['hydra:member']) {
        setMessages(response['hydra:member']);
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      
      if (error.response && error.response.status === 401) {
        logout();
        toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
      } 
      else if (error.response && error.response.status === 429) {
        toast.warn('API hız sınırlaması: Mesajlar geçici olarak yüklenemiyor, biraz sonra tekrar deneyiniz.');
      }
      else if (!error.response && corsRetryCountRef.current >= MAX_RETRIES) {
        toast.error('Sunucuya erişilemiyor. İnternet bağlantınızı kontrol edin veya VPN kullanmayı deneyin.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, safeApiCall, logout]);
  
  // fetchMessages'i updateMessages referansını kullanacak şekilde güncelliyoruz
  const fetchMessages = useCallback(updateMessages, [updateMessages]);

  // Use effect'i updateMessages ile güncelliyoruz
  useEffect(() => {
    if (token) {
      // Bileşen ilk defa yüklendiğinde veya token değiştiğinde mesajları getir
      const loadMessages = async () => {
        try {
          if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
          }
          
          await updateMessages();
          
          // Zamanlayıcıyı başlat
          refreshIntervalRef.current = setInterval(() => {
            const now = Date.now();
            if (now - lastFetchTimeRef.current >= 10000) {
              updateMessages();
            }
          }, 120000);
        } catch (error) {
          console.error('Mesaj yükleme hatası:', error);
        }
      };
      
      loadMessages();
    }
    
    // Temizleme işlevi
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [token]); // updateMessages'i bağımlılıklardan çıkarıp yalnızca token değiştiğinde çalıştır

  // Alan adlarını getir
  const fetchDomains = useCallback(async () => {
    // State'ten domains'i doğrudan alıyoruz
    const currentDomains = domains;
    if (currentDomains.length > 0) return currentDomains; // Zaten alan adları varsa tekrar istek atma
    
    try {
      setLoading(true);
      const response = await safeApiCall(mailService.getDomains);
      if (response && response['hydra:member'] && response['hydra:member'].length > 0) {
        setDomains(response['hydra:member']);
        return response['hydra:member'];
      } else {
        // API varsayılan değerler döndürebilir
        const defaultDomains = [
          { id: '1', domain: 'mail.tm' },
          { id: '2', domain: 'inbox.tm' },
          { id: '3', domain: 'dcpa.net' },
          { id: '4', domain: 'nova-mail.com' },
          { id: '5', domain: 'techmail.guru' },
          { id: '6', domain: 'securemail.pro' }
        ];
        setDomains(defaultDomains);
        return defaultDomains;
      }
    } catch (error) {
      console.error('Alan adları yüklenirken hata:', error);
      // Varsayılan alan adlarını ayarla
      const defaultDomains = [
        { id: '1', domain: 'mail.tm' },
        { id: '2', domain: 'inbox.tm' },
        { id: '3', domain: 'dcpa.net' },
        { id: '4', domain: 'nova-mail.com' },
        { id: '5', domain: 'techmail.guru' },
        { id: '6', domain: 'securemail.pro' }
      ];
      setDomains(defaultDomains);
      
      if (error.response && error.response.status === 429) {
        toast.warn('API hız sınırlaması: Varsayılan alan adları kullanılıyor');
      } else {
        toast.error('Alan adları yüklenirken bir hata oluştu, varsayılanlar kullanılıyor');
      }
      
      return defaultDomains;
    } finally {
      setLoading(false);
    }
  }, [safeApiCall, domains]); // safeApiCall bağımlılığını ekledik

  // Belirli bir mesajı getir ve oku - circular dependency'yi önlemek için updateMessages kullanıyoruz
  const fetchMessage = async (messageId) => {
    if (!token) return;
    
    if (selectedMessage && selectedMessage.id === messageId) {
      return selectedMessage;
    }
    
    try {
      setLoading(true);
      const message = await safeApiCall(mailService.getMessage, token, messageId);
      setSelectedMessage(message);
      
      await safeApiCall(mailService.markAsRead, token, messageId);
      
      const currentMessage = messages.find(msg => msg.id === messageId);
      if (currentMessage && !currentMessage.seen) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? {...msg, seen: true} 
              : msg
          )
        );
        
        const shouldRefresh = Math.random() > 0.85; // %15 ihtimalle yenile - daha da azalttım
        if (shouldRefresh) {
          const now = Date.now();
          if (now - lastFetchTimeRef.current > 20000) { // 20 saniye aralığa çıkardım
            setTimeout(() => updateMessages(), 2000);
          }
        }
      }
      
      return message;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast.warn('API hız sınırlaması: Mesaj detayları geçici olarak yüklenemiyor, biraz sonra tekrar deneyiniz.');
      } else if (!error.response && error.message && (
          error.message.includes('CORS') || 
          error.message.includes('API erişim hatası')
      )) {
        toast.error('API erişim sorunu: Mesaja erişilemiyor. VPN kullanmayı deneyin.');
      } else {
        toast.error('Mesaj yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Benzersiz kullanıcı adı oluştur
  const generateUniqueUsername = (username) => {
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 1000);
    return `${username}${timestamp}${randomNum}`;
  };

  // Hesap oluştur
  const createAccount = async (username, domain, password = DEFAULT_PASSWORD) => {
    // API hız sınırlaması denemelerini sınırla
    if (retryCount > 3) {
      toast.error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyip tekrar deneyin.');
      setRetryCount(0);
      throw new Error('Deneme limiti aşıldı');
    }
    
    try {
      setLoading(true);
      setRetryCount(prev => prev + 1);
      
      // Domainleri kontrol et
      if (!domain) {
        const availableDomains = await safeApiCall(fetchDomains);
        domain = availableDomains[0]?.domain || 'mail.tm';
      }
      
      const address = `${username}@${domain}`;
      
      // Şifrenin boş olma durumunu kontrol et
      if (!password || password.trim() === '') {
        console.log('Boş şifre sağlandı, varsayılan şifre kullanılıyor:', DEFAULT_PASSWORD);
        password = DEFAULT_PASSWORD;
      }
      
      console.log('Hesap oluşturma bilgileri:', {
        address,
        passwordLength: password.length,
        domain
      });
      
      // Hesap oluşturma işlemi
      let accountData;
      try {
        accountData = await safeApiCall(mailService.createAccount, address, password);
        console.log('Hesap başarıyla oluşturuldu:', accountData);
      } catch (createError) {
        console.warn('Hesap oluşturma hatası:', createError.message);
        
        // 429 (Hız sınırlaması) hatası kontrolü
        if (createError.response && createError.response.status === 429) {
          toast.warn('API hız sınırlaması nedeniyle işlem geçici olarak yavaşlatıldı. Tekrar deneniyor...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Benzersiz bir kullanıcı adı oluştur ve tekrar dene
          const newUsername = generateUniqueUsername(username);
          return createAccount(newUsername, domain, password);
        } 
        // 422 (Doğrulama hatası) bu hesabın zaten var olduğunu gösterir
        else if (createError.response && createError.response.status === 422) {
          console.log('Hesap zaten var (422 hatası), benzersiz bir kullanıcı adı oluşturuluyor');
          toast.info('Bu e-posta adresi zaten kullanımda. Benzersiz bir adres oluşturuluyor...');
          
          // Benzersiz bir kullanıcı adı oluştur ve tekrar dene
          const newUsername = generateUniqueUsername(username);
          console.log('Oluşturulan yeni kullanıcı adı:', newUsername);
          
          // Kısa bir gecikme ekleyerek tekrar dene
          await new Promise(resolve => setTimeout(resolve, 1500));
          return createAccount(newUsername, domain, password);
        }
        // CORS hatası veya ağ hatası
        else if (createError.message && (
            createError.message.includes('CORS') || 
            createError.message.includes('bağlanılamadı') ||
            !createError.response
        )) {
          toast.error('API erişiminde sorun oluştu. Farklı bir tarayıcı veya VPN kullanmayı deneyin.');
          throw createError;
        } 
        else {
          // Başka hata tiplerinde farklı bir kullanıcı adı deneyelim
          toast.error(`Hesap oluşturulamadı: ${createError.message}`);
          throw createError;
        }
      }
      
      // Oturum açmayı dene
      try {
        toast.info('Hesap oluşturuldu, giriş yapılıyor...');
        
        // API çağrısından önce bir bekleme ekle
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const tokenData = await safeApiCall(mailService.login, address, password);
        console.log('Login başarılı, token alındı:', tokenData);
        
        // Eğer hesap oluşturulduysa, kullanıcı bilgilerini al
        let finalAccountData = accountData;
        
        toast.success('Geçici e-posta hesabınız oluşturuldu!');
        
        // State ve localStorage'ı güncelle
        setAccount(finalAccountData);
        setToken(tokenData.token);
        
        localStorage.setItem('tempMailAccount', JSON.stringify(finalAccountData));
        localStorage.setItem('tempMailToken', tokenData.token);
        
        setRetryCount(0); // Başarılı olduktan sonra sıfırla
        
        return { account: finalAccountData, token: tokenData.token };
      } catch (loginError) {
        console.error('Giriş yapılamadı:', loginError);
        
        // 429 hatasında bekle ve tekrar dene
        if (loginError.response && loginError.response.status === 429) {
          toast.warn('API hız sınırlaması: Biraz bekleniyor...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          return createAccount(username, domain, password);
        }
        
        // 401 hatasında farklı bir kullanıcı adı dene
        if (loginError.response && loginError.response.status === 401) {
          toast.info('Hesap erişimi sağlanamadı, farklı bir kullanıcı adı deneniyor...');
          const newUsername = generateUniqueUsername(username);
          return createAccount(newUsername, domain, DEFAULT_PASSWORD);
        }
        
        // CORS hatası veya ağ hatası 
        if (loginError.message && (
            loginError.message.includes('CORS') || 
            loginError.message.includes('bağlanılamadı') ||
            !loginError.response
        )) {
          toast.error('API erişiminde sorun oluştu. Farklı bir tarayıcı veya VPN kullanmayı deneyin.');
          throw loginError;
        }
        
        // Diğer hata durumlarında basit bir mesaj göster
        toast.error('Hesap oluşturma işlemi başarısız oldu. Lütfen tekrar deneyin.');
        throw loginError;
      }
    } catch (error) {
      console.error('Hesap işleminde genel hata:', error);
      
      if (error.response && error.response.status === 429) {
        toast.error('Çok fazla istek yapıldı. Lütfen bir süre bekleyin ve tekrar deneyin.');
      } else if (error.message && (
          error.message.includes('CORS') || 
          error.message.includes('API erişim')
      )) {
        toast.error('API sunucusuna erişilemiyor. VPN kullanmayı deneyin.');
      } else {
        toast.error(`Hesap oluşturulamadı: ${error.message || 'Bilinmeyen hata'}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mesajı sil
  const deleteMessage = async (messageId) => {
    if (!token) return;
    
    try {
      setLoading(true);
      await safeApiCall(mailService.deleteMessage, token, messageId);
      
      // Mesaj seçili ise temizle
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(null);
      }
      
      // Mesaj listesini güncelle (hemen değil, yavaşça)
      setTimeout(() => {
        // Varsayılan olarak mesajı listeden kaldır (API başarısız olsa bile UI güncellensin)
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      }, 500);
      
      toast.success('Mesaj silindi');
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast.warn('API hız sınırlaması: Mesaj silme işlemi geçici olarak kullanılamıyor, biraz sonra tekrar deneyiniz.');
        // Yine de UI'da mesajı silmiş gibi görüntüleyelim
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      } else {
        toast.error('Mesaj silinirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hesabı sil
  const deleteAccount = async () => {
    if (!token || !account) return;
    
    try {
      setLoading(true);
      await safeApiCall(mailService.deleteAccount, token, account.id);
      logout();
      toast.success('Hesabınız silindi');
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast.warn('API hız sınırlaması: Hesap silme işlemi geçici olarak kullanılamıyor, biraz sonra tekrar deneyiniz.');
        // Yine de UI'ı güncelleyelim
        logout();
      } else {
        toast.error('Hesap silinirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    account,
    token,
    messages,
    domains,
    selectedMessage,
    fetchDomains,
    fetchMessages,
    fetchMessage,
    createAccount,
    deleteMessage,
    deleteAccount,
    logout,
    isLoggedIn: !!token
  };
}; 