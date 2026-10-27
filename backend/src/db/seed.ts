import { db, initDatabase } from './database';

export function seed() {
  initDatabase();

  // Clear existing
  db.exec(`
    DELETE FROM reminders;
    DELETE FROM liaison_messages;
    DELETE FROM development_milestones;
    DELETE FROM weekly_menu;
    DELETE FROM announcements;
    DELETE FROM vaccinations;
    DELETE FROM activities_feed;
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
    INSERT INTO children (id, first_name, last_name, birth_date, gender, section_id, avatar_emoji, blood_group, allergies, diet, medical_notes, doctor_name, doctor_phone, security_pin, status, contract_hours_per_week, hourly_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const childrenData = [
    [1, 'Léo', 'Martin', '2026-03-15', 'M', 1, '🦁', 'O+', 'Aucune', 'Standard', 'Prévoir biberon chauffé à 37°C. Doudou lapin indispensable pour dormir.', 'Dr. Vasseur', '01 45 88 12 00', '1234', 'active', 40, 7.80],
    [2, 'Chloé', 'Bernard', '2026-05-10', 'F', 1, '🌸', 'A+', 'Allergie Protéines Lait Vache (APLV)', 'Sans lactose', 'PAI établi le 01/09. Lait spécial fourni par les parents.', 'Dr. Lambert', '01 42 30 45 10', '2345', 'active', 30, 8.00],
    [3, 'Noah', 'Dubois', '2026-02-20', 'M', 1, '🐼', 'B+', 'Aucune', 'Standard', 'Régurgitations légères : maintenir vertical 15 min après repas.', 'Dr. Vasseur', '01 45 88 12 00', '3456', 'active', 35, 7.50],
    [4, 'Mila', 'Thomas', '2026-06-01', 'F', 1, '🦄', 'O-', 'Aucune', 'Standard', 'Endormissement aux bras ou berceau bercé doucement.', 'Dr. Chevalier', '01 47 12 34 56', '4567', 'active', 25, 8.50],

    [5, 'Gabriel', 'Robert', '2025-06-12', 'M', 2, '🚀', 'A-', 'Arachides et fruits à coque', 'Standard', 'PAI avec trousse d\'urgence (antihistaminique et Stylo EpiPen dans boîte rouge).', 'Dr. Perrin', '01 43 21 09 87', '5678', 'active', 40, 7.50],
    [6, 'Emma', 'Richard', '2025-08-04', 'F', 2, '🍓', 'O+', 'Aucune', 'Végétarien', 'Régime végétarien strict. Ne mange pas de poisson ni gélatine.', 'Dr. Vasseur', '01 45 88 12 00', '6789', 'active', 35, 7.50],
    [7, 'Louis', 'Petit', '2025-04-18', 'M', 2, '🦖', 'AB+', 'Aucune', 'Sans porc', 'Pousse dentaire en cours, peut être un peu grognon en fin d\'après-midi.', 'Dr. Girard', '01 48 90 23 45', '7890', 'active', 30, 8.00],
    [8, 'Alice', 'Durand', '2025-09-22', 'F', 2, '🐰', 'A+', 'Asthme d\'effort léger', 'Standard', 'Ventoline en PAI si toux persistante après motricité.', 'Dr. Perrin', '01 43 21 09 87', '8901', 'active', 45, 7.00],
    [9, 'Adam', 'Leroux', '2025-02-14', 'M', 2, '🦊', 'B-', 'Aucune', 'Standard', 'Très bon mangeur, commence l\'apprentissage de la propreté.', 'Dr. Chevalier', '01 47 12 34 56', '9012', 'active', 35, 7.50],

    [10, 'Inès', 'Morel', '2024-03-25', 'F', 3, '⭐', 'O+', 'Aucune', 'Sans porc', 'Très sociable, adore les livres et puzzles. Propre le jour.', 'Dr. Girard', '01 48 90 23 45', '1122', 'active', 40, 7.20],
    [11, 'Arthur', 'Fournier', '2024-05-11', 'M', 3, '⚡', 'A+', 'Aucune', 'Standard', 'Plein d\'énergie, a besoin de temps calme avant la sieste.', 'Dr. Vasseur', '01 45 88 12 00', '2233', 'active', 35, 7.50],
    [12, 'Jade', 'Girard', '2024-08-09', 'F', 3, '🦋', 'B+', 'Gluten (sensibilité)', 'Sans gluten', 'Fournir pain et pâtes sans gluten.', 'Dr. Lambert', '01 42 30 45 10', '3344', 'active', 30, 8.20],
    [13, 'Lucas', 'Mercier', '2024-01-30', 'M', 3, '🎈', 'O+', 'Aucune', 'Standard', 'Autonome pour s\'habiller et se laver les mains.', 'Dr. Perrin', '01 43 21 09 87', '4455', 'active', 40, 7.20],
    [14, 'Rose', 'Blanc', '2024-07-14', 'F', 3, '🌺', 'A-', 'Aucune', 'Standard', 'Sieste de 1h30 minimum l\'après-midi.', 'Dr. Chevalier', '01 47 12 34 56', '5566', 'active', 20, 9.00]
  ];

  for (const c of childrenData) {
    insertChild.run(...c);
  }

  console.log('🌱 Seeding guardians...');
  const insertGuardian = db.prepare(`
    INSERT INTO guardians (child_id, first_name, last_name, relation, phone, email, address, security_pin, is_emergency_contact, is_authorized_pickup)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const guardiansData = [
    [1, 'Sophie', 'Martin', 'Mère', '06 11 22 33 44', 'sophie.martin@email.com', '14 Rue des Lilas, 75011 Paris', '1234', 1, 1],
    [1, 'Julien', 'Martin', 'Père', '06 22 33 44 55', 'julien.martin@email.com', '14 Rue des Lilas, 75011 Paris', '1234', 1, 1],
    [2, 'Claire', 'Bernard', 'Mère', '06 44 55 66 77', 'claire.bernard@email.com', '8 Boulevard Voltaire, 75011 Paris', '2345', 1, 1],
    [3, 'Audrey', 'Dubois', 'Mère', '06 66 77 88 99', 'audrey.dubois@email.com', '3 Allée des Cerisiers, 75012 Paris', '3456', 1, 1],
    [4, 'Élodie', 'Thomas', 'Mère', '06 77 88 99 00', 'elodie.thomas@email.com', '45 Rue de Charonne, 75011 Paris', '4567', 1, 1],
    [5, 'Valérie', 'Robert', 'Mère', '06 99 00 11 22', 'valerie.robert@email.com', '12 Rue Saint-Maur, 75011 Paris', '5678', 1, 1],
    [6, 'Manon', 'Richard', 'Mère', '06 21 31 41 51', 'manon.richard@email.com', '5 Rue Oberkampf, 75011 Paris', '6789', 1, 1],
    [7, 'Karim', 'Petit', 'Père', '06 32 42 52 62', 'karim.petit@email.com', '99 Boulevard Richard Lenoir, 75011 Paris', '7890', 1, 1],
    [8, 'Isabelle', 'Durand', 'Mère', '06 54 64 74 84', 'isabelle.durand@email.com', '18 Rue Faidherbe, 75011 Paris', '8901', 1, 1],
    [9, 'Florian', 'Leroux', 'Père', '06 65 75 85 95', 'florian.leroux@email.com', '7 Rue de la Roquette, 75011 Paris', '9012', 1, 1],
    [10, 'Nadia', 'Morel', 'Mère', '06 76 86 96 06', 'nadia.morel@email.com', '27 Rue de Montreuil, 75011 Paris', '1122', 1, 1],
    [11, 'Delphine', 'Fournier', 'Mère', '06 98 08 18 28', 'delphine.fournier@email.com', '62 Rue de Bagnolet, 75020 Paris', '2233', 1, 1],
    [12, 'Patricia', 'Girard', 'Mère', '06 19 29 39 49', 'patricia.girard@email.com', '33 Avenue Philippe Auguste, 75011 Paris', '3344', 1, 1],
    [13, 'Stéphane', 'Mercier', 'Père', '06 20 30 40 50', 'stephane.m@email.com', '15 Rue Chanzy, 75011 Paris', '4455', 1, 1],
    [14, 'Céline', 'Blanc', 'Mère', '06 31 41 51 61', 'celine.blanc@email.com', '5 Rue Saint-Ambroise, 75011 Paris', '5566', 1, 1]
  ];

  for (const g of guardiansData) {
    insertGuardian.run(...g);
  }

  const today = new Date().toISOString().split('T')[0];

  console.log(`🌱 Seeding attendance for ${today}...`);
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (child_id, date, scheduled_arrival, scheduled_departure, actual_arrival, actual_departure, status, pickup_by, notes, signature_confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const attendanceData = [
    [1, today, '08:00', '17:00', '08:05', null, 'present', null, 'Arrivé tout sourire', 1],
    [2, today, '08:30', '16:30', '08:25', null, 'present', null, 'Bien dormi cette nuit', 1],
    [3, today, '09:00', '17:30', null, null, 'absent_justified', null, 'Fièvre déclarée par maman (38.5°C)', 0],
    [4, today, '08:30', '16:00', '08:35', '16:05', 'departed', 'Élodie Thomas (Mère)', 'Belle journée d\'adaptation', 1],
    [5, today, '08:00', '17:30', '07:55', null, 'present', null, 'En forme, cartouche PAI vérifiée', 1],
    [6, today, '08:30', '17:00', '08:30', null, 'present', null, 'A fait un gros câlin à l\'accueil', 1],
    [7, today, '09:00', '16:30', null, null, 'expected', null, 'Prévu à 09:00', 0],
    [8, today, '08:00', '18:00', '08:00', null, 'present', null, 'Activité peinture avec Camille', 1],
    [9, today, '08:30', '17:00', '08:30', null, 'present', null, 'Très joyeux ce matin', 1],
    [10, today, '08:15', '17:45', '08:10', null, 'present', null, 'A apporté un livre sur les dinosaures', 1],
    [11, today, '08:30', '17:00', '08:25', null, 'present', null, 'Jeu libre en salle motricité', 1],
    [12, today, '09:00', '16:00', null, null, 'absent_unjustified', null, 'Non arrivé - relance téléphonique prévue', 0],
    [13, today, '08:00', '17:30', '08:00', null, 'present', null, 'Atelier construction bois', 1],
    [14, today, '09:30', '15:30', '09:30', '15:30', 'departed', 'Céline Blanc (Mère)', 'Sortie avancée pour rendez-vous médical', 1]
  ];

  for (const a of attendanceData) {
    insertAttendance.run(...a);
  }

  console.log('🌱 Seeding daily logs...');
  const insertLog = db.prepare(`
    INSERT INTO daily_logs (child_id, date, mood, meals_summary, naps_summary, hygiene_summary, activities, observations, logged_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dailyLogsData = [
    [1, today, 'Très joyeux', 'Biberon 180ml à 09h30 (tout bu). Purée courgette-veau 150g à 12h + compote pomme.', 'Sieste matin : 10h-11h15 (dort paisiblement). Sieste après-midi en cours.', '3 changes (1 selle normale). Peau saine.', 'Tapis d\'éveil sensoriel, hochets sonores.', 'Très réceptif aux comptines de Sarah.', 'Sarah Benali'],
    [2, today, 'Calme', 'Biberon lait spécial 150ml à 09h00. Purée carotte-dinde 130g à 11h45.', 'Sieste de 10h30 à 11h30.', '2 changes propres.', 'Motricité douce sur tapis mousse.', 'Bon appétit, pas de reflux ce matin.', 'Sarah Benali'],
    [5, today, 'Agité', 'Midi : Épinards et colin mangés à moitié. Yaourt nature entièrement fini. Goûter : compote et biscuit.', 'Sieste de 13h00 à 14h30 (réveil un peu grognon mais vite consolé).', '3 changes réguliers, ras.', 'Parcours moteurs, toboggan intérieur, bacs à sable magique.', 'Attention petite égratignure superficielle genou droit lors du jeu, désinfectée avec biseptine.', 'Camille Moreau'],
    [6, today, 'Très joyeux', 'Repas végé : Dahl de lentilles corail et riz doux tout mangé ! Yaourt végétal bio.', 'Sieste de 13h15 à 15h00 (très bon sommeil).', '2 couches normales.', 'Atelier peinture aux doigts et collage de feuilles d\'automne.', 'Excellente journée, a partagé ses jouets avec Louis.', 'Maxime Leroy'],
    [8, today, 'Plein d\'énergie', 'Assiette complète finie (escalope de dinde, purée potiron, fromage blanc).', 'Sieste 13h00 - 14h45.', 'Demande d\'elle-même pour aller sur le pot !', 'Chants de comptines, danse en musique, puzzle 12 pièces.', 'Très dynamique, aucune gêne respiratoire observée.', 'Camille Moreau'],
    [10, today, 'Très joyeux', 'Repas complet sans porc (saumon vapeur, purée carottes, compote abricot).', 'Temps calme 45 min sans dormir (lecture autonome).', '100% autonome aux toilettes.', 'Atelier pré-écriture avec des lettres en bois et jardin pédagogique.', 'A montré fièrement ses dinosaures aux autres enfants.', 'Amina Diallo']
  ];

  for (const l of dailyLogsData) {
    insertLog.run(...l);
  }

  console.log('🌱 Seeding activities feed...');
  const insertFeed = db.prepare(`
    INSERT INTO activities_feed (title, caption, section_id, author_name, category, photo_emoji, likes_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const feedData = [
    ['Atelier Peinture aux Doigts 🎨', 'Ce matin, les Explorateurs ont exploré les textures et les couleurs d\'automne sur de grandes toiles collectives !', 2, 'Camille Moreau', 'creativite', '🍁', 12],
    ['Parcours de Motricité Géant 🤸', 'Équilibre sur les poutres en mousse, traversée du tunnel magique et toboggan en toute sécurité.', 2, 'Maxime Leroy', 'motricite', '🧗‍♂️', 15],
    ['Éveil Musical & Comptines 🎵', 'Découverte des maracas, du triangle et du tambourin doux avec les tout-petits.', 1, 'Sarah Benali', 'musique', '🥁', 18],
    ['Semis & Jardin Pédagogique 🌱', 'Les Aventuriers ont arrosé les petites pousses de radis et de fraisiers dans la cour.', 3, 'Amina Diallo', 'plein_air', '🌿', 14],
    ['Temps de Lecture et Doudous 📚', 'Moment d\'apaisement avec notre grand livre pop-up sur les animaux de la jungle.', 1, 'Émilie Dupont', 'eveil', '🦁', 9]
  ];

  for (const f of feedData) {
    insertFeed.run(...f);
  }

  console.log('🌱 Seeding weekly menu...');
  const insertMenu = db.prepare(`
    INSERT INTO weekly_menu (day_of_week, starter, main_course, side_dish, veggie_option, dessert, afternoon_snack, allergens, is_bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const menuData = [
    ['Lundi', 'Salade de betteraves bio à l\'échalote', 'Émincé de dinde fermière label rouge', 'Mousseline de potimarron doux', 'Dahl de lentilles corail et courgettes', 'Compote pomme-poire sans sucre', 'Pain complet bio d\'artisan & purée de banane', 'Lactose (fromage)', 1],
    ['Mardi', 'Velouté de carottes au cumin', 'Pavé de colin MSC vapeur citronnée', 'Riz basmati demi-complet & brocolis', 'Galette bio quinoa-patate douce', 'Yaourt nature fermier bio', 'Briochette maison au lait & quartiers de clémentine', 'Poisson, Lactose', 1],
    ['Mercredi', 'Céleri râpé et dés de pommes douces', 'Boulettes de boeuf haché façon grand-mère', 'Purée de panais et pommes de terre', 'Poêlée de pois chiches aux petits légumes', 'Poire pochée à la vanille', 'Sablé avoine fait maison & compote abricot', 'Céleri, Gluten', 1],
    ['Jeudi', 'Soupe de courgettes au Kiri', 'Filet de poulet rôti au thym frais', 'Polenta crémeuse & julienne de carottes', 'Omelette bio aux fines herbes', 'Fromage blanc fermier & coulis de framboises', 'Tartines de pain d\'épeautre et fromage frais', 'Oeufs, Lactose, Gluten', 1],
    ['Vendredi', 'Duo de chou-fleur et brocolis vapeur', 'Filet de saumon sauvage à l\'aneth', 'Petits pois doux & purée de carottes', 'Gratin de coquillettes bio au potiron', 'Pomme au four cannelle douce', 'Gâteau au yaourt bio maison & compote pêche', 'Poisson, Gluten, Lactose', 1]
  ];

  for (const m of menuData) {
    insertMenu.run(...m);
  }

  console.log('🌱 Seeding announcements...');
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (title, content, priority, target_section_id, author, pinned)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run('Atelier d\'éveil musical avec les parents ce vendredi ! 🎶', 'Chers parents, nous vous invitons vendredi à 16h30 à partager un temps musical avec vos enfants et l\'équipe.', 'important', null, 'Émilie Dupont (Directrice)', 1);
  insertAnnouncement.run('Prévention Hivernale & Épidémies 🩺', 'Plusieurs cas de bronchiolite et de toux ont été signalés. Merci de signaler toute fièvre matinale avant l\'arrivée.', 'urgent', null, 'Émilie Dupont (Directrice)', 1);
  insertAnnouncement.run('Sortie Médiathèque pour les Grands 📖', 'Mardi matin, la section des Aventuriers se rend à la médiathèque de quartier. Pensez à prévoir des chaussures adaptées.', 'info', 3, 'Thomas Rousseau', 0);

  console.log('🌱 Seeding vaccinations...');
  const insertVaccine = db.prepare(`
    INSERT INTO vaccinations (child_id, vaccine_name, dose_number, administered_at, next_due_date, is_mandatory, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const vaccineList = ['DTP (Diphtérie-Tétanos-Polio)', 'Coqueluche', 'Haemophilus influenzae b (Hib)', 'Hépatite B', 'Pneumocoque', 'Méningocoque C', 'ROR (Rougeole-Oreillons-Rubéole)'];

  for (let cId = 1; cId <= 14; cId++) {
    for (const vName of vaccineList) {
      const isUpToDate = !(cId === 3 && vName.includes('ROR')) && !(cId === 7 && vName.includes('Méningocoque'));
      insertVaccine.run(
        cId,
        vName,
        2,
        '2026-06-15',
        isUpToDate ? '2027-06-15' : '2026-10-15',
        1,
        isUpToDate ? 'a_jour' : 'rappel_requis'
      );
    }
  }

  console.log('🌱 Seeding development milestones...');
  const insertMilestone = db.prepare(`
    INSERT INTO development_milestones (child_id, domain, milestone_title, status, achieved_at, educator_notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const milestonesData = [
    [1, 'Motricité globale', 'Se retourne ventre/dos avec aisance', 'acquis', '2026-09-10', 'Très tonique sur le tapis d\'éveil'],
    [1, 'Motricité fine', 'Attrape volontairement un hochet sonore', 'acquis', '2026-10-02', 'Bonne préhension palmaire'],
    [1, 'Langage', 'Gazouillis en réponse aux voix familières', 'en_cours', null, 'S\'exprime beaucoup avec Sarah'],
    [5, 'Motricité globale', 'Marche acquise et montée sur bloc mousse', 'acquis', '2026-08-20', 'Équilibre stable et dynamique'],
    [5, 'Autonomie', 'Boit seul au verre d\'apprentissage', 'acquis', '2026-09-15', 'Gère bien les quantités sans renverser'],
    [10, 'Langage', 'Formule des phrases complètes sujet-verbe-complément', 'acquis', '2026-07-10', 'Vocabulaire très riche'],
    [10, 'Autonomie', 'Propreté de jour 100% acquise', 'acquis', '2026-08-15', 'Demande spontanément pour aller aux toilettes']
  ];

  for (const m of milestonesData) {
    insertMilestone.run(...m);
  }

  // === NEW SEEDING: LIAISON MESSAGES (Carnet de liaison interactif Parents <-> Crèche) ===
  console.log('🌱 Seeding liaison messages (Carnet de liaison)...');
  const insertLiaison = db.prepare(`
    INSERT INTO liaison_messages (child_id, sender_type, sender_name, message, category, read_by_staff, read_by_parent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const liaisonData = [
    // Léo Martin
    [1, 'parent', 'Sophie Martin (Maman)', 'Bonjour à l\'équipe ! Léo a été réveillé à 4h cette nuit à cause d\'une poussée dentaire. Il risque d\'avoir besoin d\'un dodo un peu plus long ce matin.', 'sommeil', 1, 1],
    [1, 'staff', 'Sarah Benali (Auxiliaire)', 'Bonjour Sophie, bien noté ! On va lui proposer son doudou plus tôt et lui accorder un temps de repos au calme. Très bonne journée.', 'sommeil', 1, 1],
    
    // Chloé Bernard
    [2, 'parent', 'Antoine Bernard (Père)', 'Bonjour, Chloé a pris sa dose de doliprane à 07h15 pour ses gencives. Merci de nous appeler si elle semble gênée ou si la fièvre réapparaît.', 'sante', 1, 1],
    [2, 'staff', 'Sarah Benali (Auxiliaire)', 'C\'est bien noté Antoine ! Nous surveillons attentivement et nous vérifierons sa température avant le déjeuner.', 'sante', 1, 1],

    // Arthur Fournier
    [11, 'parent', 'Delphine Fournier (Mère)', 'Information pour ce soir : c\'est son grand-père Jacques qui viendra le chercher à 17h15.', 'recuperation', 1, 1],
    [11, 'staff', 'Thomas Rousseau (Auxiliaire)', 'Bonjour Delphine, message bien reçu et transmis à l\'équipe de fermeture. Bonne journée !', 'recuperation', 1, 1],

    // Gabriel Robert
    [5, 'parent', 'Valérie Robert (Mère)', 'Nous avons déposé une nouvelle boîte d\'antihistaminiques dans son casier de pharmacie ce matin (date limite 2027).', 'sante', 1, 1]
  ];

  for (const l of liaisonData) {
    insertLiaison.run(...l);
  }

  // === NEW SEEDING: REMINDERS (Rappels couches, vaccins, doudous, certificats) ===
  console.log('🌱 Seeding reminders (Rappels fournitures & santé)...');
  const insertReminder = db.prepare(`
    INSERT INTO reminders (child_id, title, description, category, priority, due_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const remindersData = [
    [1, 'Prévoir un paquet de couches taille 4', 'Il ne reste que 3 couches dans son casier individuel pour la semaine.', 'fourniture', 'important', '2026-10-28', 'pending', 'Sarah Benali'],
    [2, 'Ordonnance PAI lait spécial à renouveler', 'Le protocole d\'accueil individualisé expire à la fin du mois.', 'sante_vaccin', 'urgent', '2026-10-31', 'pending', 'Émilie Dupont'],
    [3, 'Certificat médical de reprise d\'accueil', 'Fournir le certificat du pédiatre suite à l\'épisode de fièvre.', 'administratif', 'important', '2026-10-29', 'pending', 'Émilie Dupont'],
    [5, 'Contrôle péremption trousse EpiPen', 'Vérification semestrielle effectuée : boîte rouge conforme.', 'sante_vaccin', 'normal', '2026-10-20', 'resolved', 'Camille Moreau'],
    [7, 'Rappel vaccin Méningocoque C', 'Dose de rappel prévue avant les 18 mois de l\'enfant.', 'sante_vaccin', 'important', '2026-11-15', 'pending', 'Émilie Dupont'],
    [8, 'Apporter une tenue complète de rechange', 'Prévoir body, pantalon et chaussettes adaptées à la saison.', 'fourniture', 'normal', '2026-10-30', 'pending', 'Camille Moreau'],
    [11, 'Doudou de secours pour le dortoir', 'Un deuxième doudou serait précieux pour faciliter l\'endormissement.', 'fourniture', 'normal', '2026-10-30', 'pending', 'Thomas Rousseau']
  ];

  for (const r of remindersData) {
    insertReminder.run(...r);
  }

  console.log('🌱 Seeding invoices...');
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_number, child_id, month, contract_hours, actual_hours, overtime_hours, hourly_rate, meal_count, meal_unit_price, total_contract_amount, total_overtime_amount, total_meals_amount, total_due, status, issued_at, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const currentMonth = today.substring(0, 7);
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

  console.log('✅ Base de données enrichie avec liaison et rappels avec succès !');
}

if (import.meta.main || process.argv[1]?.includes('seed')) {
  seed();
}
