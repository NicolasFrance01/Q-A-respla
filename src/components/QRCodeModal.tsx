import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone } from 'lucide-react';

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
      background: 'rgba(11, 15, 25, 0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      zIndex: 1000,
      padding: '24px 16px'
    }}>
      <div className="glass-panel animate-pop glow-effect" style={{
        width: '100%',
        maxWidth: '480px',
        margin: 'auto 0',
        padding: '28px',
        textAlign: 'center',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glow)',
        boxSizing: 'border-box'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text-secondary)',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <img 
              src="/logo.png" 
              alt="Resplandece Logo" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }} 
            />
            <img 
              src="/JEA.png" 
              alt="JEA Logo" 
              style={{ height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.2))' }} 
            />
          </div>
          <span className="badge badge-live" style={{ padding: '3px 10px', fontSize: '0.75rem', marginBottom: '8px' }}>
            ESCANEA Y PARTICIPA
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '6px' }}>
            Envía tus Preguntas Anónimas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
            {session.title}
          </p>
        </div>

        {/* QR Code Container */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          display: 'inline-block',
          margin: '0 auto 16px auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '3px solid white'
        }}>
          <QRCodeSVG
            value={participantUrl}
            size={180}
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
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Código de Acceso Directo
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '2px', marginTop: '2px' }}>
            #{session.code}
          </div>
        </div>

        {/* Copy Link & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleCopyLink}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: copied ? 'var(--success-bg)' : 'var(--bg-tertiary)',
              border: `1px solid ${copied ? 'var(--success-color)' : 'var(--border-color)'}`,
              color: copied ? 'var(--success-color)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
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
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Smartphone size={16} />
              <span>Simular Entrada Celular</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
