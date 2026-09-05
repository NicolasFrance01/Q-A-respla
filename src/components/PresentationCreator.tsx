import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, X, Layers } from 'lucide-react';
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
      background: 'rgba(5, 8, 16, 0.88)',
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
        maxWidth: '680px',
        margin: 'auto 0',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-glow)',
        boxSizing: 'border-box'
      }}>
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
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <img src="/logo.png" alt="Resplandece Logo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
          <img src="/JEA.png" alt="JEA Logo" style={{ height: '30px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Crear Presentación Q&A Anónimas</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Crea tus diapositivas con preguntas interactivas. La audiencia responderá en tiempo real desde el código QR.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Title & Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
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
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                Código (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: JEA-2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

          {/* Slides List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                <Layers size={16} color="var(--accent-primary)" />
                <span>Diapositivas de la Presentación ({slides.length})</span>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-accent-subtle)',
                  border: '1px solid var(--border-glow)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Añadir Diapositiva
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {slides.map((slide, idx) => (
                <div key={idx} style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/llama.png" alt="Llama" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
                        <Trash2 size={12} /> Eliminar
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
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
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
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="gradient-btn"
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
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
