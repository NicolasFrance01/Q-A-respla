import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PresenterSlideDeck } from './components/PresenterSlideDeck';
import { ParticipantSlideView } from './components/ParticipantSlideView';
import { PresentationCreator } from './components/PresentationCreator';
import { QRCodeModal } from './components/QRCodeModal';
import { sessionStore } from './services/sessionStore';
import { Smartphone, Monitor, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetSessionIdFromUrl = urlParams.get('session');

  // Detect mobile device or URL query param for participant mode
  const isMobileQuery = Boolean(targetSessionIdFromUrl) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const [currentView, setCurrentView] = useState<'presenter' | 'participant' | 'split'>(
    isMobileQuery ? 'participant' : 'split'
  );
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    sessionStore.init();

    if (targetSessionIdFromUrl) {
      sessionStore.setActivePresentationId(targetSessionIdFromUrl);
    }

    const unsubscribe = sessionStore.subscribe(() => {
      setTick(t => t + 1);
    });

    return () => unsubscribe();
  }, [targetSessionIdFromUrl]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const presentations = sessionStore.getPresentations();
  const activePresentation = sessionStore.getActivePresentation();
  const responses = activePresentation ? sessionStore.getResponses(activePresentation.id) : [];

  // IF PARTICIPANT VIEW: Render ONLY clean mobile participant view without any desktop navbar or admin buttons
  if (currentView === 'participant') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {activePresentation ? (
          <ParticipantSlideView
            presentation={activePresentation}
            responses={responses}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            <Sparkles size={40} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Esperando a que comience la presentación...</h3>
            <p style={{ fontSize: '0.9rem' }}>En cuanto el presentador active una diapositiva, aparecerá aquí en tu celular.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header - Rendered only on Presenter & Split views */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        activePresentation={activePresentation}
        presentations={presentations}
      />

      {/* Main Stage View Router */}
      <main className="main-content">
        {activePresentation ? (
          <>
            {currentView === 'presenter' && (
              <PresenterSlideDeck
                presentation={activePresentation}
                responses={responses}
                onOpenQR={() => setIsQRModalOpen(true)}
                onOpenCreator={() => setIsCreatorOpen(true)}
              />
            )}

            {currentView === 'split' && (
              <div className="split-view-container">
                {/* Presenter Stage Side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Monitor size={16} color="var(--accent-primary)" />
                    <span>PANEL DE PRESENTACIÓN (ESCRITORIO / PANTALLA GIGANTE EN VIVO)</span>
                  </div>
                  <PresenterSlideDeck
                    presentation={activePresentation}
                    responses={responses}
                    onOpenQR={() => setIsQRModalOpen(true)}
                    onOpenCreator={() => setIsCreatorOpen(true)}
                  />
                </div>

                {/* Mobile Participant Preview Side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Smartphone size={16} color="var(--accent-primary)" />
                    <span>SIMULADOR MÓVIL PARTICIPANTE (SINCRONIZADO EN TIEMPO REAL)</span>
                  </div>
                  
                  <div className="mobile-frame">
                    <div className="mobile-notch"></div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <ParticipantSlideView
                        presentation={activePresentation}
                        responses={responses}
                        isMobileFrame={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Dashboard State */
          <div style={{ textAlign: 'center', padding: '100px 24px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: 'var(--shadow-glow)' }}>
              <Sparkles size={32} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>No hay presentaciones activas</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.5 }}>
              Comienza creando tu primera presentación interactiva con diapositivas para que tu audiencia responda en tiempo real desde el celular.
            </p>

            <button
              onClick={() => setIsCreatorOpen(true)}
              className="gradient-btn glow-effect"
              style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={20} /> Crear Presentación Q&A Anónimas
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        session={activePresentation ? {
          id: activePresentation.id,
          title: activePresentation.title,
          code: activePresentation.code
        } : undefined}
        onOpenMobileView={() => setCurrentView('participant')}
      />

      <PresentationCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreated={(p) => {
          sessionStore.setActivePresentationId(p.id);
          setCurrentView('split');
        }}
      />
    </div>
  );
}
