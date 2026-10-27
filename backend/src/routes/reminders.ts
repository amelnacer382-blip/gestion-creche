import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const remindersRouter = Router();

// GET all reminders with filters
remindersRouter.get('/', (req: Request, res: Response) => {
  const { child_id, status, category } = req.query;

  let sql = `
    SELECT 
      r.*,
      c.first_name,
      c.last_name,
      c.avatar_emoji,
      c.section_id,
      s.name as section_name,
      s.color as section_color
    FROM reminders r
    JOIN children c ON r.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (child_id) {
    sql += ` AND r.child_id = ?`;
    params.push(Number(child_id));
  }

  if (status && typeof status === 'string') {
    sql += ` AND r.status = ?`;
    params.push(status);
  }

  if (category && typeof category === 'string') {
    sql += ` AND r.category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY 
    CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
    CASE WHEN r.priority = 'urgent' THEN 0 WHEN r.priority = 'important' THEN 1 ELSE 2 END,
    r.due_date ASC, 
    r.id DESC`;

  const reminders = db.prepare(sql).all(params);
  res.json(reminders);
});

// POST new reminder
remindersRouter.post('/', (req: Request, res: Response) => {
  const { child_id, title, description, category, priority, due_date, created_by } = req.body;

  if (!child_id || !title) {
    return res.status(400).json({ error: 'child_id et title sont requis' });
  }

  db.prepare(`
    INSERT INTO reminders (child_id, title, description, category, priority, due_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    Number(child_id),
    title,
    description || null,
    category || 'fourniture',
    priority || 'normal',
    due_date || null,
    created_by || 'Équipe crèche'
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const created = db.prepare(`SELECT * FROM reminders WHERE id = ?`).get(lastId?.id || 1);
  res.status(201).json(created);
});

// PUT update reminder status (resolve / reopen)
remindersRouter.put('/:id/status', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const current = db.prepare(`SELECT status FROM reminders WHERE id = ?`).get<{ status: string }>(id);

  if (!current) {
    return res.status(404).json({ error: 'Rappel non trouvé' });
  }

  const nextStatus = current.status === 'pending' ? 'resolved' : 'pending';
  const today = new Date().toISOString().split('T')[0];
  const resolvedAt = nextStatus === 'resolved' ? today : null;

  db.prepare(`
    UPDATE reminders SET status = ?, resolved_at = ? WHERE id = ?
  `).run(nextStatus, resolvedAt, id);

  const updated = db.prepare(`SELECT * FROM reminders WHERE id = ?`).get(id);
  res.json(updated);
});

// DELETE reminder
remindersRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.prepare(`DELETE FROM reminders WHERE id = ?`).run(id);
  res.json({ success: true });
});
