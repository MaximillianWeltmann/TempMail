/**
 * NOVA MAIL JavaScript
 * Tüm sayfalar için ortak fonksiyonlar
 */

document.addEventListener('DOMContentLoaded', () => {
  // Aktif menü öğesini ayarla
  setActiveMenuItem();
  
  // Tema değiştirme butonuna tıklama olayı ekle
  const themeToggleBtn = document.querySelector('[title="Tema Değiştir"]');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Yenile butonuna tıklama olayı ekle
  const refreshBtn = document.querySelector('.futuristic-nav-item:nth-child(2)');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshMessages);
  }
});

/**
 * Aktif menü öğesini mevcut URL'ye göre ayarla
 */
function setActiveMenuItem() {
  const currentPage = window.location.pathname.split('/').pop() || 'inbox.html';
  
  // Tüm aktif sınıfları kaldır
  document.querySelectorAll('.futuristic-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Mevcut sayfa için aktif sınıfı ekle
  let menuItem;
  
  if (currentPage === 'inbox.html' || currentPage === '' || currentPage === 'index.html') {
    menuItem = document.querySelector('a[href="inbox.html"] .futuristic-nav-item');
  } else {
    menuItem = document.querySelector(`a[href="${currentPage}"] .futuristic-nav-item`);
  }
  
  if (menuItem) {
    menuItem.classList.add('active');
  }
}

/**
 * Tema değiştirme (karanlık/aydınlık)
 * Not: Bu fonksiyon sadece tema ikonu değiştirir, tam tema değiştirme sonraki sürümde eklenecek
 */
function toggleTheme() {
  const themeIcon = this.querySelector('i');
  
  if (themeIcon.classList.contains('fa-moon')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    this.title = 'Aydınlık Tema';
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    this.title = 'Karanlık Tema';
  }
  
  // Tema değiştiğinde animasyon efekti
  document.body.classList.add('animate-fade-in');
  setTimeout(() => {
    document.body.classList.remove('animate-fade-in');
  }, 300);
}

/**
 * Mesajları yenileme animasyonu
 */
function refreshMessages() {
  const refreshIcon = this.querySelector('i');
  
  // Döndürme animasyonu ekle
  refreshIcon.style.transition = 'transform 0.5s ease';
  refreshIcon.style.transform = 'rotate(360deg)';
  
  // Animasyonu sıfırla
  setTimeout(() => {
    refreshIcon.style.transition = 'none';
    refreshIcon.style.transform = 'rotate(0deg)';
    
    // Tekrar animasyon ekle
    setTimeout(() => {
      refreshIcon.style.transition = 'transform 0.5s ease';
    }, 50);
  }, 500);
  
  // Yenileme mesajı göster
  showNotification('Mesajlar yenileniyor...', 'info');
  
  // İşlem yapılıyormuş gibi gecikme ekle
  setTimeout(() => {
    showNotification('Mesajlar başarıyla yenilendi', 'success');
  }, 1000);
}

/**
 * Bildirim gösterme
 * @param {string} message - Bildirim mesajı
 * @param {string} type - Bildirim türü (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
  // Eğer bildirim konteynerı yoksa oluştur
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '1rem';
    notificationContainer.style.right = '1rem';
    notificationContainer.style.zIndex = '9999';
    document.body.appendChild(notificationContainer);
  }
  
  // Bildirim rengini ayarla
  let bgColor = 'rgba(79, 70, 229, 0.2)';
  let borderColor = 'rgba(79, 70, 229, 0.3)';
  let icon = 'fa-info-circle';
  
  if (type === 'success') {
    bgColor = 'rgba(16, 185, 129, 0.2)';
    borderColor = 'rgba(16, 185, 129, 0.3)';
    icon = 'fa-check-circle';
  } else if (type === 'error') {
    bgColor = 'rgba(239, 68, 68, 0.2)';
    borderColor = 'rgba(239, 68, 68, 0.3)';
    icon = 'fa-times-circle';
  } else if (type === 'warning') {
    bgColor = 'rgba(245, 158, 11, 0.2)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    icon = 'fa-exclamation-triangle';
  }
  
  // Bildirim oluştur
  const notification = document.createElement('div');
  notification.style.backgroundColor = bgColor;
  notification.style.borderLeft = `4px solid ${borderColor}`;
  notification.style.color = 'white';
  notification.style.padding = '1rem';
  notification.style.marginBottom = '0.5rem';
  notification.style.borderRadius = '0.375rem';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  notification.style.maxWidth = '24rem';
  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  notification.style.transition = 'all 0.3s ease-out';
  
  notification.innerHTML = `
    <i class="fas ${icon}" style="margin-right: 0.75rem;"></i>
    <span>${message}</span>
  `;
  
  // Bildirim konteynerına ekle
  notificationContainer.appendChild(notification);
  
  // Animasyonu başlat
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Belli bir süre sonra kaldır
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
} 