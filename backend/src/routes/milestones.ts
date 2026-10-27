import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const milestonesRouter = Router();

// GET milestones for a child
milestonesRouter.get('/child/:childId', (req: Request, res: Response) => {
  const childId = Number(req.params.childId);
  const milestones = db.prepare(`
    SELECT * FROM development_milestones 
    WHERE child_id = ? 
    ORDER BY domain ASC, achieved_at DESC
  `).all(childId);
  res.json(milestones);
});

// POST new milestone
milestonesRouter.post('/', (req: Request, res: Response) => {
  const { child_id, domain, milestone_title, status, achieved_at, educator_notes } = req.body;

  if (!child_id || !domain || !milestone_title) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO development_milestones (child_id, domain, milestone_title, status, achieved_at, educator_notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    Number(child_id),
    domain,
    milestone_title,
    status || 'en_cours',
    status === 'acquis' ? (achieved_at || today) : null,
    educator_notes || null
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const created = db.prepare(`SELECT * FROM development_milestones WHERE id = ?`).get(lastId?.id || 1);
  res.status(201).json(created);
});

// PUT update milestone
milestonesRouter.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status, achieved_at, educator_notes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE development_milestones SET
      status = COALESCE(?, status),
      achieved_at = COALESCE(?, CASE WHEN ? = 'acquis' THEN ? ELSE achieved_at END),
      educator_notes = COALESCE(?, educator_notes)
    WHERE id = ?
  `).run(
    status ?? null,
    achieved_at ?? null,
    status ?? null,
    today,
    educator_notes ?? null,
    id
  );

  const updated = db.prepare(`SELECT * FROM development_milestones WHERE id = ?`).get(id);
  res.json(updated);
});
