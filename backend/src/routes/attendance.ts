import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const attendanceRouter = Router();

// GET attendance list for a specific date
attendanceRouter.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  // Make sure every active child has a record for this date
  const activeChildren = db.prepare(`SELECT id FROM children WHERE status = 'active'`).all<{ id: number }>();
  const ensureStmt = db.prepare(`
    INSERT OR IGNORE INTO attendance (child_id, date, scheduled_arrival, scheduled_departure, status)
    VALUES (?, ?, '08:30', '17:30', 'expected')
  `);

  for (const c of activeChildren) {
    ensureStmt.run(c.id, date);
  }

  const records = db.prepare(`
    SELECT 
      a.*,
      c.first_name,
      c.last_name,
      c.avatar_emoji,
      c.allergies,
      c.diet,
      c.section_id,
      s.name as section_name,
      s.color as section_color
    FROM attendance a
    JOIN children c ON a.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE a.date = ? AND c.status = 'active'
    ORDER BY s.id ASC, a.status = 'present' DESC, c.last_name ASC
  `).all(date);

  const guardiansStmt = db.prepare(`
    SELECT id, first_name, last_name, relation, phone, is_authorized_pickup, is_emergency_contact 
    FROM guardians 
    WHERE child_id = ?
  `);

  const enriched = records.map((r: Record<string, unknown>) => ({
    ...r,
    guardians: guardiansStmt.all(r.child_id as number)
  }));

  res.json(enriched);
});

// POST Check-in
attendanceRouter.post('/checkin', (req: Request, res: Response) => {
  const { child_id, date, actual_arrival, notes } = req.body;
  if (!child_id) {
    return res.status(400).json({ error: 'child_id est requis' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = actual_arrival || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  db.prepare(`
    INSERT INTO attendance (child_id, date, actual_arrival, status, notes)
    VALUES (?, ?, ?, 'present', ?)
    ON CONFLICT(child_id, date) DO UPDATE SET
      actual_arrival = excluded.actual_arrival,
      status = 'present',
      notes = COALESCE(excluded.notes, attendance.notes)
  `).run(child_id, targetDate, currentTime, notes || null);

  const updated = db.prepare(`SELECT * FROM attendance WHERE child_id = ? AND date = ?`).get(child_id, targetDate);
  res.json({ success: true, attendance: updated });
});

// POST Check-out
attendanceRouter.post('/checkout', (req: Request, res: Response) => {
  const { child_id, date, actual_departure, pickup_by, notes } = req.body;
  if (!child_id) {
    return res.status(400).json({ error: 'child_id est requis' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTime = actual_departure || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  db.prepare(`
    UPDATE attendance SET
      actual_departure = ?,
      status = 'departed',
      pickup_by = COALESCE(?, pickup_by),
      notes = COALESCE(?, notes)
    WHERE child_id = ? AND date = ?
  `).run(currentTime, pickup_by || null, notes || null, child_id, targetDate);

  const updated = db.prepare(`SELECT * FROM attendance WHERE child_id = ? AND date = ?`).get(child_id, targetDate);
  res.json({ success: true, attendance: updated });
});

// POST Absence
attendanceRouter.post('/absence', (req: Request, res: Response) => {
  const { child_id, date, justified, notes } = req.body;
  if (!child_id) {
    return res.status(400).json({ error: 'child_id est requis' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const status = justified ? 'absent_justified' : 'absent_unjustified';

  db.prepare(`
    INSERT INTO attendance (child_id, date, status, notes)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(child_id, date) DO UPDATE SET
      status = excluded.status,
      notes = excluded.notes,
      actual_arrival = NULL,
      actual_departure = NULL
  `).run(child_id, targetDate, status, notes || (justified ? 'Absence justifiée' : 'Absence non justifiée'));

  const updated = db.prepare(`SELECT * FROM attendance WHERE child_id = ? AND date = ?`).get(child_id, targetDate);
  res.json({ success: true, attendance: updated });
});

// Reset status to expected
attendanceRouter.post('/reset', (req: Request, res: Response) => {
  const { child_id, date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE attendance SET
      status = 'expected',
      actual_arrival = NULL,
      actual_departure = NULL,
      pickup_by = NULL
    WHERE child_id = ? AND date = ?
  `).run(child_id, targetDate);

  const updated = db.prepare(`SELECT * FROM attendance WHERE child_id = ? AND date = ?`).get(child_id, targetDate);
  res.json({ success: true, attendance: updated });
});
