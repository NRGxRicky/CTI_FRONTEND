import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getSocialShareUrls, openShareWindow } from '../../utils/socialTracking';

const SocialShare = ({
  url = window.location.href,
  title = document.title,
  description = '',
  image = '',
  product = null,
  className = ''
}) => {
  const [showShareButtons, setShowShareButtons] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const shareUrls = getSocialShareUrls(url, title, description, image);

  const handleShare = (platform) => {
    const shareUrl = shareUrls[platform];
    openShareWindow(platform, shareUrl, product);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
      handleShare('copy');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // SVG Icons para cada plataforma
  const SocialIcons = {
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    whatsapp: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
      </svg>
    ),
    twitter: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    telegram: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    linkedin: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    pinterest: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
      </svg>
    ),
    email: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
    copy: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
      </svg>
    )
  };

  const primaryPlatforms = [
    {
      name: 'facebook',
      label: 'Facebook',
      color: '#1877F2'
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp',
      color: '#25D366'
    },
    {
      name: 'twitter',
      label: 'Twitter',
      color: '#1DA1F2'
    }
  ];

  const secondaryPlatforms = [
    {
      name: 'telegram',
      label: 'Telegram',
      color: '#0088CC'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      color: '#0A66C2'
    },
    {
      name: 'pinterest',
      label: 'Pinterest',
      color: '#E60023'
    },
    {
      name: 'email',
      label: 'Email',
      color: '#666666'
    }
  ];

  return (
    <div className={`social-share ${className}`}>
      {/* Botón principal "Compartir" */}
      {!showShareButtons ? (
        <button
          onClick={() => setShowShareButtons(true)}
          className="social-share__main-button"
          title="Compartir producto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
        </button>
      ) : (
        <div className="social-share__content">
          {/* Header con título y botón cerrar */}
          <div className="social-share__header">
            <span className="social-share__title">Compartir este producto</span>
            <button
              onClick={() => {
                setShowShareButtons(false);
                setShowAllPlatforms(false);
              }}
              className="social-share__close"
              title="Cerrar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Botones de redes sociales */}
          <div className="social-share__container">
            {/* Botones principales */}
            {primaryPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform.name)}
                className="social-share__button"
                style={{ backgroundColor: platform.color }}
                title={`Compartir en ${platform.label}`}
              >
                {SocialIcons[platform.name]}
              </button>
            ))}

            {/* Botón copiar enlace */}
            <button
              onClick={handleCopyLink}
              className="social-share__button social-share__copy"
              title="Copiar enlace"
            >
              {SocialIcons.copy}
            </button>

            {/* Botón para mostrar más opciones */}
            {!showAllPlatforms && (
              <button
                onClick={() => setShowAllPlatforms(true)}
                className="social-share__button social-share__more"
                title="Más opciones"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            )}
          </div>

          {/* Opciones adicionales */}
          {showAllPlatforms && (
            <div className="social-share__secondary">
              <div className="social-share__container">
                {secondaryPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform.name)}
                    className="social-share__button"
                    style={{ backgroundColor: platform.color }}
                    title={`Compartir en ${platform.label}`}
                  >
                    {SocialIcons[platform.name]}
                  </button>
                ))}

                <button
                  onClick={() => setShowAllPlatforms(false)}
                  className="social-share__button social-share__less"
                  title="Menos opciones"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .social-share {
          width: 100%;
        }

        /* Botón principal "Compartir" - Solo icono */
        .social-share__main-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(71, 71, 71, 0.1);
          border-radius: 50%;
          color: #474747;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(71, 71, 71, 0.1);
          backdrop-filter: blur(4px);
        }

        .social-share__main-button:hover {
          background-color: #ffffff;
          border-color: var(--primary-color, #00b517);
          color: var(--primary-color, #00b517);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(71, 71, 71, 0.2);
        }

        .social-share__main-button svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        /* Contenido expandido */
        .social-share__content {
          background: #ffffff;
          border: 1px solid rgba(71, 71, 71, 0.15);
          border-radius: 5px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(71, 71, 71, 0.15);
          animation: fadeInScale 0.3s ease-out;
          font-family: 'proxima-nova', sans-serif;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Header con título y botón cerrar */
        .social-share__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(71, 71, 71, 0.1);
        }

        .social-share__title {
          font-size: 16px;
          font-weight: 600;
          color: #474747;
          font-family: 'proxima-nova', sans-serif;
        }

        .social-share__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: none;
          border: none;
          border-radius: 50%;
          color: #474747;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .social-share__close:hover {
          background-color: rgba(71, 71, 71, 0.05);
          color: var(--primary-color, #00b517);
        }

        /* Container de botones */
        .social-share__container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .social-share__button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background-color: #f5f5f5;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .social-share__button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          filter: brightness(1.1);
        }

        .social-share__button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .social-share__button svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .social-share__copy {
          background-color: #474747 !important;
        }

        .social-share__copy:hover {
          background-color: #3a3a3a !important;
        }

        .social-share__more,
        .social-share__less {
          background-color: rgba(71, 71, 71, 0.08) !important;
          color: #474747 !important;
          border: 1px solid rgba(71, 71, 71, 0.15);
        }

        .social-share__more:hover,
        .social-share__less:hover {
          background-color: rgba(71, 71, 71, 0.12) !important;
          color: var(--primary-color, #00b517) !important;
          border-color: var(--primary-color, #00b517);
        }

        .social-share__secondary {
          margin-top: 12px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 60px;
          }
        }

        /* Colores específicos para cada plataforma */
        .social-share__button[title*="Facebook"] {
          background-color: #1877F2;
        }

        .social-share__button[title*="WhatsApp"] {
          background-color: #25D366;
        }

        .social-share__button[title*="Twitter"] {
          background-color: #1DA1F2;
        }

        .social-share__button[title*="Telegram"] {
          background-color: #0088CC;
        }

        .social-share__button[title*="LinkedIn"] {
          background-color: #0A66C2;
        }

        .social-share__button[title*="Pinterest"] {
          background-color: #E60023;
        }

        .social-share__button[title*="Email"] {
          background-color: #666666;
        }

        /* Efectos de hover específicos */
        .social-share__button[title*="Facebook"]:hover {
          background-color: #166fe5;
        }

        .social-share__button[title*="WhatsApp"]:hover {
          background-color: #20bc5a;
        }

        .social-share__button[title*="Twitter"]:hover {
          background-color: #1a91da;
        }

        @media (max-width: 768px) {
          .social-share__main-button {
            width: 36px;
            height: 36px;
          }

          .social-share__main-button svg {
            width: 18px;
            height: 18px;
          }

          .social-share__button {
            width: 44px;
            height: 44px;
            min-width: 44px;
            min-height: 44px;
          }

          .social-share__container {
            gap: 10px;
            justify-content: center;
          }

          .social-share__button svg {
            width: 22px;
            height: 22px;
          }

          .social-share__content {
            padding: 12px;
          }

          .social-share__title {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .social-share__container {
            gap: 8px;
          }

          .social-share__button {
            width: 40px;
            height: 40px;
          }

          .social-share__button svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};

SocialShare.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  product: PropTypes.object,
  className: PropTypes.string
};

export default SocialShare;