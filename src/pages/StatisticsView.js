import React, { useMemo } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { useMailStore } from '../hooks/useMailStore';

const StatisticsView = () => {
  const { messages } = useMailStore();
  
  // Gerçek mesaj verilerine dayalı istatistikler
  const statsData = useMemo(() => {
    // Toplam e-posta sayısı
    const totalEmails = messages.length;
    
    // Açılma oranı (görülen mesajların yüzdesi)
    const seenMessages = messages.filter(msg => msg.seen === true).length;
    const openRate = totalEmails > 0 ? Math.round((seenMessages / totalEmails) * 100) : 0;
    
    // Mesaj tipleri analizi (konu satırına göre basit kategorizasyon)
    const typeCounter = { 
      'Doğrulama': 0, 
      'Bilgilendirme': 0, 
      'Pazarlama': 0, 
      'Diğer': 0 
    };
    
    messages.forEach(msg => {
      const subject = msg.subject?.toLowerCase() || '';
      
      if (subject.includes('doğrula') || subject.includes('kod') || subject.includes('verify') || 
          subject.includes('confirm') || subject.includes('onay')) {
        typeCounter['Doğrulama']++;
      } else if (subject.includes('bilgi') || subject.includes('info') || 
                subject.includes('duyuru') || subject.includes('notice')) {
        typeCounter['Bilgilendirme']++;
      } else if (subject.includes('kampanya') || subject.includes('indirim') || 
                subject.includes('offer') || subject.includes('fırsat') || 
                subject.includes('subscribe')) {
        typeCounter['Pazarlama']++;
      } else {
        typeCounter['Diğer']++;
      }
    });
    
    // Tiplerine göre yüzdeler hesaplama
    const messageTypes = [];
    if (totalEmails > 0) {
      Object.entries(typeCounter).forEach(([name, count]) => {
        const value = Math.round((count / totalEmails) * 100);
        let color;
        
        switch (name) {
          case 'Doğrulama':
            color = 'bg-indigo-500';
            break;
          case 'Bilgilendirme':
            color = 'bg-purple-500';
            break;
          case 'Pazarlama':
            color = 'bg-teal-500';
            break;
          default:
            color = 'bg-orange-500';
        }
        
        messageTypes.push({ name, value, color });
      });
    } else {
      // Eğer mesaj yoksa varsayılan değerler
      messageTypes.push(
        { name: 'Doğrulama', value: 0, color: 'bg-indigo-500' },
        { name: 'Bilgilendirme', value: 0, color: 'bg-purple-500' },
        { name: 'Pazarlama', value: 0, color: 'bg-teal-500' },
        { name: 'Diğer', value: 0, color: 'bg-orange-500' }
      );
    }
    
    // Haftalık aktiviteyi hesaplama
    const daysOfWeek = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const weeklyActivity = daysOfWeek.map(day => ({ day, value: 0 }));
    
    messages.forEach(msg => {
      try {
        const date = new Date(msg.createdAt);
        const dayIndex = date.getDay(); // 0=Pazar, 1=Pazartesi...
        weeklyActivity[dayIndex].value++;
      } catch (error) {
        // Tarih işlenemezse hata yönetimi
        console.error('Tarih işleme hatası:', error);
      }
    });
    
    // Sıralamayı Pazartesi'den başlayacak şekilde düzenle (Türkiye standardı)
    weeklyActivity.push(weeklyActivity.shift()); // Pazar'ı dizinin sonuna taşı
    
    // Ortalama yanıt süresi - varsayılan değer
    // Gerçek veriler olmadığından şimdilik varsayılan değer kullanıyoruz
    const averageResponse = 45; // dakika
    
    return {
      totalEmails,
      openRate,
      averageResponse,
      messageTypes,
      weeklyActivity
    };
  }, [messages]);
  
  // En yüksek aktivite değeri
  const maxActivity = Math.max(...statsData.weeklyActivity.map(day => day.value), 1);

  return (
    <div className="h-full w-full p-6 overflow-auto">
      <div className="futuristic-panel p-6 bg-black/30 mb-6">
        <div className="flex items-center mb-6">
          <FaChartBar className="text-indigo-400 mr-3 h-6 w-6" />
          <h1 className="text-2xl font-bold futuristic-text-gradient">İstatistikler</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3 border border-indigo-500/30">
                <FaEnvelope className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Toplam E-posta</p>
                <h3 className="text-xl font-bold text-white">{statsData.totalEmails}</h3>
              </div>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 border border-purple-500/30">
                <FaCheckCircle className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Açılma Oranı</p>
                <h3 className="text-xl font-bold text-white">{statsData.openRate}%</h3>
              </div>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${statsData.openRate}%` }}></div>
            </div>
          </div>

          <div className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-teal-900/30 rounded-lg flex items-center justify-center mr-3 border border-teal-500/30">
                <FaExclamationCircle className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Ortalama Yanıt</p>
                <h3 className="text-xl font-bold text-white">{statsData.averageResponse} dk</h3>
              </div>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${(statsData.averageResponse / 150) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="futuristic-panel p-4 bg-black/20">
            <div className="flex items-center mb-4">
              <FaChartPie className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Mesaj Tipleri</h2>
            </div>
            
            <div className="space-y-3">
              {statsData.messageTypes.map((type, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400 text-sm">{type.name}</span>
                    <span className="text-gray-300 text-sm">{type.value}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full">
                    <div className={`${type.color} h-1.5 rounded-full`} style={{ width: `${type.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="futuristic-panel p-4 bg-black/20">
            <div className="flex items-center mb-4">
              <FaChartLine className="text-indigo-400 mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium text-gray-200">Haftalık Aktivite</h2>
            </div>
            
            <div className="flex items-end h-32 mt-4">
              {statsData.weeklyActivity.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-4/6 bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t opacity-80"
                    style={{ height: `${(day.value / maxActivity) * 100}%` }}
                  ></div>
                  <span className="text-gray-400 text-xs mt-2">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="futuristic-panel p-6 bg-black/30">
        <h2 className="text-xl font-bold mb-4 futuristic-text-gradient">Geçici E-posta İstatistikleri</h2>
        <p className="text-gray-400 mb-4">
          NOVA MAIL, geçici e-posta kullanımınızı analiz eder ve temel istatistikler sunar. 
          Bu bilgiler, hesabınızın nasıl kullanıldığını anlamak için yardımcı olabilir.
        </p>
        
        <div className="bg-black/20 p-3 rounded-lg border border-indigo-500/20">
          <p className="text-gray-500 text-sm">
            <FaInfoCircle className="inline-block mr-2 text-indigo-400" />
            Not: İstatistikler sadece mevcut oturum için geçerlidir. Çıkış yaptığınızda, tüm veriler silinir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView; 