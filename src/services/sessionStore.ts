export interface Slide {
  id: string;
  prompt: string;
  description?: string;
}

export interface QAPresentation {
  id: string;
  title: string;
  code: string;
  createdAt: number;
  activeSlideIndex: number;
  status: 'active' | 'ended';
  slides: Slide[];
}

export interface SlideResponse {
  id: string;
  presentationId: string;
  slideId: string;
  content: string;
  upvotes: number;
  createdAt: number;
  isAnswered: boolean;
  isPinned: boolean;
  authorAlias: string;
}

export type Question = SlideResponse;
export type QASession = QAPresentation;

const STORAGE_KEYS = {
  PRESENTATIONS: 'respla_presentations_v5',
  ACTIVE_PRESENTATION_ID: 'respla_active_presentation_id_v5',
  RESPONSES: 'respla_slide_responses_v5',
  USER_VOTES: 'respla_user_votes_v5',
};

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('respla_qa_sync_v5') : null;

let isInitialized = false;
let isPollingStarted = false;
let lastSyncChecksum = '';

export const sessionStore = {
  init() {
    if (isInitialized) return;
    isInitialized = true;

    if (!localStorage.getItem(STORAGE_KEYS.PRESENTATIONS)) {
      localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESPONSES)) {
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_VOTES)) {
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify([]));
    }

    this.syncFromRemote();

    if (!isPollingStarted) {
      isPollingStarted = true;
      setInterval(() => {
        this.syncFromRemote();
      }, 2500);
    }
  },

  notifySync() {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'STATE_CHANGED', timestamp: Date.now() });
    }
    window.dispatchEvent(new Event('respla_state_update'));
  },

  async syncFromRemote() {
    try {
      const resPres = await fetch('/api/sessions');
      let presChanged = false;
      let respChanged = false;

      if (resPres.ok) {
        const remotePres: QAPresentation[] = await resPres.json();
        if (remotePres && Array.isArray(remotePres)) {
          const currentStr = localStorage.getItem(STORAGE_KEYS.PRESENTATIONS) || '[]';
          const remoteStr = JSON.stringify(remotePres);
          if (currentStr !== remoteStr) {
            localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, remoteStr);
            presChanged = true;
          }
        }
      }

      const activeId = this.getActivePresentationId();
      if (activeId) {
        const resResp = await fetch(`/api/questions?presentationId=${activeId}`);
        if (resResp.ok) {
          const remoteResp: SlideResponse[] = await resResp.json();
          if (remoteResp && Array.isArray(remoteResp)) {
            const currentRespStr = localStorage.getItem(STORAGE_KEYS.RESPONSES) || '[]';
            
            // Merge with local votes
            const currentLocal: SlideResponse[] = JSON.parse(currentRespStr);
            const map = new Map<string, SlideResponse>();
            currentLocal.forEach(r => map.set(r.id, r));
            remoteResp.forEach(r => map.set(r.id, r));

            const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
            const newRespStr = JSON.stringify(merged);
            
            if (currentRespStr !== newRespStr) {
              localStorage.setItem(STORAGE_KEYS.RESPONSES, newRespStr);
              respChanged = true;
            }
          }
        }
      }

      if (presChanged || respChanged) {
        this.notifySync();
      }
    } catch {
      // offline
    }
  },

  getPresentations(): QAPresentation[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRESENTATIONS) || '[]');
    } catch {
      return [];
    }
  },

  getActivePresentationId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PRESENTATION_ID) || '';
  },

  setActivePresentationId(id: string) {
    if (!id) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PRESENTATION_ID, id);
    this.notifySync();
    this.syncFromRemote();
  },

  getActivePresentation(): QAPresentation | undefined {
    const activeId = this.getActivePresentationId();
    const presentations = this.getPresentations();
    if (!presentations || presentations.length === 0) return undefined;
    return presentations.find(p => p.id === activeId || p.code === activeId) || presentations[0];
  },

  createPresentation(title: string, slides: { prompt: string; description?: string }[], customCode?: string): QAPresentation {
    const list = this.getPresentations();
    const code = customCode?.trim().toUpperCase() || 'JEA-' + Math.floor(1000 + Math.random() * 9000);
    
    const formattedSlides: Slide[] = slides.map((s, idx) => ({
      id: 'slide-' + Date.now() + '-' + idx,
      prompt: s.prompt.trim(),
      description: s.description?.trim()
    }));

    const newPres: QAPresentation = {
      id: 'pres-' + Date.now(),
      title: title.trim(),
      code,
      createdAt: Date.now(),
      activeSlideIndex: 0,
      status: 'active',
      slides: formattedSlides.length > 0 ? formattedSlides : [
        {
          id: 'slide-' + Date.now(),
          prompt: '¿Qué preguntas o comentarios tienes para esta sesión?',
          description: 'Escribe de forma anónima desde tu celular'
        }
      ]
    };

    list.unshift(newPres);
    localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PRESENTATION_ID, newPres.id);
    this.notifySync();

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPres)
    }).catch(() => {});

    return newPres;
  },

  setActiveSlideIndex(presentationId: string, index: number) {
    const list = this.getPresentations();
    const pIndex = list.findIndex(p => p.id === presentationId);
    if (pIndex !== -1) {
      list[pIndex].activeSlideIndex = index;
      localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, JSON.stringify(list));
      this.notifySync();

      fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: presentationId, activeSlideIndex: index })
      }).catch(() => {});
    }
  },

  endPresentation(presentationId: string) {
    const list = this.getPresentations();
    const pIndex = list.findIndex(p => p.id === presentationId);
    if (pIndex !== -1) {
      list[pIndex].status = 'ended';
      localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, JSON.stringify(list));
      this.notifySync();

      fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: presentationId, status: 'ended' })
      }).catch(() => {});
    }
  },

  addSlide(presentationId: string, prompt: string, description?: string) {
    const list = this.getPresentations();
    const pIndex = list.findIndex(p => p.id === presentationId);
    if (pIndex !== -1) {
      const newSlide: Slide = {
        id: 'slide-' + Date.now(),
        prompt: prompt.trim(),
        description: description?.trim()
      };
      list[pIndex].slides.push(newSlide);
      localStorage.setItem(STORAGE_KEYS.PRESENTATIONS, JSON.stringify(list));
      this.notifySync();

      fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: presentationId, slides: list[pIndex].slides })
      }).catch(() => {});
    }
  },

  // Slide Responses
  getResponses(presentationId: string, slideId?: string): SlideResponse[] {
    try {
      const all: SlideResponse[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESPONSES) || '[]');
      return all.filter(r => r.presentationId === presentationId && (!slideId || r.slideId === slideId));
    } catch {
      return [];
    }
  },

  addResponse(presentationId: string, slideId: string, content: string, authorAlias: string = 'Anónimo'): SlideResponse {
    const all = this.getAllResponsesRaw();
    const newResp: SlideResponse = {
      id: 'resp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      presentationId,
      slideId: slideId || '',
      content: content.trim(),
      upvotes: 1,
      createdAt: Date.now(),
      isAnswered: false,
      isPinned: false,
      authorAlias: authorAlias.trim() || 'Anónimo',
    };
    all.unshift(newResp);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(all));
    this.registerUserVote(newResp.id);
    this.notifySync();

    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResp)
    }).then(() => {
      this.syncFromRemote();
    }).catch(() => {});

    return newResp;
  },

  getAllResponsesRaw(): SlideResponse[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESPONSES) || '[]');
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

  registerUserVote(responseId: string) {
    const votes = this.getUserVotes();
    if (!votes.includes(responseId)) {
      votes.push(responseId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(votes));
    }
  },

  toggleUpvote(responseId: string) {
    const all = this.getAllResponsesRaw();
    const index = all.findIndex(r => r.id === responseId);
    if (index === -1) return;

    const userVotes = this.getUserVotes();
    const hasVoted = userVotes.includes(responseId);
    const delta = hasVoted ? -1 : 1;

    if (hasVoted) {
      all[index].upvotes = Math.max(0, all[index].upvotes - 1);
      const newVotes = userVotes.filter(id => id !== responseId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(newVotes));
    } else {
      all[index].upvotes += 1;
      userVotes.push(responseId);
      localStorage.setItem(STORAGE_KEYS.USER_VOTES, JSON.stringify(userVotes));
    }

    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(all));
    this.notifySync();

    fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: responseId, action: 'upvote', delta })
    }).catch(() => {});
  },

  toggleAnswered(responseId: string) {
    const all = this.getAllResponsesRaw();
    const index = all.findIndex(r => r.id === responseId);
    if (index !== -1) {
      all[index].isAnswered = !all[index].isAnswered;
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(all));
      this.notifySync();

      fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: responseId, action: 'toggleAnswered' })
      }).catch(() => {});
    }
  },

  togglePinned(responseId: string) {
    const all = this.getAllResponsesRaw();
    const index = all.findIndex(r => r.id === responseId);
    if (index !== -1) {
      all[index].isPinned = !all[index].isPinned;
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(all));
      this.notifySync();

      fetch('/api/questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: responseId, action: 'togglePinned' })
      }).catch(() => {});
    }
  },

  deleteResponse(responseId: string) {
    let all = this.getAllResponsesRaw();
    all = all.filter(r => r.id !== responseId);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(all));
    this.notifySync();

    fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: responseId })
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
