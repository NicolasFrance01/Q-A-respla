import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, X, Layers, Send } from 'lucide-react';
import { sessionStore, QAPresentation } from '../services/sessionStore';

interface PresentationCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (presentation: QAPresentation) => void;
}

export const PresentationCreator: React.FC<PresentationCreatorProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [slides, setSlides] = useState<{ prompt: string; description?: string }[]>([
    { prompt: '¿Qué preguntas o inquietudes tienes para iniciar esta sesión?', description: 'Envía tu respuesta anónima desde tu celular' }
  ]);

  if (!isOpen) return null;

  const handleAddSlide = () => {
    setSlides(prev => [
      ...prev,
      { prompt: `Diapositiva ${prev.length + 1}: Ingresa la pregunta aquí`, description: 'Responde de forma 100% anónima' }
    ]);
  };

  const handleUpdateSlidePrompt = (index: number, prompt: string) => {
    const updated = [...slides];
    updated[index].prompt = prompt;
    setSlides(updated);
  };

  const handleUpdateSlideDescription = (index: number, description: string) => {
    const updated = [...slides];
    updated[index].description = description;
    setSlides(updated);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || slides.length === 0) return;

    const created = sessionStore.createPresentation(
      title.trim(),
      slides.filter(s => s.prompt.trim() !== ''),
      code.trim() || undefined
    );

    onCreated(created);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-panel animate-pop glow-effect" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glow)'
      }}>
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
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="Resplandece Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <img src="/JEA.png" alt="JEA Logo" style={{ height: '32px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Crear Presentación Q&A Anónimas</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Crea tus diapositivas con preguntas interactivas. La audiencia responderá en tiempo real desde el código QR.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '6px' }}>
          
          {/* Title & Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Título de la Presentación *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Conferencia Jóvenes en Acción 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Código (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: JEA-2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

          {/* Slides List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
                <Layers size={16} color="var(--accent-primary)" />
                <span>Diapositivas de la Presentación ({slides.length})</span>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-accent-subtle)',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} /> Añadir Diapositiva
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {slides.map((slide, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/llama.png" alt="Llama" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      Diapositiva #{idx + 1}
                    </div>

                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem'
                        }}
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Escribe la pregunta o consigna de esta diapositiva..."
                    value={slide.prompt}
                    onChange={(e) => handleUpdateSlidePrompt(idx, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Descripción o instrucción opcional..."
                    value={slide.description || ''}
                    onChange={(e) => handleUpdateSlideDescription(idx, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
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
                padding: '10px 24px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} /> Lanzar Presentación en Vivo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
