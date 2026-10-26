import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const sectionsRouter = Router();

sectionsRouter.get('/', (_req: Request, res: Response) => {
  const sections = db.prepare(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM children c WHERE c.section_id = s.id AND c.status = 'active') as enrolled_count
    FROM sections s
    ORDER BY s.age_min_months ASC
  `).all();
  res.json(sections);
});
