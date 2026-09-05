import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool, initDb } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initDb();

    if (req.method === 'GET') {
      const sessionId = req.query.sessionId as string;
      let query = 'SELECT * FROM questions';
      const params: any[] = [];

      if (sessionId) {
        query += ' WHERE session_id = $1';
        params.push(sessionId);
      }
      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      const questions = result.rows.map(r => ({
        id: r.id,
        sessionId: r.session_id,
        content: r.content,
        upvotes: r.upvotes,
        createdAt: Number(r.created_at),
        isAnswered: r.is_answered,
        isPinned: r.is_pinned,
        authorAlias: r.author_alias
      }));
      return res.status(200).json(questions);
    }

    if (req.method === 'POST') {
      const { id, sessionId, content, upvotes, createdAt, isAnswered, isPinned, authorAlias } = req.body;
      await pool.query(
        'INSERT INTO questions (id, session_id, content, upvotes, created_at, is_answered, is_pinned, author_alias) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, sessionId, content, upvotes || 1, createdAt || Date.now(), isAnswered || false, isPinned || false, authorAlias || 'Anónimo']
      );
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PATCH') {
      const { id, action } = req.body;
      if (action === 'upvote') {
        const delta = req.body.delta || 1;
        await pool.query('UPDATE questions SET upvotes = GREATEST(0, upvotes + $1) WHERE id = $2', [delta, id]);
      } else if (action === 'toggleAnswered') {
        await pool.query('UPDATE questions SET is_answered = NOT is_answered WHERE id = $1', [id]);
      } else if (action === 'togglePinned') {
        await pool.query('UPDATE questions SET is_pinned = NOT is_pinned WHERE id = $1', [id]);
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id, sessionId } = req.body || req.query;
      if (id) {
        await pool.query('DELETE FROM questions WHERE id = $1', [id]);
      } else if (sessionId) {
        await pool.query('DELETE FROM questions WHERE session_id = $1', [sessionId]);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Questions API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
