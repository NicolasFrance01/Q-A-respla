import React, { useState } from 'react';
import { 
  MessageSquare, 
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
import { sessionStore, QASession } from '../services/sessionStore';

interface NavbarProps {
  currentView: 'presenter' | 'participant' | 'split';
  setCurrentView: (view: 'presenter' | 'participant' | 'split') => void;
  onOpenQR: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeSession?: QASession;
  sessions: QASession[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenQR,
  theme,
  toggleTheme,
  activeSession,
  sessions
}) => {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = sessionStore.createSession(newTitle.trim(), newCode.trim() || undefined);
    setNewTitle('');
    setNewCode('');
    setIsCreatingSession(false);
    setShowSessionDropdown(false);
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Active Session */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pizarra Q&A Interactiva</span>
            </div>
          </div>

          {/* Session Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSessionDropdown(!showSessionDropdown)}
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
                {activeSession ? activeSession.title : 'Seleccionar Sesión'}
              </span>
              {activeSession && (
                <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  #{activeSession.code}
                </span>
              )}
              <ChevronDown size={14} color="var(--text-secondary)" />
            </button>

            {showSessionDropdown && (
              <div className="glass-panel animate-pop" style={{ position: 'absolute', top: '110%', left: 0, minWidth: '260px', zIndex: 110, padding: '8px' }}>
                <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sesiones Activas
                </div>
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      sessionStore.setActiveSessionId(s.id);
                      setShowSessionDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: s.id === activeSession?.id ? 'var(--bg-accent-subtle)' : 'transparent',
                      border: 'none',
                      color: s.id === activeSession?.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: s.id === activeSession?.id ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem' }}>{s.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#{s.code}</div>
                    </div>
                    {s.id === activeSession?.id && <Check size={16} color="var(--accent-primary)" />}
                  </button>
                ))}
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                
                <button
                  onClick={() => {
                    setIsCreatingSession(true);
                    setShowSessionDropdown(false);
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
                  <Plus size={16} /> Crear Nueva Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation View Switcher (Presenter / Mobile / Split) */}
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

        {/* Right Tools: QR Code Modal launcher & Theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenQR}
            className="gradient-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem'
            }}
          >
            <QrCode size={18} />
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

      {/* Create Session Modal */}
      {isCreatingSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-pop" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Nueva Sesión de Preguntas</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Crea una sala interactiva para que tu audiencia envíe preguntas anónimas escaneando el código QR.
            </p>

            <form onSubmit={handleCreateSession}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Título del Evento o Presentación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Q&A Conferencia Anual de Tecnología"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Código Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: RESPLA2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gradient-btn"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Crear Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
