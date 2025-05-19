import React from 'react';
import { FaSpinner, FaTrash, FaEnvelopeOpen, FaReply, FaClock, FaUser } from 'react-icons/fa';

const MessageView = ({ selectedMessage, loading, deleteMessage }) => {
  // Mesajın HTML içeriğini güvenli bir şekilde render et
  const createMarkup = (html) => {
    return { __html: html };
  };

  // Mesaj içeriğini göster (HTML veya düz metin)
  const renderMessageContent = () => {
    if (selectedMessage.html) {
      return (
        <div 
          className="prose dark:prose-invert max-w-none message-content"
          dangerouslySetInnerHTML={createMarkup(selectedMessage.html)}
        />
      );
    } else if (selectedMessage.text) {
      return (
        <div className="message-content whitespace-pre-wrap font-mono text-sm text-gray-600 dark:text-gray-300">
          {selectedMessage.text}
        </div>
      );
    } else {
      return (
        <div className="message-content text-gray-500 dark:text-gray-400">
          Bu mesaj için içerik bulunamadı.
        </div>
      );
    }
  };

  // Tarihi formatla
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mesaj seçilmediyse bilgi mesajı göster
  if (!selectedMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-96 md:h-[calc(100vh-12rem)] p-8 text-center animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-full mb-4 shadow-lg">
          <FaEnvelopeOpen className="h-16 w-16 text-white" />
        </div>
        <h3 className="mt-4 text-xl font-medium text-gray-200">
          Görüntülemek için bir mesaj seçin
        </h3>
        <p className="mt-2 text-base text-gray-400 max-w-sm">
          Gelen e-postaları okumak için soldaki listeden bir mesaj seçin
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 md:h-[calc(100vh-12rem)]">
        <div className="text-center animate-pulse-slow">
          <FaSpinner className="animate-spin h-12 w-12 text-indigo-500 mb-4" />
          <p className="text-gray-400">Mesaj yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 md:h-[calc(100vh-12rem)] flex flex-col animate-zoom-in">
      {/* Mesaj Başlığı */}
      <div className="p-5 border-b border-indigo-500/20 flex justify-between items-center bg-black/20">
        <div>
          <h2 className="text-xl font-medium text-white">{selectedMessage.subject || "Konu Yok"}</h2>
          <div className="mt-2 flex items-center text-sm text-gray-300">
            <FaUser className="h-4 w-4 text-indigo-500 mr-2" />
            <span className="font-medium">
              {selectedMessage.from.name
                ? `${selectedMessage.from.name} <${selectedMessage.from.address}>`
                : selectedMessage.from.address}
            </span>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <FaClock className="h-3 w-3 mr-1" />
            <span>{formatDate(selectedMessage.createdAt)}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className="p-2 rounded-full text-gray-400 hover:text-indigo-400 hover:bg-black/20 transition-colors duration-200"
            title="Yanıtla"
          >
            <FaReply className="h-5 w-5" />
          </button>
          <button
            onClick={() => deleteMessage(selectedMessage.id)}
            className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-black/20 transition-colors duration-200"
            title="Sil"
          >
            <FaTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mesaj İçeriği */}
      <div className="flex-1 overflow-auto p-5 bg-black/10 backdrop-blur-sm">
        {renderMessageContent()}
      </div>
    </div>
  );
};

export default MessageView; 