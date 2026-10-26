import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const statsRouter = Router();

statsRouter.get('/dashboard', (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const enrolledRow = db.prepare(`SELECT COUNT(*) as count FROM children WHERE status = 'active'`).get<{ count: number }>();
  const totalEnrolled = enrolledRow?.count || 0;

  const attendanceRows = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM attendance 
    WHERE date = ? 
    GROUP BY status
  `).all<{ status: string; count: number }>(today);

  const attendanceMap: Record<string, number> = {
    present: 0,
    expected: 0,
    departed: 0,
    absent_justified: 0,
    absent_unjustified: 0
  };

  for (const r of attendanceRows) {
    attendanceMap[r.status] = r.count;
  }

  const staffOnDutyRow = db.prepare(`SELECT COUNT(*) as count FROM staff WHERE is_on_duty = 1`).get<{ count: number }>();
  const staffTotalRow = db.prepare(`SELECT COUNT(*) as count FROM staff`).get<{ count: number }>();

  // Medical alerts for children present today
  const medicalAlerts = db.prepare(`
    SELECT c.id, c.first_name, c.last_name, c.avatar_emoji, c.allergies, c.diet, c.medical_notes, s.name as section_name
    FROM attendance a
    JOIN children c ON a.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE a.date = ? AND a.status = 'present' AND (
      (c.allergies IS NOT NULL AND c.allergies != 'Aucune' AND c.allergies != '') OR
      (c.medical_notes IS NOT NULL AND c.medical_notes != '')
    )
  `).all(today);

  // Invoices summary
  const currentMonth = today.substring(0, 7);
  const pendingInvoicesRow = db.prepare(`
    SELECT SUM(total_due) as total, COUNT(*) as count
    FROM invoices
    WHERE status = 'pending'
  `).get<{ total: number | null; count: number }>();

  const paidInvoicesRow = db.prepare(`
    SELECT SUM(total_due) as total, COUNT(*) as count
    FROM invoices
    WHERE status = 'paid' AND month = ?
  `).get<{ total: number | null; count: number }>(currentMonth);

  // Sections occupancy
  const sectionsOccupancy = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.color,
      s.capacity,
      (
        SELECT COUNT(*) 
        FROM attendance a 
        JOIN children c ON a.child_id = c.id 
        WHERE a.date = ? AND c.section_id = s.id AND a.status = 'present'
      ) as present_count,
      (
        SELECT COUNT(*)
        FROM staff st
        WHERE st.section_id = s.id AND st.is_on_duty = 1
      ) as staff_count
    FROM sections s
  `).all(today);

  res.json({
    date: today,
    enrolled_children: totalEnrolled,
    attendance: {
      present: attendanceMap.present,
      expected: attendanceMap.expected,
      departed: attendanceMap.departed,
      absent: attendanceMap.absent_justified + attendanceMap.absent_unjustified,
      absent_justified: attendanceMap.absent_justified,
      absent_unjustified: attendanceMap.absent_unjustified
    },
    staff: {
      on_duty: staffOnDutyRow?.count || 0,
      total: staffTotalRow?.count || 0
    },
    financial: {
      pending_amount: pendingInvoicesRow?.total || 0,
      pending_count: pendingInvoicesRow?.count || 0,
      collected_this_month: paidInvoicesRow?.total || 0
    },
    medical_alerts: medicalAlerts,
    sections: sectionsOccupancy
  });
});
