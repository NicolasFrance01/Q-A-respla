export interface Question {
  id: string;
  sessionId: string;
  content: string;
  upvotes: number;
  createdAt: number;
  isAnswered: boolean;
  isPinned: boolean;
  authorAlias: string;
}

export interface QASession {
  id: string;
  title: string;
  code: string;
  createdAt: number;
  isAcceptingQuestions: boolean;
  spotlightQuestionId: string | null;
}

const STORAGE_KEYS = {
  SESSIONS: 'respla_qa_sessions',
  ACTIVE_SESSION_ID: 'respla_qa_active_session_id',
  QUESTIONS: 'respla_qa_questions',
  USER_VOTES: 'respla_qa_user_votes',
};

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('respla_qa_sync') : null;

const defaultSessions: QASession[] = [
  {
    id: 'demo-session-1',
    title: 'Presentación: Lanzamiento de Producto & Estrategia 2026 🚀',
    code: 'PROD-2026',
    createdAt: Date.now() - 3600000,
    isAcceptingQuestions: true,
    spotlightQuestionId: null,
  }
];

const defaultQuestions: Question[] = [
  {
    id: 'q-1',
    sessionId: 'demo-session-1',
    content: '¿Cuál es la fecha estimada de lanzamiento del módulo adicional para usuarios en móviles?',
    upvotes: 18,
    createdAt: Date.now() - 2500000,
    isAnswered: false,
    isPinned: true,
    authorAlias: 'Anónimo'
  },
  {
    id: 'q-2',
    sessionId: 'demo-session-1',
    content: '¿Se podrá integrar este sistema de preguntas en vivo con plataformas de streaming como Zoom o YouTube Live?',
    upvotes: 12,
    createdAt: Date.now() - 1800000,
    isAnswered: false,
    isPinned: false,
    authorAlias: 'Anónimo'
  },
  {
    id: 'q-3',
    sessionId: 'demo-session-1',
    content: '¿Hay un límite de preguntas que un usuario puede enviar de manera anónima?',
    upvotes: 7,
    createdAt: Date.now() - 900000,
    isAnswered: true,
    isPinned: false,
    authorAlias: 'Anónimo'
  }
];

export const sessionStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(defaultSessions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, 'demo-session-1');
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(defaultQuestions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_VOTES)) {
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify([]));
    }
    this.syncFromRemote();
  },

  notifySync() {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'STATE_CHANGED', timestamp: Date.now() });
    }
    window.dispatchEvent(new Event('respla_state_update'));
  },

  // Remote PostgreSQL sync helpers
  async syncFromRemote() {
    try {
      const resSessions = await fetch('/api/sessions');
      if (resSessions.ok) {
        const remoteSessions: QASession[] = await resSessions.json();
        if (remoteSessions && remoteSessions.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(remoteSessions));
        }
      }

      const resQuestions = await fetch('/api/questions');
      if (resQuestions.ok) {
        const remoteQuestions: Question[] = await resQuestions.json();
        if (remoteQuestions && remoteQuestions.length > 0) {
          localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(remoteQuestions));
        }
      }
      this.notifySync();
    } catch (err) {
      // Offline / fallback to localStorage
    }
  },

  getSessions(): QASession[] {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '[]');
    } catch {
      return defaultSessions;
    }
  },

  getActiveSessionId(): string {
    this.init();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID) || 'demo-session-1';
  },

  setActiveSessionId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
    this.notifySync();
  },

  getActiveSession(): QASession | undefined {
    const activeId = this.getActiveSessionId();
    return this.getSessions().find(s => s.id === activeId);
  },

  createSession(title: string, customCode?: string): QASession {
    const sessions = this.getSessions();
    const code = customCode?.trim().toUpperCase() || Math.random().toString(36).substring(2, 7).toUpperCase();
    const newSession: QASession = {
      id: 'session-' + Date.now(),
      title,
      code,
      createdAt: Date.now(),
      isAcceptingQuestions: true,
      spotlightQuestionId: null,
    };
    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, newSession.id);
    this.notifySync();

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession)
    }).catch(() => {});

    return newSession;
  },

  toggleAcceptingQuestions(sessionId: string) {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index].isAcceptingQuestions = !sessions[index].isAcceptingQuestions;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      this.notifySync();

      fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, isAcceptingQuestions: sessions[index].isAcceptingQuestions })
      }).catch(() => {});
    }
  },

  setSpotlightQuestionId(sessionId: string, questionId: string | null) {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index].spotlightQuestionId = questionId;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      this.notifySync();

      fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, spotlightQuestionId: questionId })
      }).catch(() => {});
    }
  },

  getQuestions(sessionId?: string): Question[] {
    this.init();
    try {
      const all: Question[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
      const targetSessionId = sessionId || this.getActiveSessionId();
      return all.filter(q => q.sessionId === targetSessionId);
    } catch {
      return [];
    }
  },

  addQuestion(content: string, sessionId?: string, authorAlias: string = 'Anónimo'): Question {
    const targetSessionId = sessionId || this.getActiveSessionId();
    const all = this.getAllQuestionsRaw();
    const newQ: Question = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      sessionId: targetSessionId,
      content: content.trim(),
      upvotes: 1,
      createdAt: Date.now(),
      isAnswered: false,
      isPinned: false,
      authorAlias: authorAlias.trim() || 'Anónimo',
    };
    all.unshift(newQ);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.registerUserVote(newQ.id);
    this.notifySync();

    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQ)
    }).catch(() => {});

    return newQ;
  },

  getAllQuestionsRaw(): Question[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    } catch {
      return [];
    }
  },

  getUserVotes(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_VOTES) || '[]');
    } catch {
      return [];
    }
  },

  registerUserVote(questionId: string) {
    const votes = this.getUserVotes();
    if (!votes.includes(questionId)) {
      votes.push(questionId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(votes));
    }
  },

  toggleUpvote(questionId: string) {
    const all = this.getAllQuestionsRaw();
    const qIndex = all.findIndex(q => q.id === questionId);
    if (qIndex === -1) return;

    const userVotes = this.getUserVotes();
    const hasVoted = userVotes.includes(questionId);
    const delta = hasVoted ? -1 : 1;

    if (hasVoted) {
      all[qIndex].upvotes = Math.max(0, all[qIndex].upvotes - 1);
      const newVotes = userVotes.filter(id => id !== questionId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(newVotes));
    } else {
      all[qIndex].upvotes += 1;
      userVotes.push(questionId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(userVotes));
    }

    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.notifySync();

    fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionId, action: 'upvote', delta })
    }).catch(() => {});
  },

  toggleAnswered(questionId: string) {
    const all = this.getAllQuestionsRaw();
    const qIndex = all.findIndex(q => q.id === questionId);
    if (qIndex !== -1) {
      all[qIndex].isAnswered = !all[qIndex].isAnswered;
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
      this.notifySync();

      fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: questionId, action: 'toggleAnswered' })
      }).catch(() => {});
    }
  },

  togglePinned(questionId: string) {
    const all = this.getAllQuestionsRaw();
    const qIndex = all.findIndex(q => q.id === questionId);
    if (qIndex !== -1) {
      all[qIndex].isPinned = !all[qIndex].isPinned;
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
      this.notifySync();

      fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: questionId, action: 'togglePinned' })
      }).catch(() => {});
    }
  },

  deleteQuestion(questionId: string) {
    let all = this.getAllQuestionsRaw();
    all = all.filter(q => q.id !== questionId);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.notifySync();

    fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionId })
    }).catch(() => {});
  },

  clearSessionQuestions(sessionId: string) {
    let all = this.getAllQuestionsRaw();
    all = all.filter(q => q.sessionId !== sessionId);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(all));
    this.notifySync();

    fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(() => {});
  },

  subscribe(callback: () => void) {
    const handler = () => callback();
    window.addEventListener('respla_state_update', handler);
    window.addEventListener('storage', handler);
    if (syncChannel) {
      syncChannel.onmessage = handler;
    }
    return () => {
      window.removeEventListener('respla_state_update', handler);
      window.removeEventListener('storage', handler);
    };
  }
};
