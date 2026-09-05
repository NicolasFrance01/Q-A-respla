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
      const result = await pool.query('SELECT * FROM presentations ORDER BY created_at DESC');
      const presentations = result.rows.map(r => ({
        id: r.id,
        title: r.title,
        code: r.code,
        createdAt: Number(r.created_at),
        activeSlideIndex: r.active_slide_index ?? 0,
        status: r.status || 'active',
        slides: typeof r.slides === 'string' ? JSON.parse(r.slides) : r.slides
      }));
      return res.status(200).json(presentations);
    }

    if (req.method === 'POST') {
      const { id, title, code, createdAt, activeSlideIndex, status, slides } = req.body;
      await pool.query(
        'INSERT INTO presentations (id, title, code, created_at, active_slide_index, status, slides) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, title, code, createdAt || Date.now(), activeSlideIndex || 0, status || 'active', JSON.stringify(slides || [])]
      );
      return res.status(201).json({ success: true });
    }

    if (req.method === 'PATCH') {
      const { id, activeSlideIndex, status, slides } = req.body;
      if (activeSlideIndex !== undefined) {
        await pool.query('UPDATE presentations SET active_slide_index = $1 WHERE id = $2', [activeSlideIndex, id]);
      }
      if (status !== undefined) {
        await pool.query('UPDATE presentations SET status = $1 WHERE id = $2', [status, id]);
      }
      if (slides !== undefined) {
        await pool.query('UPDATE presentations SET slides = $1 WHERE id = $2', [JSON.stringify(slides), id]);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Sessions API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
