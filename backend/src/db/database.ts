import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

// Resolve to fixed backend/data directory
const dbDir = path.resolve(
  __dirname.includes('dist')
    ? path.join(__dirname, '../data')
    : path.join(__dirname, '../../data')
);
const dbPath = path.join(dbDir, 'creche.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const rawDb = new Database(dbPath);
rawDb.run('PRAGMA foreign_keys = ON;');
rawDb.run('PRAGMA journal_mode = WAL;');

export type QueryParam = string | number | boolean | null | Uint8Array;

export interface PreparedStatement {
  run: (...args: QueryParam[]) => unknown;
  all: <T = Record<string, unknown>>(...args: QueryParam[]) => T[];
  get: <T = Record<string, unknown>>(...args: QueryParam[]) => T | null;
}

export const db = {
  exec: (sql: string) => rawDb.run(sql),
  run: (sql: string, ...params: QueryParam[]) => rawDb.run(sql, ...params),
  prepare: (sql: string): PreparedStatement => {
    const q = rawDb.query(sql);
    return {
      run: (...args: QueryParam[]) => q.run(...args),
      all: <T = Record<string, unknown>>(...args: QueryParam[]) => q.all(...args) as T[],
      get: <T = Record<string, unknown>>(...args: QueryParam[]) => (q.get(...args) as T) ?? null,
    };
  }
};

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      age_min_months INTEGER NOT NULL,
      age_max_months INTEGER NOT NULL,
      color TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 12,
      legal_ratio_standard TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL,
      section_id INTEGER REFERENCES sections(id),
      avatar_emoji TEXT DEFAULT '👶',
      blood_group TEXT,
      allergies TEXT,
      diet TEXT DEFAULT 'Standard',
      medical_notes TEXT,
      doctor_name TEXT,
      doctor_phone TEXT,
      security_pin TEXT DEFAULT '1234',
      status TEXT DEFAULT 'active',
      contract_hours_per_week REAL DEFAULT 35,
      hourly_rate REAL DEFAULT 7.50,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guardians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      relation TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      security_pin TEXT DEFAULT '1234',
      is_emergency_contact INTEGER DEFAULT 1,
      is_authorized_pickup INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      scheduled_arrival TEXT NOT NULL DEFAULT '08:30',
      scheduled_departure TEXT NOT NULL DEFAULT '17:30',
      actual_arrival TEXT,
      actual_departure TEXT,
      status TEXT NOT NULL DEFAULT 'expected',
      pickup_by TEXT,
      notes TEXT,
      signature_confirmed INTEGER DEFAULT 0,
      UNIQUE(child_id, date)
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      mood TEXT DEFAULT 'Très joyeux',
      meals_summary TEXT,
      naps_summary TEXT,
      hygiene_summary TEXT,
      activities TEXT,
      observations TEXT,
      logged_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(child_id, date)
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      qualification_level TEXT NOT NULL,
      section_id INTEGER REFERENCES sections(id),
      phone TEXT,
      email TEXT,
      shift_start TEXT NOT NULL DEFAULT '08:00',
      shift_end TEXT NOT NULL DEFAULT '17:00',
      is_on_duty INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      contract_hours REAL NOT NULL,
      actual_hours REAL NOT NULL,
      overtime_hours REAL NOT NULL DEFAULT 0,
      hourly_rate REAL NOT NULL,
      meal_count INTEGER NOT NULL DEFAULT 20,
      meal_unit_price REAL NOT NULL DEFAULT 4.50,
      total_contract_amount REAL NOT NULL,
      total_overtime_amount REAL NOT NULL DEFAULT 0,
      total_meals_amount REAL NOT NULL,
      total_due REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      issued_at TEXT NOT NULL,
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS activities_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      caption TEXT NOT NULL,
      section_id INTEGER REFERENCES sections(id),
      author_name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'eveil',
      photo_emoji TEXT NOT NULL DEFAULT '🎨',
      likes_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      vaccine_name TEXT NOT NULL,
      dose_number INTEGER NOT NULL DEFAULT 1,
      administered_at TEXT,
      next_due_date TEXT,
      is_mandatory INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'a_jour'
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'info',
      target_section_id INTEGER REFERENCES sections(id),
      author TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week TEXT NOT NULL UNIQUE,
      starter TEXT NOT NULL,
      main_course TEXT NOT NULL,
      side_dish TEXT,
      veggie_option TEXT,
      dessert TEXT NOT NULL,
      afternoon_snack TEXT NOT NULL,
      allergens TEXT,
      is_bio INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS development_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      domain TEXT NOT NULL,
      milestone_title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'en_cours',
      achieved_at TEXT,
      educator_notes TEXT
    );

    -- 6. Liaison Messages (Carnet de liaison interactif Parents <-> Crèche)
    CREATE TABLE IF NOT EXISTS liaison_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL, -- 'parent' ou 'staff'
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'autre', -- 'sante', 'sommeil', 'recuperation', 'alimentation', 'fourniture', 'autre'
      read_by_staff INTEGER DEFAULT 0,
      read_by_parent INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Reminders (Rappels couches, vaccins, doudou, certificats, rendez-vous)
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'fourniture', -- 'fourniture', 'sante_vaccin', 'administratif', 'horaire', 'facture'
      priority TEXT NOT NULL DEFAULT 'normal', -- 'urgent', 'important', 'normal'
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved'
      created_by TEXT NOT NULL DEFAULT 'Équipe crèche',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT
    );
  `);
}
