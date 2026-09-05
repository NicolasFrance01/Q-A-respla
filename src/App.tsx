import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PresenterDashboard } from './components/PresenterDashboard';
import { ParticipantView } from './components/ParticipantView';
import { QRCodeModal } from './components/QRCodeModal';
import { SpotlightModal } from './components/SpotlightModal';
import { sessionStore, QASession, Question } from './services/sessionStore';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // Determine default view mode based on URL search query (e.g. ?session=xxx -> participant)
  const urlParams = new URLSearchParams(window.location.search);
  const targetSessionIdFromUrl = urlParams.get('session');

  const [currentView, setCurrentView] = useState<'presenter' | 'participant' | 'split'>(
    targetSessionIdFromUrl ? 'participant' : 'split'
  );
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Initialize store and sync listeners
  useEffect(() => {
    sessionStore.init();

    if (targetSessionIdFromUrl) {
      sessionStore.setActiveSessionId(targetSessionIdFromUrl);
    }

    const unsubscribe = sessionStore.subscribe(() => {
      setTick(t => t + 1);
    });

    return () => unsubscribe();
  }, [targetSessionIdFromUrl]);

  // Set theme data attribute on body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const sessions = sessionStore.getSessions();
  const activeSession = sessionStore.getActiveSession() || sessions[0];
  const questions = sessionStore.getQuestions(activeSession?.id);

  const spotlightQuestion = questions.find(q => q.id === activeSession?.spotlightQuestionId) || null;

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenQR={() => setIsQRModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        activeSession={activeSession}
        sessions={sessions}
      />

      {/* Main View Router */}
      <main className="main-content">
        {activeSession ? (
          <>
            {currentView === 'presenter' && (
              <PresenterDashboard
                session={activeSession}
                questions={questions}
                onOpenQR={() => setIsQRModalOpen(true)}
              />
            )}

            {currentView === 'participant' && (
              <div style={{ padding: '20px 0' }}>
                <ParticipantView
                  session={activeSession}
                  questions={questions}
                />
              </div>
            )}

            {currentView === 'split' && (
              <div className="split-view-container">
                {/* Presenter Side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Monitor size={16} color="var(--accent-primary)" />
                    <span>PANEL DEL PRESENTADOR (VISTA ESCRITORIO / PANTALLA EN VIVO)</span>
                  </div>
                  <PresenterDashboard
                    session={activeSession}
                    questions={questions}
                    onOpenQR={() => setIsQRModalOpen(true)}
                  />
                </div>

                {/* Mobile Preview Side */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Smartphone size={16} color="var(--accent-primary)" />
                    <span>SIMULADOR CELULAR PARTICIPANTE</span>
                  </div>
                  
                  <div className="mobile-frame">
                    <div className="mobile-notch"></div>
                    <div style={{ flex: 1, overflowY: 'auto', paddingTop: '16px' }}>
                      <ParticipantView
                        session={activeSession}
                        questions={questions}
                        isMobileFrame={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h2>Cargando sesión...</h2>
          </div>
        )}
      </main>

      {/* Modals */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        session={activeSession}
        onOpenMobileView={() => setCurrentView('participant')}
      />

      <SpotlightModal
        question={spotlightQuestion}
        onClose={() => activeSession && sessionStore.setSpotlightQuestionId(activeSession.id, null)}
        questions={questions}
      />
    </div>
  );
}
