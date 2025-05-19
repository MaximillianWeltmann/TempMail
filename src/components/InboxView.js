import React, { useEffect, useState, useRef } from 'react';
import { FaSpinner, FaEnvelope, FaTrash, FaSync, FaCopy, FaRegStar, FaInbox, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MessageView from './MessageView';

const InboxView = ({ 
  account, 
  messages, 
  loading, 
  fetchMessages, 
  selectedMessage, 
  fetchMessage, 
  deleteMessage 
}) => {
  const [lastRefreshClickTime, setLastRefreshClickTime] = useState(0);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const initialLoadDone = useRef(false);

  // Component yüklendiğinde mesajları getir (bir kere)
  useEffect(() => {
    // Sadece bir kez çalışacak ilk yükleme işlemi
    if (!initialLoadDone.current) {
      const getMessages = async () => {
        try {
          if (messages.length === 0) {
            await fetchMessages();
          }
        } catch (error) {
          console.error("Mesaj getirme hatası:", error);
          toast.error("Mesajlar yüklenirken bir hata oluştu");
        }
      };
      
      getMessages();
      initialLoadDone.current = true;
    }
    
    // Mesaj boşsa 3 saniye sonra boş durumu göster
    const timer = setTimeout(() => {
      if (messages.length === 0 && !loading) {
        setShowEmptyState(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [fetchMessages, messages.length, loading]);

  // Sadece messages değiştiğinde çalışacak useEffect
  useEffect(() => {
    // İçeriği otomatik seç (sadece bir mesaj varsa ve henüz seçili mesaj yoksa)
    if (messages.length > 0 && !selectedMessage && initialLoadDone.current) {
      fetchMessage(messages[0].id);
    }
    
    // Mesaj listesi boş ve yükleme tamamlandıysa, boş durumu göster
    if (messages.length === 0 && !loading) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
  }, [messages, selectedMessage, loading, fetchMessage]);

  // Yenile butonuna basılınca manuel mesaj yenileme
  const handleRefresh = () => {
    // Hız sınırlamasını aşmamak için minimum 10 saniye aralıkla yenileme yap
    const now = Date.now();
    if (now - lastRefreshClickTime < 10000) {
      toast.info('Lütfen yenilemeler arasında biraz bekleyin');
      return;
    }
    
    setLastRefreshClickTime(now);
    fetchMessages();
    setShowEmptyState(false); // Yenilerken boş durumu gizle
    toast.info("Mesajlar yenileniyor...");
  };

  // Pano'ya e-posta adresini kopyala
  const handleCopyEmail = () => {
    if (account && account.address) {
      navigator.clipboard.writeText(account.address)
        .then(() => {
          toast.success('E-posta adresi kopyalandı!');
        })
        .catch(() => {
          toast.error('Kopyalama işlemi başarısız oldu.');
        });
    }
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Boş durum gösterimi
  if (showEmptyState && messages.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-gradient-to-br from-black to-indigo-950/40">
        <div className="futuristic-card p-8 max-w-md mx-auto animate-zoom-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <FaInbox className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-medium text-center futuristic-text-gradient mb-2">Gelen Kutusu Boş</h2>
          <p className="text-gray-400 text-center mb-6">
            Henüz hiç mesajınız yok. E-posta adresiniz: <br/>
            <span className="text-indigo-400 font-mono bg-black/30 px-2 py-1 rounded border border-indigo-500/20 mt-1 inline-block">{account?.address}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleCopyEmail} 
              className="futuristic-button"
            >
              <FaCopy className="w-4 h-4 mr-2" /> Adresi Kopyala
            </button>
            <button 
              onClick={handleRefresh}
              className="futuristic-button"
            >
              <FaSync className="w-4 h-4 mr-2" /> Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sol Bölüm - E-posta Listesi */}
      <div className="w-1/3 border-r border-indigo-500/20 flex flex-col bg-black/40 backdrop-blur-md">
        <div className="p-3 border-b border-indigo-500/20 bg-black/30 flex justify-between items-center">
          <div className="text-sm font-medium text-indigo-300 flex items-center">
            <FaInbox className="mr-2 h-4 w-4" />
            <span className="futuristic-badge ml-2">{messages.length}</span>
          </div>
          <button 
            onClick={handleRefresh} 
            className="futuristic-icon-button"
            disabled={loading}
            title="Yenile"
          >
            {loading ? (
              <FaSpinner className="animate-spin h-4 w-4" />
            ) : (
              <FaSync className="h-4 w-4 transform hover:rotate-180 transition-transform duration-500" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto futuristic-scroll">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-6 text-indigo-400">
              <p>Mesajlar yükleniyor veya mevcut değil</p>
              <button 
                onClick={handleRefresh}
                className="futuristic-button mt-4"
              >
                <FaSync className="w-4 h-4 mr-2" /> Tekrar Dene
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-indigo-500/10">
              {messages.map((message, index) => (
                <li key={message.id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div
                    onClick={() => fetchMessage(message.id)}
                    className={`
                      p-4 hover:bg-indigo-600/10 cursor-pointer transition-colors
                      ${selectedMessage && selectedMessage.id === message.id ? 'bg-indigo-600/20 border-l-2 border-indigo-500' : ''}
                      ${!message.seen ? 'font-semibold' : ''}
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-200 truncate flex items-center">
                        {!message.seen && (
                          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-2 shadow-[0_0_5px_rgba(99,102,241,0.7)]"></span>
                        )}
                        {message.from.name || message.from.address}
                      </p>
                      <div className="flex items-center">
                        <p className="text-xs text-indigo-400 whitespace-nowrap futuristic-badge ml-2">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 truncate mt-1 font-medium">
                      {message.subject || "(Konu Yok)"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1.5">
                      {message.intro || "Mesaj içeriği yükleniyor..."}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-indigo-400 text-xs">
                        <FaRegStar className="inline-block mr-1" /> Normal
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message.id);
                        }}
                        className="futuristic-icon-button p-1.5"
                        title="Sil"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sağ Bölüm - Mesaj İçeriği */}
      <div className="w-2/3 bg-gradient-to-br from-black to-indigo-950/30 backdrop-blur-sm">
        <MessageView
          selectedMessage={selectedMessage}
          loading={loading}
          deleteMessage={deleteMessage}
        />
      </div>
    </div>
  );
};

export default InboxView; 