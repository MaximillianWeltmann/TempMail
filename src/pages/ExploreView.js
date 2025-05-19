import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaExternalLinkAlt, FaInfoCircle, FaShieldAlt, FaServer, FaEnvelope, FaUserSecret, FaRocket } from 'react-icons/fa';

const ExploreView = () => {
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

  const serviceCards = [
    {
      title: "Mail.tm",
      description: "Orjinal geçici e-posta sağlayıcısı",
      icon: <FaServer className="text-indigo-400" />,
      link: "https://mail.tm",
      color: "from-indigo-600 to-blue-600"
    },
    {
      title: "TempMail",
      description: "Hızlı e-posta oluşturma aracı",
      icon: <FaEnvelope className="text-purple-400" />,
      link: "https://temp-mail.org",
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Guerrilla Mail",
      description: "Tek kullanımlık e-postalar için",
      icon: <FaShieldAlt className="text-green-400" />,
      link: "https://www.guerrillamail.com",
      color: "from-green-600 to-teal-600"
    },
    {
      title: "10 Minute Mail",
      description: "Kısa süreli geçici e-postalar",
      icon: <FaInfoCircle className="text-amber-400" />,
      link: "https://10minutemail.com",
      color: "from-amber-600 to-orange-600"
    }
  ];
  
  const mailContent = [
    {
      title: "Gizlilik Odaklı",
      description: "Kişisel bilgilerinizi paylaşmadan internet hizmetlerini kullanın.",
      icon: <FaUserSecret className="w-6 h-6 text-indigo-400" />,
      animation: { delay: 0.2 }
    },
    {
      title: "Spam Koruması",
      description: "İstenmeyen postalar ana gelen kutunuza ulaşamaz.",
      icon: <FaShieldAlt className="w-6 h-6 text-indigo-400" />,
      animation: { delay: 0.3 }
    },
    {
      title: "Hızlı ve Kolay",
      description: "Saniyeler içinde bir e-posta adresi oluşturun ve hemen kullanmaya başlayın.",
      icon: <FaRocket className="w-6 h-6 text-indigo-400" />,
      animation: { delay: 0.4 }
    }
  ];

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
        <div className="flex items-center mb-6">
          <FaGlobe className="text-indigo-400 mr-3 h-6 w-6" />
          <h1 className="text-2xl font-bold futuristic-text-gradient">Keşfet</h1>
        </div>
        
        <p className="text-gray-300 mb-6">
          NOVA MAIL, geçici e-posta hizmetlerinin dünyasına hoş geldiniz. 
          Burada geçici e-postaların avantajlarını ve İnternet'teki diğer benzer servisleri keşfedebilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mailContent.map((item, index) => (
            <motion.div 
              key={index}
              className="futuristic-card p-4 bg-indigo-900/10 border border-indigo-500/30 hover:bg-indigo-900/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.animation.delay }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-900/30 rounded-lg p-3 mr-4 border border-indigo-500/30">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-lg text-gray-200 mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="futuristic-panel p-6 bg-black/30">
        <h2 className="text-xl font-bold mb-6 futuristic-text-gradient">Benzer Servisler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceCards.map((service, index) => (
            <motion.div
              key={index}
              className="futuristic-card border border-indigo-500/30 hover:bg-black/60 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="bg-indigo-900/30 p-2 rounded-lg mr-3 border border-indigo-500/30">
                      {service.icon}
                    </div>
                    <h3 className="font-medium text-gray-200">{service.title}</h3>
                  </div>
                  <a 
                    href={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="futuristic-icon-button"
                  >
                    <FaExternalLinkAlt className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-gray-400 text-sm">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Not: Harici servisler, NOVA MAIL ile bağlantılı değildir. 
            Üçüncü taraf servisleri kendi sorumluluğunuzda kullanınız.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreView; 