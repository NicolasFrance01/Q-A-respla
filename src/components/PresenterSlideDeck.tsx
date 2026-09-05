import React, { useState, useEffect } from 'react';
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
  Minimize2,
  MessageSquare,
  Radio
} from 'lucide-react';
import { QAPresentation, SlideResponse, sessionStore } from '../services/sessionStore';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeIndex = presentation.activeSlideIndex || 0;
  const currentSlide = presentation.slides[activeIndex] || presentation.slides[0];

  // Filter responses for the presentation (and active slide if specified)
  const slideResponses = responses
    .filter(r => r.presentationId === presentation.id && (!r.slideId || !currentSlide?.id || r.slideId === currentSlide?.id || presentation.slides.length <= 1))
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, presentation.slides.length, isFullscreen]);

  const handleAddSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlidePrompt.trim()) return;
    sessionStore.addSlide(presentation.id, newSlidePrompt.trim());
    setNewSlidePrompt('');
    setIsAddingSlide(false);
    sessionStore.setActiveSlideIndex(presentation.id, presentation.slides.length);
  };

  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#090d16',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 48px',
        color: '#ffffff'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="Resplandece Logo" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <img src="/JEA.png" alt="JEA Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{presentation.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Código QR: #{presentation.code}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)', background: 'var(--bg-tertiary)', padding: '6px 16px', borderRadius: 'var(--radius-full)' }}>
              Diapositiva {activeIndex + 1} de {presentation.slides.length}
            </span>

            <button
              onClick={onOpenQR}
              className="gradient-btn"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={16} /> QR
            </button>

            <button
              onClick={() => setIsFullscreen(false)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Minimize2 size={16} /> Salir a Inicio (Esc)
            </button>
          </div>
        </div>

        {/* Stage Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0' }}>
          {currentSlide && (
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '8px' }}>
                <img src="/llama.png" alt="Llama" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  {currentSlide.prompt}
                </h1>
              </div>
              {currentSlide.description && (
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {currentSlide.description}
                </p>
              )}
            </div>
          )}

          {/* Cards Grid */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
            {slideResponses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <MessageSquare size={56} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Esperando respuestas de los participantes</h2>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 16px auto' }}>
                  Las tarjetas con las respuestas del público al escanear el QR aparecerán en esta pantalla en vivo.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {slideResponses.map(r => (
                  <div
                    key={r.id}
                    className="glass-panel animate-pop"
                    style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'rgba(31, 41, 55, 0.85)',
                      borderLeft: r.isPinned ? '5px solid var(--warning-color)' : r.isAnswered ? '5px solid var(--success-color)' : '1px solid var(--border-glow)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        👤 {r.authorAlias}
                      </span>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>
                        {r.content}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={() => sessionStore.toggleUpvote(r.id)}
                        className="upvote-btn voted"
                        style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                      >
                        <ThumbsUp size={16} />
                        <span>{r.upvotes}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => sessionStore.togglePinned(r.id)} style={{ background: 'transparent', border: 'none', color: r.isPinned ? 'var(--warning-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                          <Pin size={18} />
                        </button>
                        <button onClick={() => sessionStore.toggleAnswered(r.id)} style={{ background: 'transparent', border: 'none', color: r.isAnswered ? 'var(--success-color)' : 'var(--text-muted)', cursor: 'pointer' }}>
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => sessionStore.deleteResponse(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <button
            disabled={activeIndex === 0}
            onClick={handlePrevSlide}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: activeIndex === 0 ? 'var(--text-muted)' : '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: activeIndex === 0 ? 0.4 : 1
            }}
          >
            <ChevronLeft size={22} /> Diapositiva Anterior
          </button>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Usa las flechas del teclado <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>←</kbd> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>→</kbd> para navegar
          </div>

          <button
            disabled={activeIndex >= presentation.slides.length - 1}
            onClick={handleNextSlide}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: activeIndex >= presentation.slides.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: activeIndex >= presentation.slides.length - 1 ? 0.4 : 1
            }}
          >
            Siguiente Diapositiva <ChevronRight size={22} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Controller Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
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

        {/* Slide Switcher */}
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

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsFullscreen(true)}
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
            <Maximize2 size={16} /> Pantalla Completa
          </button>

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
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
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

      {/* Main Slide Stage */}
      <div className="glass-panel animate-pop" style={{
        padding: '36px',
        border: '1px solid var(--border-glow)',
        background: 'var(--bg-secondary)',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Active Slide Prompt */}
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

        {/* Live Cards Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Respuestas en vivo de los usuarios ({slideResponses.length})
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              🟢 Sincronizado en vivo con celulares
            </div>
          </div>

          {slideResponses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-color)' }}>
              <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Esperando respuestas de los participantes</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                Las tarjetas con las respuestas enviadas desde los celulares al escanear el QR aparecerán aquí en tiempo real.
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
                      <button onClick={() => sessionStore.togglePinned(r.id)} style={{ background: 'transparent', border: 'none', color: r.isPinned ? 'var(--warning-color)' : 'var(--text-muted)', cursor: 'pointer' }} title="Fijar">
                        <Pin size={16} />
                      </button>
                      <button onClick={() => sessionStore.toggleAnswered(r.id)} style={{ background: 'transparent', border: 'none', color: r.isAnswered ? 'var(--success-color)' : 'var(--text-muted)', cursor: 'pointer' }} title="Respondida">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => sessionStore.deleteResponse(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Eliminar">
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          zIndex: 1000,
          padding: '24px 16px'
        }}>
          <div className="glass-panel animate-pop" style={{ width: '100%', maxWidth: '440px', margin: 'auto 0', padding: '28px', background: 'var(--bg-secondary)', boxSizing: 'border-box' }}>
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
