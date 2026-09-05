import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { QASession } from '../services/sessionStore';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: {
    id: string;
    title: string;
    code: string;
  };
  onOpenMobileView?: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  session,
  onOpenMobileView
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  // Construct mobile participant URL
  const baseUrl = window.location.origin + window.location.pathname;
  const participantUrl = `${baseUrl}?session=${session.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(participantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 15, 25, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-panel animate-pop glow-effect" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '36px',
        textAlign: 'center',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glow)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text-secondary)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <img 
              src="/logo.png" 
              alt="Resplandece Logo" 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }} 
            />
            <img 
              src="/JEA.png" 
              alt="JEA Logo" 
              style={{ height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(255,255,255,0.2))' }} 
            />
          </div>
          <span className="badge badge-live" style={{ padding: '4px 12px', fontSize: '0.8rem', marginBottom: '12px' }}>
            ESCANEA Y PARTICIPA
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>
            Envía tus Preguntas Anónimas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {session.title}
          </p>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          display: 'inline-block',
          margin: '0 auto 20px auto',
          boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
          border: '4px solid white'
        }}>
          <QRCodeSVG
            value={participantUrl}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#0F172A"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Session Code Highlight */}
        <div style={{
          background: 'var(--bg-accent-subtle)',
          border: '1px dashed var(--border-glow)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Código de Acceso Directo
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '2px', marginTop: '2px' }}>
            #{session.code}
          </div>
        </div>

        {/* Copy Link & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: copied ? 'var(--success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${copied ? 'var(--success-color)' : 'var(--border-color)'}`,
              color: copied ? 'var(--success-color)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all var(--transition-fast)'
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? '¡Enlace copiado al portapapeles!' : 'Copiar Enlace de la Sesión'}</span>
          </button>

          {onOpenMobileView && (
            <button
              onClick={() => {
                onClose();
                onOpenMobileView();
              }}
              className="gradient-btn"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Smartphone size={18} />
              <span>Simular Entrada Celular</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
