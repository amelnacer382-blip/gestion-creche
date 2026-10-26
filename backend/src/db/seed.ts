import { db, initDatabase } from './database';

export function seed() {
  initDatabase();

  // Clear existing
  db.exec(`
    DELETE FROM invoices;
    DELETE FROM daily_logs;
    DELETE FROM attendance;
    DELETE FROM guardians;
    DELETE FROM staff;
    DELETE FROM children;
    DELETE FROM sections;
  `);

  console.log('🌱 Seeding sections...');
  const insertSection = db.prepare(`
    INSERT INTO sections (id, name, description, age_min_months, age_max_months, color, capacity, legal_ratio_standard)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSection.run(1, 'Les Bébés (Poussins)', 'Espace doudous, motricité libre et rythme individuel', 2, 12, 'rose', 10, '1 pour 5 (non-marcheurs)');
  insertSection.run(2, 'Les Moyens (Explorateurs)', 'Découverte de l\'autonomie, éveil sensoriel et premiers pas', 12, 24, 'amber', 14, '1 pour 8 (marcheurs)');
  insertSection.run(3, 'Les Grands (Aventuriers)', 'Langage, ateliers créatifs, motricité fine et socialisation', 24, 36, 'emerald', 16, '1 pour 8 (marcheurs)');

  console.log('🌱 Seeding staff...');
  const insertStaff = db.prepare(`
    INSERT INTO staff (first_name, last_name, role, qualification_level, section_id, phone, email, shift_start, shift_end, is_on_duty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStaff.run('Émilie', 'Dupont', 'Directrice & Éducatrice EJE', 'Diplôme d\'État EJE', 1, '06 12 34 56 78', 'emilie.dupont@creche-ptitspas.fr', '07:30', '16:00', 1);
  insertStaff.run('Sarah', 'Benali', 'Auxiliaire de Puériculture', 'DEAP', 1, '06 23 45 67 89', 'sarah.benali@creche-ptitspas.fr', '08:00', '16:30', 1);
  insertStaff.run('Camille', 'Moreau', 'Auxiliaire de Puériculture', 'DEAP', 2, '06 34 56 78 90', 'camille.moreau@creche-ptitspas.fr', '08:30', '17:00', 1);
  insertStaff.run('Maxime', 'Leroy', 'Éducateur de Jeunes Enfants', 'Diplôme d\'État EJE', 2, '06 45 67 89 01', 'maxime.leroy@creche-ptitspas.fr', '09:00', '17:30', 1);
  insertStaff.run('Amina', 'Diallo', 'Animatrice Petite Enfance', 'CAP Accompagnant Éducatif PE', 3, '06 56 78 90 12', 'amina.diallo@creche-ptitspas.fr', '08:00', '16:30', 1);
  insertStaff.run('Thomas', 'Rousseau', 'Auxiliaire de Puériculture', 'DEAP', 3, '06 67 89 01 23', 'thomas.rousseau@creche-ptitspas.fr', '09:30', '18:00', 1);
  insertStaff.run('Nathalie', 'Gauthier', 'Agent Polyvalent & Restauration', 'HACCP / Hygiène PE', null, '06 78 90 12 34', 'nathalie.gauthier@creche-ptitspas.fr', '08:30', '15:30', 1);

  console.log('🌱 Seeding children...');
  const insertChild = db.prepare(`
    INSERT INTO children (id, first_name, last_name, birth_date, gender, section_id, avatar_emoji, blood_group, allergies, diet, medical_notes, doctor_name, doctor_phone, status, contract_hours_per_week, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const childrenData = [
    // Bébés (id 1 à 4)
    [1, 'Léo', 'Martin', '2026-03-15', 'M', 1, '🦁', 'O+', 'Aucune', 'Standard', 'Prévoir biberon chauffé à 37°C. Doudou lapin indispensable pour dormir.', 'Dr. Vasseur', '01 45 88 12 00', 'active', 40, 7.80],
    [2, 'Chloé', 'Bernard', '2026-05-10', 'F', 1, '🌸', 'A+', 'Allergie Protéines Lait Vache (APLV)', 'Sans lactose', 'PAI établi le 01/09. Lait spécial fourni par les parents.', 'Dr. Lambert', '01 42 30 45 10', 'active', 30, 8.00],
    [3, 'Noah', 'Dubois', '2026-02-20', 'M', 1, '🐼', 'B+', 'Aucune', 'Standard', 'Régurgitations légères : maintenir vertical 15 min après repas.', 'Dr. Vasseur', '01 45 88 12 00', 'active', 35, 7.50],
    [4, 'Mila', 'Thomas', '2026-06-01', 'F', 1, '🦄', 'O-', 'Aucune', 'Standard', 'Endormissement aux bras ou berceau bercé doucement.', 'Dr. Chevalier', '01 47 12 34 56', 'active', 25, 8.50],

    // Moyens (id 5 à 9)
    [5, 'Gabriel', 'Robert', '2025-06-12', 'M', 2, '🚀', 'A-', 'Arachides et fruits à coque', 'Standard', 'PAI avec trousse d\'urgence (antihistaminique et Stylo EpiPen dans boîte rouge).', 'Dr. Perrin', '01 43 21 09 87', 'active', 40, 7.50],
    [6, 'Emma', 'Richard', '2025-08-04', 'F', 2, '🍓', 'O+', 'Aucune', 'Végétarien', 'Régime végétarien strict. Ne mange pas de poisson ni gélatine.', 'Dr. Vasseur', '01 45 88 12 00', 'active', 35, 7.50],
    [7, 'Louis', 'Petit', '2025-04-18', 'M', 2, '🦖', 'AB+', 'Aucune', 'Sans porc', 'Pousse dentaire en cours, peut être un peu grognon en fin d\'après-midi.', 'Dr. Girard', '01 48 90 23 45', 'active', 30, 8.00],
    [8, 'Alice', 'Durand', '2025-09-22', 'F', 2, '🐰', 'A+', 'Asthme d\'effort léger', 'Standard', 'Ventoline en PAI si toux persistante après motricité.', 'Dr. Perrin', '01 43 21 09 87', 'active', 45, 7.00],
    [9, 'Adam', 'Leroux', '2025-02-14', 'M', 2, '🦊', 'B-', 'Aucune', 'Standard', 'Très bon mangeur, commence l\'apprentissage de la propreté.', 'Dr. Chevalier', '01 47 12 34 56', 'active', 35, 7.50],

    // Grands (id 10 à 14)
    [10, 'Inès', 'Morel', '2024-03-25', 'F', 3, '⭐', 'O+', 'Aucune', 'Sans porc', 'Très sociable, adore les livres et puzzles. Propre le jour.', 'Dr. Girard', '01 48 90 23 45', 'active', 40, 7.20],
    [11, 'Arthur', 'Fournier', '2024-05-11', 'M', 3, '⚡', 'A+', 'Aucune', 'Standard', 'Plein d\'énergie, a besoin de temps calme avant la sieste.', 'Dr. Vasseur', '01 45 88 12 00', 'active', 35, 7.50],
    [12, 'Jade', 'Girard', '2024-08-09', 'F', 3, '🦋', 'B+', 'Gluten (sensibilité)', 'Sans gluten', 'Fournir pain et pâtes sans gluten.', 'Dr. Lambert', '01 42 30 45 10', 'active', 30, 8.20],
    [13, 'Lucas', 'Mercier', '2024-01-30', 'M', 3, '🎈', 'O+', 'Aucune', 'Standard', 'Autonome pour s\'habiller et se laver les mains.', 'Dr. Perrin', '01 43 21 09 87', 'active', 40, 7.20],
    [14, 'Rose', 'Blanc', '2024-07-14', 'F', 3, '🌺', 'A-', 'Aucune', 'Standard', 'Sieste de 1h30 minimum l\'après-midi.', 'Dr. Chevalier', '01 47 12 34 56', 'active', 20, 9.00]
  ];

  for (const c of childrenData) {
    insertChild.run(...c);
  }

  console.log('🌱 Seeding guardians...');
  const insertGuardian = db.prepare(`
    INSERT INTO guardians (child_id, first_name, last_name, relation, phone, email, address, is_emergency_contact, is_authorized_pickup)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const guardiansData = [
    [1, 'Sophie', 'Martin', 'Mère', '06 11 22 33 44', 'sophie.martin@email.com', '14 Rue des Lilas, 75011 Paris', 1, 1],
    [1, 'Julien', 'Martin', 'Père', '06 22 33 44 55', 'julien.martin@email.com', '14 Rue des Lilas, 75011 Paris', 1, 1],
    [1, 'Monique', 'Martin', 'Grand-mère', '06 33 44 55 66', 'monique.m@email.com', '20 Avenue Daumesnil, Paris', 1, 1],

    [2, 'Claire', 'Bernard', 'Mère', '06 44 55 66 77', 'claire.bernard@email.com', '8 Boulevard Voltaire, 75011 Paris', 1, 1],
    [2, 'Antoine', 'Bernard', 'Père', '06 55 66 77 88', 'antoine.b@email.com', '8 Boulevard Voltaire, 75011 Paris', 1, 1],

    [3, 'Audrey', 'Dubois', 'Mère', '06 66 77 88 99', 'audrey.dubois@email.com', '3 Allée des Cerisiers, 75012 Paris', 1, 1],

    [4, 'Élodie', 'Thomas', 'Mère', '06 77 88 99 00', 'elodie.thomas@email.com', '45 Rue de Charonne, 75011 Paris', 1, 1],
    [4, 'Nicolas', 'Thomas', 'Père', '06 88 99 00 11', 'nicolas.t@email.com', '45 Rue de Charonne, 75011 Paris', 1, 1],

    [5, 'Valérie', 'Robert', 'Mère', '06 99 00 11 22', 'valerie.robert@email.com', '12 Rue Saint-Maur, 75011 Paris', 1, 1],
    [5, 'Gilles', 'Robert', 'Père', '06 10 20 30 40', 'gilles.robert@email.com', '12 Rue Saint-Maur, 75011 Paris', 1, 1],

    [6, 'Manon', 'Richard', 'Mère', '06 21 31 41 51', 'manon.richard@email.com', '5 Rue Oberkampf, 75011 Paris', 1, 1],

    [7, 'Karim', 'Petit', 'Père', '06 32 42 52 62', 'karim.petit@email.com', '99 Boulevard Richard Lenoir, 75011 Paris', 1, 1],
    [7, 'Leila', 'Petit', 'Mère', '06 43 53 63 73', 'leila.petit@email.com', '99 Boulevard Richard Lenoir, 75011 Paris', 1, 1],

    [8, 'Isabelle', 'Durand', 'Mère', '06 54 64 74 84', 'isabelle.durand@email.com', '18 Rue Faidherbe, 75011 Paris', 1, 1],

    [9, 'Florian', 'Leroux', 'Père', '06 65 75 85 95', 'florian.leroux@email.com', '7 Rue de la Roquette, 75011 Paris', 1, 1],

    [10, 'Nadia', 'Morel', 'Mère', '06 76 86 96 06', 'nadia.morel@email.com', '27 Rue de Montreuil, 75011 Paris', 1, 1],
    [10, 'Farid', 'Morel', 'Père', '06 87 97 07 17', 'farid.morel@email.com', '27 Rue de Montreuil, 75011 Paris', 1, 1],

    [11, 'Delphine', 'Fournier', 'Mère', '06 98 08 18 28', 'delphine.fournier@email.com', '62 Rue de Bagnolet, 75020 Paris', 1, 1],

    [12, 'Patricia', 'Girard', 'Mère', '06 19 29 39 49', 'patricia.girard@email.com', '33 Avenue Philippe Auguste, 75011 Paris', 1, 1],

    [13, 'Stéphane', 'Mercier', 'Père', '06 20 30 40 50', 'stephane.m@email.com', '15 Rue Chanzy, 75011 Paris', 1, 1],

    [14, 'Céline', 'Blanc', 'Mère', '06 31 41 51 61', 'celine.blanc@email.com', '5 Rue Saint-Ambroise, 75011 Paris', 1, 1]
  ];

  for (const g of guardiansData) {
    insertGuardian.run(...g);
  }

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  console.log(`🌱 Seeding attendance for ${today}...`);
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (child_id, date, scheduled_arrival, scheduled_departure, actual_arrival, actual_departure, status, pickup_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Realistic mix of attendance states today
  const attendanceData = [
    // Bébés
    [1, today, '08:00', '17:00', '08:05', null, 'present', null, 'Arrivé tout sourire'],
    [2, today, '08:30', '16:30', '08:25', null, 'present', null, 'Bien dormi cette nuit'],
    [3, today, '09:00', '17:30', null, null, 'absent_justified', null, 'Fièvre déclarée par maman (38.5°C)'],
    [4, today, '08:30', '16:00', '08:35', '16:05', 'departed', 'Élodie Thomas (Mère)', 'Belle journée d\'adaptation'],

    // Moyens
    [5, today, '08:00', '17:30', '07:55', null, 'present', null, 'En forme, cartouche PAI vérifiée'],
    [6, today, '08:30', '17:00', '08:30', null, 'present', null, 'A fait un gros câlin à l\'accueil'],
    [7, today, '09:00', '16:30', null, null, 'expected', null, 'Prévu à 09:00'],
    [8, today, '08:00', '18:00', '08:00', null, 'present', null, 'Activité peinture avec Camille'],
    [9, today, '08:30', '17:00', '08:30', null, 'present', null, 'Très joyeux ce matin'],

    // Grands
    [10, today, '08:15', '17:45', '08:10', null, 'present', null, 'A apporté un livre sur les dinosaures'],
    [11, today, '08:30', '17:00', '08:25', null, 'present', null, 'Jeu libre en salle motricité'],
    [12, today, '09:00', '16:00', null, null, 'absent_unjustified', null, 'Non arrivé - relance téléphonique prévue'],
    [13, today, '08:00', '17:30', '08:00', null, 'present', null, 'Atelier construction bois'],
    [14, today, '09:30', '15:30', '09:30', '15:30', 'departed', 'Céline Blanc (Mère)', 'Sortie avancée pour rendez-vous médical']
  ];

  for (const a of attendanceData) {
    insertAttendance.run(...a);
  }

  console.log(`🌱 Seeding daily logs for ${today}...`);
  const insertLog = db.prepare(`
    INSERT INTO daily_logs (child_id, date, mood, meals_summary, naps_summary, hygiene_summary, activities, observations, logged_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dailyLogsData = [
    [1, today, 'Très joyeux', 'Biberon 180ml à 09h30 (tout bu). Purée courgette-veau 150g à 12h + compote pomme.', 'Sieste matin : 10h-11h15 (dort paisiblement). Sieste après-midi en cours.', '3 changes (1 selle normale). Peau saine.', 'Tapis d\'éveil sensoriel, hochets sonores.', 'Très réceptif aux comptines de Sarah.', 'Sarah Benali'],
    [2, today, 'Calme', 'Biberon lait spécial 150ml à 09h00. Purée carotte-dinde 130g à 11h45.', 'Sieste de 10h30 à 11h30.', '2 changes propres.', 'Motricité douce sur tapis mousse.', 'Bon appétit, pas de reflux ce matin.', 'Sarah Benali'],
    [5, today, 'Agité', 'Midi : Épinards et colin mangés à moitié. Yaourt nature entièrement fini. Goûter : compote et biscuit.', 'Sieste de 13h00 à 14h30 (réveil un peu grognon mais vite consolé).', '3 changes réguliers, ras.', 'Parcours moteurs, toboggan intérieur, bacs à sable magique.', 'Attention petite égratignure superficielle genou droit lors du jeu, désinfectée avec biseptine.', 'Camille Moreau'],
    [6, today, 'Très joyeux', 'Repas végé : Dahl de lentilles corail et riz doux tout mangé ! Yaourt végétal bio.', 'Sieste de 13h15 à 15h00 (très bon sommeil).', '2 couches normales.', 'Atelier peinture aux doigts et collage de feuilles d\'automne.', 'Excellente journée, a partagé ses jouets avec Louis.', 'Maxime Leroy'],
    [8, today, 'Enjouée', 'Assiette complète finie (escalope de dinde, purée potiron, fromage blanc).', 'Sieste 13h00 - 14h45.', 'Demande d\'elle-même pour aller sur le pot ! 1 accident pipi.', 'Chants de comptines, danse en musique, puzzle 12 pièces.', 'Très dynamique, aucune gêne respiratoire observée.', 'Camille Moreau'],
    [10, today, 'Très joyeux', 'Repas complet sans porc (saumon vapeur, purée carottes, compote abricot).', 'Temps calme 45 min sans dormir (lecture autonome).', '100% autonome aux toilettes.', 'Atelier pré-écriture avec des lettres en bois et jardin pédagogique.', 'A montré fièrement ses dinosaures aux autres enfants.', 'Amina Diallo'],
    [11, today, 'Plein d\'énergie', 'Très bon appétit, s\'est resservi en légumes.', 'Sieste de 13h30 à 15h00.', 'Toilettes autonomes.', 'Jeux d\'extérieur dans la cour fermée, tricycles.', 'Journée au top !', 'Thomas Rousseau']
  ];

  for (const l of dailyLogsData) {
    insertLog.run(...l);
  }

  console.log('🌱 Seeding sample invoices for the current period...');
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_number, child_id, month, contract_hours, actual_hours, overtime_hours, hourly_rate, meal_count, meal_unit_price, total_contract_amount, total_overtime_amount, total_meals_amount, total_due, status, issued_at, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const currentMonth = today.substring(0, 7); // ex: '2026-10'
  const prevMonth = '2026-09';

  const invoiceData = [
    ['FAC-2026-09-001', 1, prevMonth, 160, 164, 4, 7.80, 20, 4.50, 1248.00, 31.20, 90.00, 1369.20, 'paid', '2026-10-01', '2026-10-05'],
    ['FAC-2026-09-002', 2, prevMonth, 120, 120, 0, 8.00, 18, 4.50, 960.00, 0.00, 81.00, 1041.00, 'paid', '2026-10-01', '2026-10-04'],
    ['FAC-2026-09-003', 5, prevMonth, 160, 168.5, 8.5, 7.50, 21, 4.50, 1200.00, 63.75, 94.50, 1358.25, 'paid', '2026-10-01', '2026-10-08'],
    ['FAC-2026-10-001', 1, currentMonth, 160, 162, 2, 7.80, 20, 4.50, 1248.00, 15.60, 90.00, 1353.60, 'pending', `${today}`, null],
    ['FAC-2026-10-002', 2, currentMonth, 120, 122, 2, 8.00, 19, 4.50, 960.00, 16.00, 85.50, 1061.50, 'pending', `${today}`, null],
    ['FAC-2026-10-003', 5, currentMonth, 160, 165, 5, 7.50, 22, 4.50, 1200.00, 37.50, 99.00, 1336.50, 'pending', `${today}`, null],
    ['FAC-2026-10-004', 8, currentMonth, 180, 184, 4, 7.00, 22, 4.50, 1260.00, 28.00, 99.00, 1387.00, 'pending', `${today}`, null],
    ['FAC-2026-10-005', 10, currentMonth, 160, 160, 0, 7.20, 20, 4.50, 1152.00, 0.00, 90.00, 1242.00, 'paid', `${today}`, `${today}`],
    ['FAC-2026-10-006', 14, currentMonth, 80, 82, 2, 9.00, 12, 4.50, 720.00, 18.00, 54.00, 792.00, 'pending', `${today}`, null]
  ];

  for (const inv of invoiceData) {
    insertInvoice.run(...inv);
  }

  console.log('✅ Base de données initialisée et peuplée avec succès !');
}

// Run if called directly
if (import.meta.main || process.argv[1]?.includes('seed')) {
  seed();
}
