import React, { useState } from 'react';
import { 
  Send, 
  ThumbsUp, 
  ShieldCheck, 
  CheckCircle, 
  Flame, 
  Clock, 
  Sparkles, 
  Radio, 
  Layers
} from 'lucide-react';
import { QAPresentation, SlideResponse, sessionStore } from '../services/sessionStore';
import confetti from 'canvas-confetti';

interface ParticipantSlideViewProps {
  presentation: QAPresentation;
  responses: SlideResponse[];
  isMobileFrame?: boolean;
}

export const ParticipantSlideView: React.FC<ParticipantSlideViewProps> = ({
  presentation,
  responses,
  isMobileFrame = false
}) => {
  const [newResponseText, setNewResponseText] = useState('');
  const [authorAlias, setAuthorAlias] = useState('');
  const [useCustomAlias, setUseCustomAlias] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const activeIndex = presentation.activeSlideIndex || 0;
  const currentSlide = presentation.slides[activeIndex] || presentation.slides[0];

  const userVotes = sessionStore.getUserVotes();

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResponseText.trim() || !currentSlide) return;

    sessionStore.addResponse(
      presentation.id,
      currentSlide.id,
      newResponseText,
      useCustomAlias && authorAlias.trim() ? authorAlias : 'Anónimo'
    );

    setNewResponseText('');
    setSubmittedSuccess(true);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 3000);
  };

  const currentSlideResponses = responses
    .filter(r => r.presentationId === presentation.id && (!currentSlide?.id || r.slideId === currentSlide?.id || !r.slideId || presentation.slides.length <= 1))
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div style={{
      width: '100%',
      maxWidth: isMobileFrame ? '100%' : '560px',
      margin: isMobileFrame ? 0 : '0 auto',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: 'var(--bg-primary)'
    }}>
      {/* Mobile Header Bar with Logos */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Resplandece Logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <img src="/JEA.png" alt="JEA" style={{ height: '24px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }} className="gradient-text">Resplandece</span>
            <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              #{presentation.code}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 600 }}>
            <ShieldCheck size={14} /> 100% Anónimo
          </div>
        </div>

        {/* Live Active Slide Tracker Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-accent-subtle)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-glow)'
        }}>
          <span className="badge badge-live" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
            <Radio size={10} className="glow-effect" /> DIAPOSITIVA EN VIVO #{activeIndex + 1}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {presentation.title}
          </span>
        </div>
      </div>

      {/* Main Slide Card Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* Current Active Slide Prompt Display */}
        {currentSlide && (
          <div className="glass-panel animate-pop glow-effect" style={{ padding: '20px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src="/llama.png" alt="Llama icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {currentSlide.prompt}
              </h2>
            </div>
            {currentSlide.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '32px' }}>
                {currentSlide.description}
              </p>
            )}

            {/* Answer Form for Active Slide */}
            <form onSubmit={handleSendResponse} style={{ marginTop: '16px' }}>
              <textarea
                required
                maxLength={300}
                placeholder="Escribe tu respuesta anónima para esta diapositiva..."
                value={newResponseText}
                onChange={(e) => setNewResponseText(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />

              {/* Alias option */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useCustomAlias}
                    onChange={(e) => setUseCustomAlias(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Nombre/Alias (Opcional)</span>
                </label>

                {useCustomAlias && (
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={authorAlias}
                    onChange={(e) => setAuthorAlias(e.target.value)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '130px'
                    }}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={!newResponseText.trim()}
                className="gradient-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: newResponseText.trim() ? 1 : 0.6
                }}
              >
                <Send size={18} />
                <span>Enviar Respuesta Anónima</span>
              </button>

              {submittedSuccess && (
                <div className="animate-pop" style={{ marginTop: '10px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <CheckCircle size={16} /> ¡Respuesta publicada en la diapositiva en vivo!
                </div>
              )}
            </form>
          </div>
        )}

        {/* Responses Feed for current slide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="var(--warning-color)" /> Respuestas enviadas por la audiencia ({currentSlideResponses.length})
          </div>

          {currentSlideResponses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>Sé el primero en responder sobre esta diapositiva.</p>
            </div>
          ) : (
            currentSlideResponses.map(r => {
              const hasVoted = userVotes.includes(r.id);
              return (
                <div
                  key={r.id}
                  className="glass-panel animate-slide-up"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: r.isPinned ? '3px solid var(--warning-color)' : '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      👤 {r.authorAlias}
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {r.content}
                    </p>
                  </div>

                  <button
                    onClick={() => sessionStore.toggleUpvote(r.id)}
                    className={`upvote-btn ${hasVoted ? 'voted' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <ThumbsUp size={14} />
                    <span>{r.upvotes}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
