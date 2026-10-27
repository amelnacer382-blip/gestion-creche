import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const liaisonRouter = Router();

// GET messages for a child
liaisonRouter.get('/child/:childId', (req: Request, res: Response) => {
  const childId = Number(req.params.childId);

  const messages = db.prepare(`
    SELECT l.*, c.first_name, c.last_name, c.avatar_emoji, s.name as section_name
    FROM liaison_messages l
    JOIN children c ON l.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE l.child_id = ?
    ORDER BY l.created_at ASC
  `).all(childId);

  res.json(messages);
});

// GET unread messages count for staff
liaisonRouter.get('/unread', (_req: Request, res: Response) => {
  const unreadRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM liaison_messages 
    WHERE sender_type = 'parent' AND read_by_staff = 0
  `).get<{ count: number }>();

  res.json({ unread_count: unreadRow?.count || 0 });
});

// POST new liaison message
liaisonRouter.post('/', (req: Request, res: Response) => {
  const { child_id, sender_type, sender_name, message, category } = req.body;

  if (!child_id || !message || !sender_name) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const isParent = sender_type === 'parent';

  db.prepare(`
    INSERT INTO liaison_messages (child_id, sender_type, sender_name, message, category, read_by_staff, read_by_parent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(child_id),
    sender_type || 'parent',
    sender_name,
    message,
    category || 'autre',
    isParent ? 0 : 1,
    isParent ? 1 : 0
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const created = db.prepare(`SELECT * FROM liaison_messages WHERE id = ?`).get(lastId?.id || 1);
  res.status(201).json(created);
});

// PUT mark as read
liaisonRouter.put('/:id/read', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare(`UPDATE liaison_messages SET read_by_staff = 1 WHERE id = ?`).run(id);
  const updated = db.prepare(`SELECT * FROM liaison_messages WHERE id = ?`).get(id);
  res.json(updated);
});
