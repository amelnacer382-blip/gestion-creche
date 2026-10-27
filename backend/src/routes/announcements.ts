import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const announcementsRouter = Router();

// GET announcements
announcementsRouter.get('/', (_req: Request, res: Response) => {
  const announcements = db.prepare(`
    SELECT 
      a.*,
      s.name as target_section_name,
      s.color as target_section_color
    FROM announcements a
    LEFT JOIN sections s ON a.target_section_id = s.id
    ORDER BY a.pinned DESC, a.created_at DESC
  `).all();
  res.json(announcements);
});

// POST new announcement
announcementsRouter.post('/', (req: Request, res: Response) => {
  const { title, content, priority, target_section_id, author, pinned } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }

  db.prepare(`
    INSERT INTO announcements (title, content, priority, target_section_id, author, pinned)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    content,
    priority || 'info',
    target_section_id ? Number(target_section_id) : null,
    author || 'Direction',
    pinned ? 1 : 0
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const created = db.prepare(`SELECT * FROM announcements WHERE id = ?`).get(lastId?.id || 1);
  res.status(201).json(created);
});

// DELETE announcement
announcementsRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare(`DELETE FROM announcements WHERE id = ?`).run(id);
  res.json({ success: true });
});
