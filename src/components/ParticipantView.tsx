import React, { useState } from 'react';
import { 
  Send, 
  ThumbsUp, 
  CheckCircle, 
  Pin, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  User, 
  Lock,
  Flame,
  Clock
} from 'lucide-react';
import { Question, QASession, sessionStore } from '../services/sessionStore';
import confetti from 'canvas-confetti';

interface ParticipantViewProps {
  session: QASession;
  questions: Question[];
  isMobileFrame?: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  session,
  questions,
  isMobileFrame = false
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [authorAlias, setAuthorAlias] = useState('');
  const [useCustomAlias, setUseCustomAlias] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [tab, setTab] = useState<'all' | 'popular' | 'my'>('popular');

  const userVotes = sessionStore.getUserVotes();

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !session.isAcceptingQuestions) return;

    sessionStore.addQuestion(
      newQuestionText,
      session.id,
      useCustomAlias && authorAlias.trim() ? authorAlias : 'Anónimo'
    );

    setNewQuestionText('');
    setSubmittedSuccess(true);
    
    // Trigger festive micro-confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });

    setTimeout(() => {
      setSubmittedSuccess(false);
    }, 3000);
  };

  // Filter questions
  const filteredQuestions = questions
    .filter(q => {
      if (tab === 'my') {
        // Questions created by user vote tracking or local
        return userVotes.includes(q.id);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (tab === 'popular') {
        return b.upvotes - a.upvotes;
      }
      return b.createdAt - a.createdAt;
    });

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
      {/* Mobile Top App Bar */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/logo.png" 
              alt="Resplandece Logo" 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <img 
              src="/JEA.png" 
              alt="JEA Jóvenes en Acción" 
              style={{ height: '24px', objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }} className="gradient-text">Resplandece</span>
            <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              #{session.code}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 600 }}>
            <ShieldCheck size={14} /> 100% Anónimo
          </div>
        </div>

        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <img src="/llama.png" alt="Llama" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <span>{session.title}</span>
        </h2>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* Question Submission Card */}
        <div className="glass-panel" style={{ padding: '18px', background: 'var(--bg-secondary)' }}>
          {!session.isAcceptingQuestions ? (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
              <Lock size={28} style={{ marginBottom: '8px', color: 'var(--warning-color)' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>El presentador ha pausado la recepción de preguntas.</p>
            </div>
          ) : (
            <form onSubmit={handleSendQuestion}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Haz tu pregunta a la sala:
                </label>
                <span style={{ fontSize: '0.75rem', color: newQuestionText.length > 250 ? 'var(--warning-color)' : 'var(--text-muted)' }}>
                  {newQuestionText.length}/300
                </span>
              </div>

              <textarea
                required
                maxLength={300}
                placeholder="Escribe tu pregunta aquí de forma anónima..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
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

              {/* Identity toggle (Anonymous vs Optional Alias) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={useCustomAlias}
                    onChange={(e) => setUseCustomAlias(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>Agregar nombre/alias (Opcional)</span>
                </label>

                {useCustomAlias && (
                  <input
                    type="text"
                    placeholder="Tu nombre o apodo"
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
                      width: '140px'
                    }}
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!newQuestionText.trim()}
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
                  opacity: newQuestionText.trim() ? 1 : 0.6,
                  cursor: newQuestionText.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={18} />
                <span>Enviar Pregunta Anónima</span>
              </button>

              {submittedSuccess && (
                <div className="animate-pop" style={{ marginTop: '10px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)', color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <CheckCircle size={16} /> ¡Pregunta enviada en vivo al presentador!
                </div>
              )}
            </form>
          )}
        </div>

        {/* Tab Filters for Audience */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button
            onClick={() => setTab('popular')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: tab === 'popular' ? 'var(--accent-gradient)' : 'transparent',
              color: tab === 'popular' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Flame size={14} /> Populares
          </button>

          <button
            onClick={() => setTab('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: tab === 'all' ? 'var(--accent-gradient)' : 'transparent',
              color: tab === 'all' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={14} /> Recientes
          </button>

          <button
            onClick={() => setTab('my')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: tab === 'my' ? 'var(--accent-gradient)' : 'transparent',
              color: tab === 'my' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <User size={14} /> Mis Votos
          </button>
        </div>

        {/* Questions Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>No hay preguntas para mostrar en esta pestaña.</p>
            </div>
          ) : (
            filteredQuestions.map(q => {
              const hasVoted = userVotes.includes(q.id);
              return (
                <div
                  key={q.id}
                  className="glass-panel animate-slide-up"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: q.isPinned ? '3px solid var(--warning-color)' : q.isAnswered ? '3px solid var(--success-color)' : '1px solid var(--border-color)',
                    opacity: q.isAnswered ? 0.75 : 1
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {q.isPinned && (
                        <span className="badge badge-pinned" style={{ fontSize: '0.65rem' }}>
                          <Pin size={10} /> FIJADA
                        </span>
                      )}
                      {q.isAnswered && (
                        <span className="badge badge-answered" style={{ fontSize: '0.65rem' }}>
                          <CheckCircle size={10} /> RESPONDIDA
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {q.authorAlias}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {q.content}
                    </p>
                  </div>

                  {/* Mobile Upvote button */}
                  <button
                    onClick={() => sessionStore.toggleUpvote(q.id)}
                    className={`upvote-btn ${hasVoted ? 'voted' : ''}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <ThumbsUp size={14} />
                    <span>{q.upvotes}</span>
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
