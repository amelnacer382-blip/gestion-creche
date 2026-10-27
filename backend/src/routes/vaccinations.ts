import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const vaccinationsRouter = Router();

// GET vaccinations for a child
vaccinationsRouter.get('/child/:childId', (req: Request, res: Response) => {
  const childId = Number(req.params.childId);
  const vaccines = db.prepare(`
    SELECT * FROM vaccinations 
    WHERE child_id = ? 
    ORDER BY is_mandatory DESC, vaccine_name ASC
  `).all(childId);
  res.json(vaccines);
});

// PUT update vaccination status
vaccinationsRouter.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status, administered_at, next_due_date } = req.body;

  db.prepare(`
    UPDATE vaccinations SET
      status = COALESCE(?, status),
      administered_at = COALESCE(?, administered_at),
      next_due_date = COALESCE(?, next_due_date)
    WHERE id = ?
  `).run(status ?? null, administered_at ?? null, next_due_date ?? null, id);

  const updated = db.prepare(`SELECT * FROM vaccinations WHERE id = ?`).get(id);
  res.json(updated);
});
