import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatDate } from '../../../utils/dateFormatter';

export default function CleanInternshipCertificate({ certificateData }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      if (certificateData?.certificateId) {
        try {
          const url = await QRCode.toDataURL(
            `${window.location.origin}/verify-certificate/${certificateData.certificateId}`
          );
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }
    };
    generateQR();
  }, [certificateData?.certificateId]);

  const certificateStyle = {
    fontFamily: "'Poppins', 'Montserrat', 'Inter', sans-serif",
    width: '1000px',
    height: '700px',
    margin: '0 auto',
    position: 'relative',
    padding: '60px 80px',
    boxSizing: 'border-box',
    background: 'white',
    border: '4px solid #7ee8fa',
    boxShadow: '0 0 0 4px #7ee8fa inset',
    color: '#222222'
  };

  const cornerStyle = {
    position: 'absolute',
    width: '40px',
    height: '40px',
    border: '3px solid #7ee8fa'
  };

  return (
    <div style={certificateStyle} role="main" aria-label="Enhanced Certificate from Beeja Academy">
{/* Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: '0.19',
        zIndex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        <img 
          src="/beejalogo.png" 
          alt="Beeja Academy Watermark" 
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'contain'
          }}
        />
        <div style={{
          fontWeight: '700',
          fontSize: '3rem',
          color: '#111827',
          userSelect: 'none',
          textAlign: 'center',
          letterSpacing: '0.1em',
          opacity: '0.20',
        }}>
          Beeja Academy
        </div>
      </div>

      {/* Decorative corners - All corners with consistent L-shaped pattern */}
      
      {/* Top Left Corner */}
      <div 
        style={{
          ...cornerStyle,
          top: '10px',
          left: '10px',
          borderRight: 'none',
          borderBottom: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '16px',
          height: '16px',
          border: '2px solid #7ee8fa',
          borderLeft: 'none',
          borderTop: 'none'
        }}></div>
      </div>

      {/* Top Right Corner */}
      <div 
        style={{
          ...cornerStyle,
          top: '10px',
          right: '10px',
          borderLeft: 'none',
          borderBottom: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '16px',
          height: '16px',
          border: '2px solid #7ee8fa',
          borderRight: 'none',
          borderTop: 'none'
        }}></div>
      </div>

      {/* Bottom Left Corner */}
      <div 
        style={{
          ...cornerStyle,
          bottom: '10px',
          left: '10px',
          borderRight: 'none',
          borderTop: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          width: '16px',
          height: '16px',
          border: '2px solid #7ee8fa',
          borderLeft: 'none',
          borderBottom: 'none'
        }}></div>
      </div>

      {/* Bottom Right Corner */}
      <div 
        style={{
          ...cornerStyle,
          bottom: '10px',
          right: '10px',
          borderLeft: 'none',
          borderTop: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          width: '16px',
          height: '16px',
          border: '2px solid #7ee8fa',
          borderRight: 'none',
          borderBottom: 'none'
        }}></div>
      </div>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        position: 'relative',
        zIndex: '2'
      }}>
        {/* Certificate ID */}
        <div style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: '500'
        }}>
          Certificate ID: {certificateData?.certificateId || 'BA-25FJ2849'}
        </div>

        {/* Logo and Academy Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img 
            src="/beejalogo.png" 
            alt="Beeja Academy Logo" 
            style={{
              width: '64px',
              height: '70px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            fontFamily: "'Raleway', 'Lato', sans-serif",
            fontWeight: '600',
            fontSize: '1.6rem',
            color: '#111827',
            userSelect: 'none',
            letterSpacing: '0.05em'
          }}>
            Beeja Academy
          </div>
        </div>

        {/* Issue Date - Top Right */}
        <div style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: '500',
          textAlign: 'right'
        }}>
          Issued on: {formatDate(certificateData?.completionDate) || 'July 7, 2025'}
        </div>
      </header>

      {/* Title */}
      <h1 style={{
        textAlign: 'center',
        fontFamily: "'Playfair Display', 'Georgia', serif",
        fontWeight: '700',
        fontSize: '3rem',
        letterSpacing: '0.1em',
        marginBottom: '3px',
        color: '#1a1a1a',
        userSelect: 'none',
        position: 'relative',
        zIndex: '2',
      }}>
        CERTIFICATE
      </h1>

      {/* Dots */}
      <div style={{
        textAlign: 'center',
        color: '#7ee8fa',
        fontSize: '1.5rem',
        letterSpacing: '0.5em',
        marginBottom: '18px',
        userSelect: 'none',
        position: 'relative',
        zIndex: '2'
      }}>
        •••••
      </div>

      {/* Content */}
      <div style={{
        textAlign: 'center',
        marginBottom: '0px',
        marginTop: '-15px',
        padding: '0 40px',
        position: 'relative',
        zIndex: '2'
      }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#333',
          marginBottom: '25px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          This certificate is awarded to
        </div>

        <div style={{
          fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
          fontSize: '2.8rem',
          fontWeight: '600',
          color: '#7a6fff',
          marginBottom: '30px',
          borderBottom: '3px solid #7ee8fa',
          display: 'inline-block',
          paddingBottom: '8px',
          minWidth: '350px',
          letterSpacing: '0.02em',
        }}>
          {certificateData?.studentName || '<Student Name>'}
        </div>
        
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#444',
          marginBottom: '20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          in recognition of completing a comprehensive online training<br/>
          <span style={{
            fontFamily: "'Roboto Slab', 'Merriweather', serif",
            fontWeight: '600',
            color: '#7a6fff',
            fontSize: '1.4rem',
            letterSpacing: '0.5px',
            textTransform: 'capitalize',
          }}>
            {certificateData?.categoryName || certificateData?.courseId?.category?.name || 'General'}
          </span><br/>
          and gaining practical experience through real-time project<br/>
          <span style={{
            fontFamily: "'Roboto Slab', 'Merriweather', serif",
            fontWeight: '600',
            color: '#7a6fff',
            fontSize: '1.4rem',
            letterSpacing: '0.5px',
          }}>
            {certificateData?.courseName || certificateData?.courseId?.courseName || 'Course Name'}
          </span>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        marginTop: '-50px',
        position: 'relative',
        paddingBottom: '0px',
        maxWidth: '100%',
        padding: '0 20px',
        zIndex: '2'
      }}>
        {/* QR Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          width: '120px'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '8px',
            textAlign: 'center',
            borderRadius: '6px',
            border: '2px solid #7ee8fa'
          }}>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Certificate QR Code" style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
            ) : (
              <div>
                ████████<br/>
                █&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;█<br/>
                █&nbsp;████&nbsp;█<br/>
                █&nbsp;████&nbsp;█<br/>
                █&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;█<br/>
                ████████
              </div>
            )}
          </div>
          <div style={{
            fontSize: '0.7rem',
            color: '#666',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            Scan to Verify
          </div>
        </div>

        {/* Center - Website and Email */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: '1',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#7a6fff',
            letterSpacing: '0.3px'
          }}>
            www.beejaacademy.com
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#666',
            fontWeight: '500'
          }}>
            info@beejaacademy.com
          </div>
        </div>

        {/* Signature Section */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          width: '120px'
        }}>
          <img 
            src="/src/assets/Certificate/Director-sign-certificate.png" 
            alt="Director Signature" 
            style={{
              width: '120px',
              height: '60px',
              objectFit: 'contain',
              marginBottom: '6px'
            }}
          />
          <div style={{
            width: '140px',
            height: '2px',
            background: 'linear-gradient(90deg, #7ee8fa, #7a6fff)',
            marginBottom: '6px'
          }}></div>
          <div style={{
            fontFamily: "'Oswald', 'Roboto Condensed', sans-serif",
            fontWeight: '500',
            fontSize: '1.1rem',
            color: '#333',
            letterSpacing: '0.8px',
            textTransform: 'uppercase'
          }}>
            JOSHWA
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: '#666',
            fontWeight: '500'
          }}>
            Director
          </div>
        </div>
      </div>
    </div>
  );
}
