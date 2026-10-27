import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const menuRouter = Router();

// GET weekly menu
menuRouter.get('/', (_req: Request, res: Response) => {
  const menu = db.prepare(`SELECT * FROM weekly_menu ORDER BY id ASC`).all();
  res.json(menu);
});

// PUT update daily menu
menuRouter.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { starter, main_course, side_dish, veggie_option, dessert, afternoon_snack, allergens, is_bio } = req.body;

  db.prepare(`
    UPDATE weekly_menu SET
      starter = COALESCE(?, starter),
      main_course = COALESCE(?, main_course),
      side_dish = COALESCE(?, side_dish),
      veggie_option = COALESCE(?, veggie_option),
      dessert = COALESCE(?, dessert),
      afternoon_snack = COALESCE(?, afternoon_snack),
      allergens = COALESCE(?, allergens),
      is_bio = COALESCE(?, is_bio)
    WHERE id = ?
  `).run(
    starter ?? null,
    main_course ?? null,
    side_dish ?? null,
    veggie_option ?? null,
    dessert ?? null,
    afternoon_snack ?? null,
    allergens ?? null,
    is_bio !== undefined ? (is_bio ? 1 : 0) : null,
    id
  );

  const updated = db.prepare(`SELECT * FROM weekly_menu WHERE id = ?`).get(id);
  res.json(updated);
});
