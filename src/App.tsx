import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PresenterSlideDeck } from './components/PresenterSlideDeck';
import { ParticipantSlideView } from './components/ParticipantSlideView';
import { PresentationCreator } from './components/PresentationCreator';
import { QRCodeModal } from './components/QRCodeModal';
import { sessionStore, QAPresentation, SlideResponse } from './services/sessionStore';
import { Smartphone, Monitor, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetSessionIdFromUrl = urlParams.get('session');

  const [currentView, setCurrentView] = useState<'presenter' | 'participant' | 'split'>(
    targetSessionIdFromUrl ? 'participant' : 'split'
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
  const activePresentation = sessionStore.getActivePresentation() || presentations[0];
  const responses = activePresentation ? sessionStore.getResponses(activePresentation.id) : [];

  return (
    <div className="app-container">
      {/* Navigation Header */}
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

            {currentView === 'participant' && (
              <div style={{ padding: '20px 0' }}>
                <ParticipantSlideView
                  presentation={activePresentation}
                  responses={responses}
                />
              </div>
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
                    <div style={{ flex: 1, overflowY: 'auto', paddingTop: '16px' }}>
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
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Bienvenido a Resplandece Q&A</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Crea tu primera presentación con diapositivas interactivas para tu audiencia.</p>

            <button
              onClick={() => setIsCreatorOpen(true)}
              className="gradient-btn"
              style={{ padding: '12px 24px', borderRadius: 'var(--radius-full)', fontSize: '1rem' }}
            >
              <Plus size={18} /> Crear Presentación Q&A Anónimas
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
