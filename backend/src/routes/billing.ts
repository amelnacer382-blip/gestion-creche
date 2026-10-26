import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const billingRouter = Router();

interface InvoiceRecord {
  id: number;
  invoice_number: string;
  child_id: number;
  month: string;
  contract_hours: number;
  actual_hours: number;
  overtime_hours: number;
  hourly_rate: number;
  meal_count: number;
  meal_unit_price: number;
  total_contract_amount: number;
  total_overtime_amount: number;
  total_meals_amount: number;
  total_due: number;
  status: string;
  issued_at: string;
  paid_at: string | null;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  avatar_emoji?: string;
  section_name?: string;
}

// GET all invoices
billingRouter.get('/', (req: Request, res: Response) => {
  const { month, status } = req.query;

  let sql = `
    SELECT 
      i.*,
      c.first_name,
      c.last_name,
      c.avatar_emoji,
      c.section_id,
      s.name as section_name,
      s.color as section_color
    FROM invoices i
    JOIN children c ON i.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (month && typeof month === 'string') {
    sql += ` AND i.month = ?`;
    params.push(month);
  }

  if (status && typeof status === 'string') {
    sql += ` AND i.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY i.issued_at DESC, i.id DESC`;

  const invoices = db.prepare(sql).all(params);
  res.json(invoices);
});

// GET invoice by id
billingRouter.get('/:id', (req: Request, res: Response) => {
  const invoiceId = Number(req.params.id);

  const invoice = db.prepare(`
    SELECT 
      i.*,
      c.first_name,
      c.last_name,
      c.birth_date,
      c.avatar_emoji,
      s.name as section_name
    FROM invoices i
    JOIN children c ON i.child_id = c.id
    LEFT JOIN sections s ON c.section_id = s.id
    WHERE i.id = ?
  `).get<InvoiceRecord>(invoiceId);

  if (!invoice) {
    return res.status(404).json({ error: 'Facture non trouvée' });
  }

  const guardians = db.prepare(`SELECT * FROM guardians WHERE child_id = ?`).all(invoice.child_id);

  res.json({
    ...invoice,
    guardians
  });
});

// POST generate new invoice for a child and month
billingRouter.post('/generate', (req: Request, res: Response) => {
  const { child_id, month, actual_hours, meal_count } = req.body;

  if (!child_id || !month) {
    return res.status(400).json({ error: 'child_id et month (YYYY-MM) sont requis' });
  }

  const child = db.prepare(`SELECT * FROM children WHERE id = ?`).get<{
    id: number;
    contract_hours_per_week: number;
    hourly_rate: number;
  }>(child_id);

  if (!child) {
    return res.status(404).json({ error: 'Enfant non trouvé' });
  }

  // Monthly base contract hours (approx 4.2 weeks / month)
  const monthlyContractHours = Math.round(child.contract_hours_per_week * 4.2);
  const effectiveActualHours = actual_hours !== undefined ? Number(actual_hours) : monthlyContractHours;
  const overtimeHours = Math.max(0, effectiveActualHours - monthlyContractHours);
  const hourlyRate = child.hourly_rate;
  const meals = meal_count !== undefined ? Number(meal_count) : 20;
  const mealUnitPrice = 4.50;

  const totalContractAmount = Math.round(monthlyContractHours * hourlyRate * 100) / 100;
  const totalOvertimeAmount = Math.round(overtimeHours * (hourlyRate * 1.25) * 100) / 100; // +25% on overtime
  const totalMealsAmount = Math.round(meals * mealUnitPrice * 100) / 100;
  const totalDue = Math.round((totalContractAmount + totalOvertimeAmount + totalMealsAmount) * 100) / 100;

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM invoices WHERE month = ?`).get<{ count: number }>(month);
  const seq = ((countRow?.count || 0) + 1).toString().padStart(3, '0');
  const invoiceNumber = `FAC-${month}-${seq}`;
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO invoices (
      invoice_number, child_id, month, contract_hours, actual_hours, overtime_hours,
      hourly_rate, meal_count, meal_unit_price, total_contract_amount,
      total_overtime_amount, total_meals_amount, total_due, status, issued_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    invoiceNumber,
    child_id,
    month,
    monthlyContractHours,
    effectiveActualHours,
    overtimeHours,
    hourlyRate,
    meals,
    mealUnitPrice,
    totalContractAmount,
    totalOvertimeAmount,
    totalMealsAmount,
    totalDue,
    today
  );

  const lastId = db.prepare(`SELECT last_insert_rowid() as id`).get<{ id: number }>();
  const createdId = lastId?.id ?? 0;
  const created = db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(createdId);
  res.status(201).json(created);
});

// PUT update status
billingRouter.put('/:id/status', (req: Request, res: Response) => {
  const invoiceId = Number(req.params.id);
  const { status } = req.body;

  if (!status || !['pending', 'paid', 'overdue'].includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  const today = new Date().toISOString().split('T')[0];
  const paidAt = status === 'paid' ? today : null;

  db.prepare(`
    UPDATE invoices SET status = ?, paid_at = ? WHERE id = ?
  `).run(status, paidAt, invoiceId);

  const updated = db.prepare(`SELECT * FROM invoices WHERE id = ?`).get(invoiceId);
  res.json(updated);
});
