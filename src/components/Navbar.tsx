import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Columns, 
  Plus, 
  QrCode, 
  Sun, 
  Moon, 
  Check,
  Radio,
  ChevronDown
} from 'lucide-react';
import { sessionStore, QAPresentation } from '../services/sessionStore';

interface NavbarProps {
  currentView: 'presenter' | 'participant' | 'split';
  setCurrentView: (view: 'presenter' | 'participant' | 'split') => void;
  onOpenQR: () => void;
  onOpenCreator: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activePresentation?: QAPresentation;
  presentations: QAPresentation[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenQR,
  onOpenCreator,
  theme,
  toggleTheme,
  activePresentation,
  presentations
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Active Presentation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/logo.png" 
              alt="Resplandece Logo" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }} 
            />
            <img 
              src="/JEA.png" 
              alt="JEA Jóvenes en Acción" 
              style={{ height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.2))' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }} className="gradient-text">Resplandece</span>
                <span className="badge badge-live" style={{ fontSize: '0.65rem' }}>
                  <Radio size={10} className="glow-effect" /> EN VIVO
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Presentaciones Q&A Anónimas</span>
            </div>
          </div>

          {/* Presentation Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activePresentation ? activePresentation.title : 'Seleccionar Presentación'}
              </span>
              {activePresentation && (
                <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  #{activePresentation.code}
                </span>
              )}
              <ChevronDown size={14} color="var(--text-secondary)" />
            </button>

            {showDropdown && (
              <div className="glass-panel animate-pop" style={{ position: 'absolute', top: '110%', left: 0, minWidth: '280px', zIndex: 110, padding: '8px' }}>
                <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Presentaciones Activas
                </div>
                {presentations.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sessionStore.setActivePresentationId(p.id);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: p.id === activePresentation?.id ? 'var(--bg-accent-subtle)' : 'transparent',
                      border: 'none',
                      color: p.id === activePresentation?.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: p.id === activePresentation?.id ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem' }}>{p.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{p.code} • {p.slides.length} diapositivas</div>
                    </div>
                    {p.id === activePresentation?.id && <Check size={16} color="var(--accent-primary)" />}
                  </button>
                ))}
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                
                <button
                  onClick={() => {
                    onOpenCreator();
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} /> Crear Presentación Q&A Anónimas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCurrentView('presenter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentView === 'presenter' ? 'var(--accent-gradient)' : 'transparent',
              color: currentView === 'presenter' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Monitor size={16} />
            <span>Presentador</span>
          </button>

          <button
            onClick={() => setCurrentView('participant')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentView === 'participant' ? 'var(--accent-gradient)' : 'transparent',
              color: currentView === 'participant' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Smartphone size={16} />
            <span>Móvil Participante</span>
          </button>

          <button
            onClick={() => setCurrentView('split')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentView === 'split' ? 'var(--accent-gradient)' : 'transparent',
              color: currentView === 'split' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Columns size={16} />
            <span>Vista Dividida</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenCreator}
            className="gradient-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            <Plus size={16} />
            <span>Crear Presentación Q&A Anónimas</span>
          </button>

          <button
            onClick={onOpenQR}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <QrCode size={16} />
            <span>Ver QR</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Cambiar Tema"
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
};
