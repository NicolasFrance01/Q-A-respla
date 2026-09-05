import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  QrCode, 
  ThumbsUp, 
  Pin, 
  CheckCircle, 
  Trash2, 
  Maximize2, 
  Sparkles, 
  MessageSquare,
  Power,
  Radio
} from 'lucide-react';
import { QAPresentation, SlideResponse, sessionStore } from '../services/sessionStore';
import { QRCodeSVG } from 'qrcode.react';

interface PresenterSlideDeckProps {
  presentation: QAPresentation;
  responses: SlideResponse[];
  onOpenQR: () => void;
  onOpenCreator: () => void;
}

export const PresenterSlideDeck: React.FC<PresenterSlideDeckProps> = ({
  presentation,
  responses,
  onOpenQR,
  onOpenCreator
}) => {
  const [newSlidePrompt, setNewSlidePrompt] = useState('');
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  const activeIndex = presentation.activeSlideIndex || 0;
  const currentSlide = presentation.slides[activeIndex] || presentation.slides[0];

  // Filter responses specifically for current slide
  const slideResponses = responses
    .filter(r => r.slideId === currentSlide?.id)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.upvotes - a.upvotes;
    });

  const handlePrevSlide = () => {
    if (activeIndex > 0) {
      sessionStore.setActiveSlideIndex(presentation.id, activeIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (activeIndex < presentation.slides.length - 1) {
      sessionStore.setActiveSlideIndex(presentation.id, activeIndex + 1);
    }
  };

  const handleAddSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlidePrompt.trim()) return;
    sessionStore.addSlide(presentation.id, newSlidePrompt.trim());
    setNewSlidePrompt('');
    setIsAddingSlide(false);
    // Switch to newly created slide automatically
    sessionStore.setActiveSlideIndex(presentation.id, presentation.slides.length);
  };

  const participantUrl = `${window.location.origin}${window.location.pathname}?session=${presentation.id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Slide Navigation & Controller Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Session info & logos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/logo.png" alt="Resplandece Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <img src="/JEA.png" alt="JEA Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{presentation.title}</span>
              <span className="badge badge-live" style={{ fontSize: '0.65rem' }}>
                <Radio size={10} className="glow-effect" /> DIAPOSITIVA EN VIVO
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Código: #{presentation.code}</span>
          </div>
        </div>

        {/* Center: Slide Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-secondary)', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button
            disabled={activeIndex === 0}
            onClick={handlePrevSlide}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Diapositiva Anterior"
          >
            <ChevronLeft size={22} />
          </button>

          <div style={{ fontSize: '0.9rem', fontWeight: 700, padding: '0 8px', color: 'var(--accent-primary)' }}>
            Diapositiva {activeIndex + 1} de {presentation.slides.length}
          </div>

          <button
            disabled={activeIndex >= presentation.slides.length - 1}
            onClick={handleNextSlide}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeIndex >= presentation.slides.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: activeIndex >= presentation.slides.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Siguiente Diapositiva"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsAddingSlide(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Añadir Diapositiva
          </button>

          <button
            onClick={onOpenQR}
            className="gradient-btn"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={16} /> Ver QR
          </button>

          <button
            onClick={onOpenCreator}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Nueva Presentación
          </button>
        </div>

      </div>

      {/* Slide Thumbnails Bar */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {presentation.slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => sessionStore.setActiveSlideIndex(presentation.id, idx)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: idx === activeIndex ? 'var(--bg-card)' : 'var(--bg-secondary)',
              border: idx === activeIndex ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              color: idx === activeIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: idx === activeIndex ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: idx === activeIndex ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <img src="/llama.png" alt="Llama" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            <span>Diapositiva {idx + 1}</span>
            {idx === activeIndex && (
              <span className="badge badge-live" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                ACTIVA
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Slide Stage (Big Screen View) */}
      <div className="glass-panel animate-pop" style={{
        padding: '36px',
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-secondary)',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Active Slide Header & Prompt */}
        {currentSlide && (
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img src="/llama.png" alt="Llama icon" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentSlide.prompt}
              </h1>
            </div>
            {currentSlide.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginLeft: '48px' }}>
                {currentSlide.description}
              </p>
            )}
          </div>
        )}

        {/* Live Responses Cards Stage */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Respuestas en vivo de los usuarios ({slideResponses.length})
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              🟢 Sincronizado con celulares en tiempo real
            </div>
          </div>

          {slideResponses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)' }}>
              <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Esperando respuestas de los participantes</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                Las tarjetas con las preguntas y respuestas enviadas por la audiencia desde el QR aparecerán aquí en vivo en esta diapositiva.
              </p>

              <button
                onClick={onOpenQR}
                className="gradient-btn"
                style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
              >
                Mostrar Código QR
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {slideResponses.map(r => (
                <div
                  key={r.id}
                  className="glass-panel animate-slide-up"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: r.isPinned ? '4px solid var(--warning-color)' : r.isAnswered ? '4px solid var(--success-color)' : '1px solid var(--border-color)',
                    background: 'var(--bg-primary)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {r.isPinned && (
                        <span className="badge badge-pinned" style={{ fontSize: '0.65rem' }}>
                          <Pin size={10} /> FIJADA
                        </span>
                      )}
                      {r.isAnswered && (
                        <span className="badge badge-answered" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle size={10} /> RESPONDIDA
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        👤 {r.authorAlias}
                      </span>
                    </div>

                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {r.content}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => sessionStore.toggleUpvote(r.id)}
                      className="upvote-btn voted"
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    >
                      <ThumbsUp size={14} />
                      <span>{r.upvotes}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => sessionStore.togglePinned(r.id)}
                        style={{ background: 'transparent', border: 'none', color: r.isPinned ? 'var(--warning-color)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Fijar respuesta"
                      >
                        <Pin size={16} />
                      </button>

                      <button
                        onClick={() => sessionStore.toggleAnswered(r.id)}
                        style={{ background: 'transparent', border: 'none', color: r.isAnswered ? 'var(--success-color)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Marcar respondida"
                      >
                        <CheckCircle size={16} />
                      </button>

                      <button
                        onClick={() => sessionStore.deleteResponse(r.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Slide Modal */}
      {isAddingSlide && (
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
          <div className="glass-panel animate-pop" style={{ width: '100%', maxWidth: '440px', padding: '28px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>Añadir Nueva Diapositiva</h3>
            <form onSubmit={handleAddSlideSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Pregunta o Consigna de la Diapositiva *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ¿Qué inquietudes tienen sobre la siguiente etapa?"
                  value={newSlidePrompt}
                  onChange={(e) => setNewSlidePrompt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingSlide(false)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="gradient-btn" style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)' }}>
                  Añadir Diapositiva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
