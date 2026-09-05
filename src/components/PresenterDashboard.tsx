import React, { useState } from 'react';
import { 
  ThumbsUp, 
  Pin, 
  CheckCircle, 
  Trash2, 
  Maximize2, 
  Search, 
  Filter, 
  QrCode, 
  MessageSquare, 
  BarChart3, 
  Lock, 
  Unlock, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Question, QASession, sessionStore } from '../services/sessionStore';
import { QRCodeSVG } from 'qrcode.react';

interface PresenterDashboardProps {
  session: QASession;
  questions: Question[];
  onOpenQR: () => void;
}

export const PresenterDashboard: React.FC<PresenterDashboardProps> = ({
  session,
  questions,
  onOpenQR
}) => {
  const [filterMode, setFilterMode] = useState<'popular' | 'recent' | 'unanswered' | 'answered'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const userVotes = sessionStore.getUserVotes();

  // Statistics
  const totalQuestions = questions.length;
  const answeredCount = questions.filter(q => q.isAnswered).length;
  const totalVotes = questions.reduce((acc, q) => acc + q.upvotes, 0);

  // Sorting & Filtering
  const filteredQuestions = questions
    .filter(q => {
      if (searchQuery.trim()) {
        return q.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(q => {
      if (filterMode === 'unanswered') return !q.isAnswered;
      if (filterMode === 'answered') return q.isAnswered;
      return true;
    })
    .sort((a, b) => {
      // Pinned items always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (filterMode === 'popular') {
        return b.upvotes - a.upvotes;
      }
      // default: recent
      return b.createdAt - a.createdAt;
    });

  const participantUrl = `${window.location.origin}${window.location.pathname}?session=${session.id}`;

  const formatRelativeTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours} h`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Session Banner & Stats */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/llama.png" alt="Llama" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{session.title}</h1>
            </div>
            <button
              onClick={() => sessionStore.toggleAcceptingQuestions(session.id)}
              className="badge"
              style={{
                background: session.isAcceptingQuestions ? 'var(--success-bg)' : 'rgba(239, 68, 68, 0.15)',
                color: session.isAcceptingQuestions ? 'var(--success-color)' : 'var(--danger-color)',
                border: `1px solid ${session.isAcceptingQuestions ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '4px 10px'
              }}
            >
              {session.isAcceptingQuestions ? <Unlock size={12} /> : <Lock size={12} />}
              <span>{session.isAcceptingQuestions ? 'Recepción Abierta' : 'Recepción Cerrada'}</span>
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Panel de control del presentador. Los usuarios pueden escanear el QR para enviar sus preguntas.
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalQuestions}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PREGUNTAS</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success-color)' }}>{answeredCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RESPONDIDAS</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', minWidth: '100px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning-color)' }}>{totalVotes}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL VOTOS</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Feed (Left) & QR Code Quick Widget (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        
        {/* Left Column: Filters & Question List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls & Filter Bar */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar pregunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setFilterMode('popular')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: filterMode === 'popular' ? 'var(--accent-gradient)' : 'transparent',
                  color: filterMode === 'popular' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Más Populares
              </button>

              <button
                onClick={() => setFilterMode('recent')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: filterMode === 'recent' ? 'var(--accent-gradient)' : 'transparent',
                  color: filterMode === 'recent' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Recientes
              </button>

              <button
                onClick={() => setFilterMode('unanswered')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: filterMode === 'unanswered' ? 'var(--accent-gradient)' : 'transparent',
                  color: filterMode === 'unanswered' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Pendientes ({totalQuestions - answeredCount})
              </button>

              <button
                onClick={() => setFilterMode('answered')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: filterMode === 'answered' ? 'var(--accent-gradient)' : 'transparent',
                  color: filterMode === 'answered' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Respondidas ({answeredCount})
              </button>
            </div>
          </div>

          {/* Question Cards Feed */}
          {filteredQuestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <HelpCircle size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>No hay preguntas en esta vista</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {searchQuery ? 'Prueba a cambiar tu término de búsqueda' : '¡Sé el primero en enviar una pregunta desde el celular!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredQuestions.map(q => {
                const hasVoted = userVotes.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className="glass-panel animate-slide-up"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      borderLeft: q.isPinned ? '4px solid var(--warning-color)' : q.isAnswered ? '4px solid var(--success-color)' : '1px solid var(--border-color)',
                      opacity: q.isAnswered ? 0.75 : 1,
                      transition: 'all var(--transition-normal)'
                    }}
                  >
                    {/* Question Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        {q.isPinned && (
                          <span className="badge badge-pinned">
                            <Pin size={12} /> FIJADA
                          </span>
                        )}
                        {q.isAnswered && (
                          <span className="badge badge-answered">
                            <CheckCircle size={12} /> RESPONDIDA
                          </span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          👤 {q.authorAlias}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {formatRelativeTime(q.createdAt)}
                        </span>
                      </div>

                      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {q.content}
                      </p>
                    </div>

                    {/* Actions & Upvote */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      
                      {/* Upvote Button */}
                      <button
                        onClick={() => sessionStore.toggleUpvote(q.id)}
                        className={`upvote-btn ${hasVoted ? 'voted' : ''}`}
                      >
                        <ThumbsUp size={16} />
                        <span>{q.upvotes}</span>
                      </button>

                      {/* Spotlight Focus Mode */}
                      <button
                        onClick={() => sessionStore.setSpotlightQuestionId(session.id, q.id)}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--accent-primary)',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Enfocar en pantalla grande"
                      >
                        <Maximize2 size={16} />
                      </button>

                      {/* Pin Toggle */}
                      <button
                        onClick={() => sessionStore.togglePinned(q.id)}
                        style={{
                          background: q.isPinned ? 'var(--warning-bg)' : 'var(--bg-secondary)',
                          border: `1px solid ${q.isPinned ? 'var(--warning-color)' : 'var(--border-color)'}`,
                          color: q.isPinned ? 'var(--warning-color)' : 'var(--text-secondary)',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title={q.isPinned ? 'Desfijar' : 'Fijar arriba'}
                      >
                        <Pin size={16} />
                      </button>

                      {/* Answer Toggle */}
                      <button
                        onClick={() => sessionStore.toggleAnswered(q.id)}
                        style={{
                          background: q.isAnswered ? 'var(--success-bg)' : 'var(--bg-secondary)',
                          border: `1px solid ${q.isAnswered ? 'var(--success-color)' : 'var(--border-color)'}`,
                          color: q.isAnswered ? 'var(--success-color)' : 'var(--text-secondary)',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title={q.isAnswered ? 'Marcar como pendiente' : 'Marcar como respondida'}
                      >
                        <CheckCircle size={16} />
                      </button>

                      {/* Delete Question */}
                      <button
                        onClick={() => sessionStore.deleteQuestion(q.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: 'var(--danger-color)',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Eliminar pregunta"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: QR Code Card Showcase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Acceso Audiencia
            </div>

            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              display: 'inline-block',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <QRCodeSVG
                value={participantUrl}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="M"
              />
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              #{session.code}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Escanea el código QR con cualquier teléfono móvil
            </p>

            <button
              onClick={onOpenQR}
              className="gradient-btn"
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <QrCode size={16} /> Ampliar QR para Proyector
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
