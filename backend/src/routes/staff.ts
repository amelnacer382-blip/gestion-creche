import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const staffRouter = Router();

// GET all staff
staffRouter.get('/', (_req: Request, res: Response) => {
  const staff = db.prepare(`
    SELECT 
      st.*,
      s.name as section_name,
      s.color as section_color
    FROM staff st
    LEFT JOIN sections s ON st.section_id = s.id
    ORDER BY st.is_on_duty DESC, st.section_id ASC, st.last_name ASC
  `).all();
  res.json(staff);
});

// Toggle duty status
staffRouter.put('/:id/duty', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const current = db.prepare(`SELECT is_on_duty FROM staff WHERE id = ?`).get<{ is_on_duty: number }>(id);

  if (!current) {
    return res.status(404).json({ error: 'Personnel non trouvé' });
  }

  const newStatus = current.is_on_duty ? 0 : 1;
  db.prepare(`UPDATE staff SET is_on_duty = ? WHERE id = ?`).run(newStatus, id);

  const updated = db.prepare(`SELECT * FROM staff WHERE id = ?`).get(id);
  res.json(updated);
});

// POST new staff
staffRouter.post('/', (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    role,
    qualification_level,
    section_id,
    phone,
    email,
    shift_start,
    shift_end,
    is_on_duty
  } = req.body;

  if (!first_name || !last_name || !role || !qualification_level) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  db.prepare(`
    INSERT INTO staff (
      first_name, last_name, role, qualification_level, section_id, phone, email, shift_start, shift_end, is_on_duty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    first_name,
    last_name,
    role,
    qualification_level,
    section_id ? Number(section_id) : null,
    phone || null,
    email || null,
    shift_start || '08:00',
    shift_end || '17:00',
    is_on_duty !== undefined ? (is_on_duty ? 1 : 0) : 1
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get() as { id: number };
  const created = db.prepare(`SELECT * FROM staff WHERE id = ?`).get(lastId.id);
  res.status(201).json(created);
});

// GET Legal Ratios Calculation
staffRouter.get('/ratios', (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const sections = db.prepare(`SELECT * FROM sections ORDER BY age_min_months ASC`).all<{
    id: number;
    name: string;
    description: string;
    age_min_months: number;
    age_max_months: number;
    color: string;
    capacity: number;
    legal_ratio_standard: string;
  }>();

  const ratios = sections.map((sec) => {
    // Count currently present children in this section
    const presentRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance a
      JOIN children c ON a.child_id = c.id
      WHERE a.date = ? AND c.section_id = ? AND a.status = 'present'
    `).get<{ count: number }>(today, sec.id);

    const presentChildren = presentRow?.count || 0;

    // Count on-duty staff assigned to this section
    const staffRow = db.prepare(`
      SELECT COUNT(*) as count
      FROM staff
      WHERE section_id = ? AND is_on_duty = 1
    `).get<{ count: number }>(sec.id);

    const onDutyStaff = staffRow?.count || 0;

    // Standard rule: Bébés = 1 pour 5, Moyens/Grands = 1 pour 8
    const maxChildrenPerStaff = sec.age_min_months < 12 ? 5 : 8;
    const requiredStaff = presentChildren > 0 ? Math.ceil(presentChildren / maxChildrenPerStaff) : 1;

    let compliance: 'compliant' | 'warning' | 'alert' = 'compliant';
    let message = 'Effectif conforme à la législation';

    if (onDutyStaff === 0 && presentChildren > 0) {
      compliance = 'alert';
      message = 'Attention : Aucun personnel encadrant en poste pour cette section !';
    } else if (onDutyStaff > 0) {
      const currentRatio = presentChildren / onDutyStaff;
      if (currentRatio > maxChildrenPerStaff) {
        compliance = 'alert';
        message = `Sous-effectif critique : 1 encadrant pour ${currentRatio.toFixed(1)} enfants (maximum légal: 1 pour ${maxChildrenPerStaff})`;
      } else if (currentRatio === maxChildrenPerStaff) {
        compliance = 'warning';
        message = `Capacité maximale atteinte (1 pour ${maxChildrenPerStaff}). Prudence en cas de nouvelle arrivée.`;
      } else {
        compliance = 'compliant';
        message = `Taux d'encadrement optimal : 1 encadrant pour ${(currentRatio).toFixed(1)} enfants`;
      }
    }

    return {
      section_id: sec.id,
      section_name: sec.name,
      section_color: sec.color,
      legal_rule: sec.legal_ratio_standard,
      max_children_per_pro: maxChildrenPerStaff,
      present_children: presentChildren,
      on_duty_staff: onDutyStaff,
      required_staff: requiredStaff,
      compliance,
      message,
      capacity: sec.capacity
    };
  });

  // Global totals
  const totalPresent = ratios.reduce((sum, r) => sum + r.present_children, 0);
  const totalStaffOnDuty = db.prepare(`SELECT COUNT(*) as count FROM staff WHERE is_on_duty = 1`).get<{ count: number }>()?.count || 0;

  res.json({
    date: today,
    total_present_children: totalPresent,
    total_staff_on_duty: totalStaffOnDuty,
    sections: ratios
  });
});
