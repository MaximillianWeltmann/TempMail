import React from 'react';
import { motion } from 'framer-motion';
import { FaUserAstronaut, FaEnvelope, FaUserShield, FaCalendar } from 'react-icons/fa';
import { useMailStore } from '../hooks/useMailStore';

const ProfilePage = () => {
  const { account } = useMailStore();

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
        <h1 className="text-2xl font-bold mb-6 futuristic-text-gradient">Profil Bilgileri</h1>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
            <div className="w-32 h-32 bg-indigo-900/30 rounded-full border border-indigo-500/30 flex items-center justify-center mb-4">
              <FaUserAstronaut className="w-16 h-16 text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-300">Kullanıcı</h2>
              <p className="text-gray-500 text-sm">Geçici Hesap</p>
            </div>
          </div>

          <div className="md:w-2/3 md:pl-8">
            <div className="space-y-4">
              <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30 flex items-center">
                <FaEnvelope className="text-indigo-400 w-5 h-5 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">E-posta Adresi</p>
                  <p className="text-gray-300">{account?.address || "Hesap bulunamadı"}</p>
                </div>
              </div>

              <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30 flex items-center">
                <FaUserShield className="text-indigo-400 w-5 h-5 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Gizlilik Durumu</p>
                  <p className="text-gray-300">Yüksek (Geçici Hesap)</p>
                </div>
              </div>

              <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30 flex items-center">
                <FaCalendar className="text-indigo-400 w-5 h-5 mr-4" />
                <div>
                  <p className="text-gray-500 text-sm">Oluşturulma Tarihi</p>
                  <p className="text-gray-300">
                    {account?.createdAt ? new Date(account.createdAt).toLocaleString('tr-TR') : "Bilinmiyor"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="futuristic-panel p-6 bg-black/30">
        <h2 className="text-xl font-bold mb-4 futuristic-text-gradient">Hesap Kullanımı</h2>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Depolama</span>
            <span className="text-indigo-400">{account?.used || 0} B / {account?.quota || 40} MB</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full" 
              style={{ width: `${account?.used ? (account.used / account.quota * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          Geçici e-posta hesapları genellikle 24 saat sonra otomatik olarak silinir. 
          Önemli mesajlarınızı yedeklemeyi unutmayın.
        </p>
      </div>
    </motion.div>
  );
};

export default ProfilePage; 