import React from 'react';
import { X, CheckCircle, ThumbsUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, sessionStore } from '../services/sessionStore';

interface SpotlightModalProps {
  question: Question | null;
  onClose: () => void;
  questions: Question[];
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  question,
  onClose,
  questions
}) => {
  if (!question) return null;

  const currentIndex = questions.findIndex(q => q.id === question.id);
  const prevQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex !== -1 && currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;

  const handleMarkAnswered = () => {
    sessionStore.toggleAnswered(question.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSelectQuestion = (qId: string) => {
    sessionStore.setSpotlightQuestionId(question.sessionId, qId);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 16, 0.94)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 1000,
      padding: '40px'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-live" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> PREGUNTA DESTACADA
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {currentIndex + 1} de {questions.length} preguntas
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-tertiary)',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <X size={18} /> Salir del Enfoque
        </button>
      </div>

      {/* Main Big Display */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', textAlign: 'center' }} className="animate-pop">
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative'
        }}>
          {question.isAnswered && (
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-answered" style={{ fontSize: '1rem', padding: '6px 16px' }}>
                <CheckCircle size={18} /> RESPONDIDA
              </span>
            </div>
          )}

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            marginBottom: '32px'
          }}>
            "{question.content}"
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <div className="upvote-btn voted" style={{ fontSize: '1.2rem', padding: '10px 24px' }}>
              <ThumbsUp size={22} />
              <span>{question.upvotes} {question.upvotes === 1 ? 'Voto' : 'Votos'}</span>
            </div>

            <button
              onClick={handleMarkAnswered}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                background: question.isAnswered ? 'var(--bg-tertiary)' : 'var(--success-bg)',
                border: `1px solid ${question.isAnswered ? 'var(--border-color)' : 'var(--success-color)'}`,
                color: question.isAnswered ? 'var(--text-secondary)' : 'var(--success-color)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={20} />
              <span>{question.isAnswered ? 'Marcar Pendiente' : 'Marcar como Respondida'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button
          disabled={!prevQuestion}
          onClick={() => prevQuestion && handleSelectQuestion(prevQuestion.id)}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: prevQuestion ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: prevQuestion ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: prevQuestion ? 1 : 0.4
          }}
        >
          <ChevronLeft size={20} /> Pregunta Anterior
        </button>

        <button
          disabled={!nextQuestion}
          onClick={() => nextQuestion && handleSelectQuestion(nextQuestion.id)}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: nextQuestion ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: nextQuestion ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: nextQuestion ? 1 : 0.4
          }}
        >
          Siguiente Pregunta <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
