import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const feedRouter = Router();

// GET feed
feedRouter.get('/', (req: Request, res: Response) => {
  const { section_id } = req.query;

  let sql = `
    SELECT 
      f.*,
      s.name as section_name,
      s.color as section_color
    FROM activities_feed f
    LEFT JOIN sections s ON f.section_id = s.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (section_id) {
    sql += ` AND f.section_id = ?`;
    params.push(Number(section_id));
  }

  sql += ` ORDER BY f.created_at DESC, f.id DESC`;

  const activities = db.prepare(sql).all(params);
  res.json(activities);
});

// POST new activity moment
feedRouter.post('/', (req: Request, res: Response) => {
  const { title, caption, section_id, author_name, category, photo_emoji } = req.body;

  if (!title || !caption) {
    return res.status(400).json({ error: 'Titre et légende requis' });
  }

  db.prepare(`
    INSERT INTO activities_feed (title, caption, section_id, author_name, category, photo_emoji)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    caption,
    section_id ? Number(section_id) : null,
    author_name || 'Équipe pédagogique',
    category || 'eveil',
    photo_emoji || '🎨'
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const created = db.prepare(`SELECT * FROM activities_feed WHERE id = ?`).get(lastId?.id || 1);
  res.status(201).json(created);
});

// POST like an activity
feedRouter.post('/:id/like', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare(`UPDATE activities_feed SET likes_count = likes_count + 1 WHERE id = ?`).run(id);
  const updated = db.prepare(`SELECT * FROM activities_feed WHERE id = ?`).get(id);
  res.json(updated);
});
