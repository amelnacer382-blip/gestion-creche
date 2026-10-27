# 🧸 P'tits Pas Pro Suite — Plateforme Complète de Gestion de Crèche & Micro-Crèche

Suite logicielle de référence inspirée des meilleurs systèmes de gestion de crèches (Brightwheel, Famly, Kidizz, Meeko) et conforme aux normes réglementaires françaises (PMI, Décret Petite Enfance, HACCP et barèmes CAF Pajeemploi / CMG).

---

## 🌟 Modules & Fonctionnalités Clés

### 1. 📊 Tableau de Bord & Baromètre des Ratios Légaux
- **Présences en direct** : compteur en temps réel des enfants accueillis, attendus, départs et absences.
- **Ratios PMI réglementaires** : calcul instantané du taux d'encadrement par section (*Bébés : max 1 pour 5 non-marcheurs*, *Moyens/Grands : max 1 pour 8 marcheurs*).
- **Radar d'alertes PAI & Santé** : protocoles d'urgence et allergies alimentaires affichés en priorité pour les enfants présents.
- **Menu du jour & Horaires** : affichage du repas du midi (100% Bio) et timeline des temps forts de la journée.

### 2. ⏱️ Pointage & Borne d'Accueil Tactile Sécurisée
- **Mode Borne / Tablette Murale** : grandes tuiles tactiles ergonomiques conçues pour l'écran tactile à l'entrée de la crèche.
- **Code PIN de Sécurité Parent** : clavier PIN tactile virtuel (4 chiffres) validant l'identité lors du départ de l'enfant.
- **Contrôle d'autorisation de sortie** : liste déroulante des personnes expressément autorisées par les parents.
- **Compteur de durée de garde** : calcul en temps réel du temps passé en crèche (ex. *Présent depuis 4h 15m*).

### 3. 📸 Fil de Vie & Moments Crèche (*Nouveau*)
- **Flux d'activités en direct** : partage de photos et d'anecdotes d'éveil avec les familles.
- **Catégorisation thématique** : *Arts & Peinture 🎨*, *Motricité & Jeux 🧗‍♂️*, *Éveil Musical 🎵*, *Jardin & Nature 🌱*, *Contes & Doudous 📚*.
- **Réactions & Likes** : interaction sociale bienveillante entre éducatrices et parents.

### 4. 🥗 Semainier des Repas & Matrice d'Allergènes (*Nouveau*)
- **Menu complet sur 5 jours** (Lundi au Vendredi) avec Entrée, Plat Protéiné, Accompagnement, Option Végétarienne, Dessert et Goûter de 15h30.
- **Matrice HACCP & Allergènes** : repérage clair du gluten, lactose, fruits à coque, poisson, céleri, etc.

### 5. 📢 Messagerie & Alertes aux Familles (*Nouveau*)
- **Centre de diffusion** : publication d'annonces classées par priorité (*Urgent 🚨*, *Important 🔔*, *Info générale ℹ️*).
- **Ciblage par section ou général** : messages destinés à toute la crèche ou spécifiquement aux Bébés, Moyens ou Grands.
- **Épinglage prioritaire** : alertes sanitaires (varicelle, bronchiolite, canicule) fixées en tête de lecture.

### 6. 👶 Enfants & Familles + 💉 Carnet Vaccinal & 🏆 Jalons d'Éveil
- **Dossiers complets** : identité, section, alimentation, PAI, médecin traitant et contacts d'urgence avec appel 1-clic.
- **Carnet Vaccinal Officiel (11 vaccins obligatoires en France)** : DTP, Coqueluche, Hib, Hépatite B, Pneumocoque, Méningocoque C, ROR avec suivi des doses et rappels.
- **Jalons d'Éveil Pédagogiques** : validation individualisée des acquisitions motrices, de langage, d'autonomie et de socialisation.
- **Suivi des transitions d'âge** : alertes automatiques à l'approche du passage vers la section supérieure.

### 7. 📖 Cahier de Transmission Quotidien
- **Carnet de liaison numérique** : humeur du jour, biberons/repas, sommeil & siestes, changes, activités et observations de l'éducatrice.
- **Aperçu Fiche Parentale Mobile** : rendu smartphone reproduisant l'application parentale reçue le soir.
- **Préréglages rapides 1-clic** : boutons d'insertion rapide pour biberons (180ml, 210ml), sieste apaisée et apprentissage de la propreté.

### 8. 👥 Personnel & Plannings
- **Roster complet** : Directrice EJE, Auxiliaires de Puériculture, Animatrices CAP AEPE, Agent de restauration.
- **Bascule "En poste" en 1 clic** : actualisation dynamique immédiate des ratios légaux de la structure.

### 9. 💶 Facturation & Contrats d'Accueil
- **Calculateur automatisé** : forfait mensuel régulier, majoration des heures supplémentaires (+25%) et décompte des repas.
- **Simulation Aide CAF / CMG** : estimation de la prise en charge jusqu'à 85% selon les barèmes de la Caisse d'Allocations Familiales.
- **Facture Officielle Imprimable / PDF** : document normalisé avec mentions légales, SIRET, N° d'agrément PMI et attestation pour la déclaration Pajeemploi.

---

## 🛠️ Architecture Technique

```
gestion-creche/
├── backend/
│   ├── src/
│   │   ├── db/              # Base SQLite (bun:sqlite, mode WAL) & seeder enrichi
│   │   ├── routes/          # REST (children, attendance, dailyLogs, staff, billing, feed, menu, announcements, vaccinations, milestones)
│   │   └── index.ts         # Serveur Express sur port 5050
│   ├── test-api.ts          # Suite de tests d'intégration automatisés
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Dashboard, Attendance (PIN pad), Feed, WeeklyMenu, Announcements, Children (Vaccins/Jalons), DailyLogs, Staff, Billing
│   │   ├── api.ts           # Client API TypeScript complet
│   │   ├── types.ts         # Modèles de données typés
│   │   └── App.tsx          # Navigation par onglets & intégration globale
│   ├── vite.config.ts       # Proxy /api vers 5050 et support hôtes distants
│   └── package.json
```

---

## 🚀 Démarrage

### Backend :
```bash
cd backend
bun run dev
# Écoute sur http://localhost:5050
```

### Frontend :
```bash
cd frontend
bun run dev
# Écoute sur http://localhost:5173
```

### Tests d'intégration automatisés :
```bash
cd backend
bun run ./test-api.ts
```
