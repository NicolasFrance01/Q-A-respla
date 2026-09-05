import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool, initDb } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initDb();

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM sessions ORDER BY created_at DESC');
      const sessions = result.rows.map(r => ({
        id: r.id,
        title: r.title,
        code: r.code,
        createdAt: Number(r.created_at),
        isAcceptingQuestions: r.is_accepting_questions,
        spotlightQuestionId: r.spotlight_question_id
      }));
      return res.status(200).json(sessions);
    }

    if (req.method === 'POST') {
      const { id, title, code, createdAt, isAcceptingQuestions, spotlightQuestionId } = req.body;
      await pool.query(
        'INSERT INTO sessions (id, title, code, created_at, is_accepting_questions, spotlight_question_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, title, code, createdAt || Date.now(), isAcceptingQuestions ?? true, spotlightQuestionId || null]
      );
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PATCH') {
      const { id, isAcceptingQuestions, spotlightQuestionId } = req.body;
      if (isAcceptingQuestions !== undefined) {
        await pool.query('UPDATE sessions SET is_accepting_questions = $1 WHERE id = $2', [isAcceptingQuestions, id]);
      }
      if (spotlightQuestionId !== undefined) {
        await pool.query('UPDATE sessions SET spotlight_question_id = $1 WHERE id = $2', [spotlightQuestionId, id]);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Sessions API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
