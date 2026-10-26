import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const dailyLogsRouter = Router();

// GET all logs for a given date
dailyLogsRouter.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const logs = db.prepare(`
    SELECT 
      l.*,
      c.first_name,
      c.last_name,
      c.avatar_emoji,
      c.allergies,
      c.diet,
      c.section_id,
      s.name as section_name,
      s.color as section_color
    FROM daily_logs l
    JOIN children c ON l.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE l.date = ?
    ORDER BY s.id ASC, c.last_name ASC
  `).all(date);

  res.json(logs);
});

// GET single child's log for date
dailyLogsRouter.get('/child/:childId', (req: Request, res: Response) => {
  const childId = Number(req.params.childId);
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const log = db.prepare(`
    SELECT l.*, c.first_name, c.last_name, c.avatar_emoji, s.name as section_name
    FROM daily_logs l
    JOIN children c ON l.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE l.child_id = ? AND l.date = ?
  `).get(childId, date);

  res.json(log || null);
});

// POST upsert daily log
dailyLogsRouter.post('/', (req: Request, res: Response) => {
  const {
    child_id,
    date,
    mood,
    meals_summary,
    naps_summary,
    hygiene_summary,
    activities,
    observations,
    logged_by
  } = req.body;

  if (!child_id) {
    return res.status(400).json({ error: 'child_id est requis' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO daily_logs (
      child_id, date, mood, meals_summary, naps_summary, hygiene_summary, activities, observations, logged_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(child_id, date) DO UPDATE SET
      mood = excluded.mood,
      meals_summary = excluded.meals_summary,
      naps_summary = excluded.naps_summary,
      hygiene_summary = excluded.hygiene_summary,
      activities = excluded.activities,
      observations = excluded.observations,
      logged_by = excluded.logged_by
  `).run(
    Number(child_id),
    targetDate,
    mood || 'Très joyeux',
    meals_summary || null,
    naps_summary || null,
    hygiene_summary || null,
    activities || null,
    observations || null,
    logged_by || 'Équipe pédagogique'
  );

  const updated = db.prepare(`SELECT * FROM daily_logs WHERE child_id = ? AND date = ?`).get(child_id, targetDate);
  res.status(200).json(updated);
});
