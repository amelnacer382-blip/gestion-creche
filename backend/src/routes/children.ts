import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const childrenRouter = Router();

interface ChildListItem {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  section_id: number;
  avatar_emoji: string;
  blood_group: string | null;
  allergies: string;
  diet: string;
  medical_notes: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  status: string;
  contract_hours_per_week: number;
  hourly_rate: number;
  section_name: string;
  section_color: string;
  legal_ratio_standard: string;
  today_status: string | null;
  today_arrival: string | null;
  today_departure: string | null;
}

// GET all children
childrenRouter.get('/', (req: Request, res: Response) => {
  const { section_id, search } = req.query;
  const today = new Date().toISOString().split('T')[0];

  let sql = `
    SELECT 
      c.*,
      s.name as section_name,
      s.color as section_color,
      s.legal_ratio_standard,
      a.status as today_status,
      a.actual_arrival as today_arrival,
      a.actual_departure as today_departure
    FROM children c
    LEFT JOIN sections s ON c.section_id = s.id
    LEFT JOIN attendance a ON c.id = a.child_id AND a.date = ?
    WHERE c.status = 'active'
  `;
  const params: (string | number)[] = [today];

  if (section_id) {
    sql += ` AND c.section_id = ?`;
    params.push(Number(section_id));
  }

  if (search && typeof search === 'string') {
    sql += ` AND (c.first_name LIKE ? OR c.last_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY s.id ASC, c.last_name ASC, c.first_name ASC`;

  const children = db.prepare(sql).all<ChildListItem>(params);

  // Fetch guardians for each
  const guardiansStmt = db.prepare(`SELECT * FROM guardians WHERE child_id = ?`);
  const result = children.map((ch) => ({
    ...ch,
    guardians: guardiansStmt.all(ch.id)
  }));

  res.json(result);
});

// GET single child by id
childrenRouter.get('/:id', (req: Request, res: Response) => {
  const childId = Number(req.params.id);
  const today = new Date().toISOString().split('T')[0];

  const child = db.prepare(`
    SELECT 
      c.*,
      s.name as section_name,
      s.color as section_color,
      s.legal_ratio_standard
    FROM children c
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE c.id = ?
  `).get<ChildListItem>(childId);

  if (!child) {
    return res.status(404).json({ error: 'Enfant non trouvé' });
  }

  const guardians = db.prepare(`SELECT * FROM guardians WHERE child_id = ?`).all(childId);
  const todayAttendance = db.prepare(`SELECT * FROM attendance WHERE child_id = ? AND date = ?`).get(childId, today);
  const recentLogs = db.prepare(`SELECT * FROM daily_logs WHERE child_id = ? ORDER BY date DESC LIMIT 7`).all(childId);
  const recentInvoices = db.prepare(`SELECT * FROM invoices WHERE child_id = ? ORDER BY month DESC LIMIT 6`).all(childId);

  res.json({
    ...child,
    guardians,
    today_attendance: todayAttendance,
    recent_logs: recentLogs,
    recent_invoices: recentInvoices
  });
});

// POST new child
childrenRouter.post('/', (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    section_id,
    avatar_emoji,
    blood_group,
    allergies,
    diet,
    medical_notes,
    doctor_name,
    doctor_phone,
    contract_hours_per_week,
    hourly_rate,
    guardians
  } = req.body;

  if (!first_name || !last_name || !birth_date || !gender || !section_id) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const insert = db.prepare(`
    INSERT INTO children (
      first_name, last_name, birth_date, gender, section_id, avatar_emoji,
      blood_group, allergies, diet, medical_notes, doctor_name, doctor_phone,
      contract_hours_per_week, hourly_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    first_name,
    last_name,
    birth_date,
    gender,
    Number(section_id),
    avatar_emoji || '👶',
    blood_group || null,
    allergies || 'Aucune',
    diet || 'Standard',
    medical_notes || null,
    doctor_name || null,
    doctor_phone || null,
    contract_hours_per_week ? Number(contract_hours_per_week) : 35,
    hourly_rate ? Number(hourly_rate) : 7.50
  );

  const lastIdRow = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const newChildId = lastIdRow?.id ?? 0;

  if (Array.isArray(guardians)) {
    const insertGuard = db.prepare(`
      INSERT INTO guardians (child_id, first_name, last_name, relation, phone, email, address, is_emergency_contact, is_authorized_pickup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const g of guardians) {
      insertGuard.run(
        newChildId,
        g.first_name || '',
        g.last_name || '',
        g.relation || 'Parent',
        g.phone || '',
        g.email || '',
        g.address || '',
        g.is_emergency_contact !== undefined ? (g.is_emergency_contact ? 1 : 0) : 1,
        g.is_authorized_pickup !== undefined ? (g.is_authorized_pickup ? 1 : 0) : 1
      );
    }
  }

  // Create attendance row for today if none exists
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT OR IGNORE INTO attendance (child_id, date, scheduled_arrival, scheduled_departure, status)
    VALUES (?, ?, '08:30', '17:30', 'expected')
  `).run(newChildId, today);

  const created = db.prepare(`SELECT * FROM children WHERE id = ?`).get(newChildId);
  res.status(201).json(created);
});

// PUT update child
childrenRouter.put('/:id', (req: Request, res: Response) => {
  const childId = Number(req.params.id);
  const {
    first_name,
    last_name,
    birth_date,
    gender,
    section_id,
    avatar_emoji,
    blood_group,
    allergies,
    diet,
    medical_notes,
    doctor_name,
    doctor_phone,
    status,
    contract_hours_per_week,
    hourly_rate
  } = req.body;

  db.prepare(`
    UPDATE children SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      birth_date = COALESCE(?, birth_date),
      gender = COALESCE(?, gender),
      section_id = COALESCE(?, section_id),
      avatar_emoji = COALESCE(?, avatar_emoji),
      blood_group = COALESCE(?, blood_group),
      allergies = COALESCE(?, allergies),
      diet = COALESCE(?, diet),
      medical_notes = COALESCE(?, medical_notes),
      doctor_name = COALESCE(?, doctor_name),
      doctor_phone = COALESCE(?, doctor_phone),
      status = COALESCE(?, status),
      contract_hours_per_week = COALESCE(?, contract_hours_per_week),
      hourly_rate = COALESCE(?, hourly_rate)
    WHERE id = ?
  `).run(
    first_name ?? null,
    last_name ?? null,
    birth_date ?? null,
    gender ?? null,
    section_id ? Number(section_id) : null,
    avatar_emoji ?? null,
    blood_group ?? null,
    allergies ?? null,
    diet ?? null,
    medical_notes ?? null,
    doctor_name ?? null,
    doctor_phone ?? null,
    status ?? null,
    contract_hours_per_week ? Number(contract_hours_per_week) : null,
    hourly_rate ? Number(hourly_rate) : null,
    childId
  );

  const updated = db.prepare(`SELECT * FROM children WHERE id = ?`).get(childId);
  res.json(updated);
});

// DELETE child
childrenRouter.delete('/:id', (req: Request, res: Response) => {
  const childId = Number(req.params.id);
  db.prepare(`DELETE FROM children WHERE id = ?`).run(childId);
  res.json({ success: true, message: 'Enfant supprimé avec succès' });
});
