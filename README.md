# 🧸 P'tits Pas — Logiciel de Gestion de Crèche & Micro-Crèche

Système complet, moderne et conforme à la réglementation française (PMI, Décret Petite Enfance et barèmes CAF) pour la gestion quotidienne d'une crèche ou micro-crèche.

---

## 🌟 Fonctionnalités Principales

### 1. 📊 Tableau de Bord & Indicateurs en Temps Réel
- **Présences en direct** : nombre d'enfants présents, attendus, départs validés et absences.
- **Baromètre légal des ratios d'encadrement** : calcul en temps réel du respect des quotas réglementaires par section (alerte immédiate en cas de sous-effectif).
- **Alertes Médicales & PAI** : affichage prioritaire des allergies alimentaires et protocoles d'urgence pour les enfants actuellement accueillis.
- **Aperçu financier** : montants facturés, factures en attente d'encaissement et règlements du mois.

### 2. 👶 Enfants & Familles
- **Dossiers d'admission complets** : identité, date de naissance, calcul automatique de l'âge et assignation par section (*Bébés*, *Moyens*, *Grands*).
- **Fiches médicales** : allergies, intolérances, régimes alimentaires (*Standard*, *Sans lactose*, *Végétarien*, *Sans gluten*, *Sans porc*), PAI et coordonnées du médecin traitant.
- **Contacts d'urgence & Sorties autorisées** : liste des parents et tiers autorisés avec vérification stricte lors du départ.
- **Inscription rapide** : formulaire complet avec conditions contractuelles (forfait horaire hebdomadaire et tarif horaire).

### 3. ⏱️ Pointage & Présences
- **Pointage 1-clic** : horodatage automatique de l'arrivée et du départ réel.
- **Contrôle de sécurité à la sortie** : sélection et validation de la personne autorisée venue chercher l'enfant.
- **Gestion des absences** : enregistrement des absences justifiées (certificat médical, maladie) ou non-justifiées.
- **Filtres par statut** : Tous, Présents, Attendus, Partis, Absents.

### 4. 📖 Cahier de Transmission Quotidien
- **Carnet de liaison numérique** à destination de l'équipe et des familles.
- **Humeur du jour** : sélection visuelle (*Très joyeux*, *Calme & Serein*, *Plein d'énergie*, *Chagrin / Ému*, *Fatigué*).
- **Repas & Biberons** : quantités bues, repas du midi et goûters.
- **Sommeil & Siestes** : heures d'endormissement, durée et qualité du réveil.
- **Hygiène & Changes** : nombre de couches, selles et propreté.
- **Activités d'éveil** : motricité, peinture, comptines, jeux d'extérieur.
- **Observations & signature** de l'éducatrice référente.

### 5. 👥 Personnel & Surveillance des Ratios Légaux
- **Roster d'équipe** : Éducatrices de Jeunes Enfants (EJE), Auxiliaires de Puériculture, animatrices CAP Petite Enfance (AEPE) et directrice.
- **Bouton d'état "En poste"** : bascule en un clic permettant d'actualiser instantanément les ratios disponibles.
- **Règles légales intégrées** :
  - *Section Bébés (non-marcheurs)* : ratio légal de **1 encadrant pour 5 enfants**.
  - *Sections Moyens / Grands (marcheurs)* : ratio légal de **1 encadrant pour 8 enfants**.

### 6. 💶 Facturation & Contrats d'Accueil
- **Calcul automatisé** :
  - Forfait mensuel basé sur le volume horaire contractuel.
  - Détection et calcul des heures de dépassement (majorées à +25%).
  - Facturation unitaire des repas et collations.
- **Gestion des statuts** : émission, suivi des factures en attente, validation des règlements reçus.
- **Bordereau imprimable** : récapitulatif détaillé prêt pour l'envoi aux familles et aux organismes CAF/Pajeemploi.

---

## 🛠️ Architecture Technique

```
gestion-creche/
├── backend/
│   ├── src/
│   │   ├── db/              # Base SQLite (bun:sqlite), schéma & seeder
│   │   ├── routes/          # Endpoints REST (children, attendance, dailyLogs, staff, billing, stats)
│   │   └── index.ts         # Serveur Express sur port 5050
│   ├── data/creche.db       # Base de données locale SQLite (WAL mode)
│   ├── test-api.ts          # Suite de tests d'intégration automatisés
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Dashboard, ChildrenView, AttendanceView, etc.
│   │   ├── api.ts           # Client API TypeScript typé
│   │   ├── types.ts         # Interfaces de données
│   │   ├── App.tsx          # Composant racine & navigation
│   │   └── main.tsx
│   ├── vite.config.ts       # Proxy /api vers http://localhost:5050
│   ├── tailwind.config.js
│   └── package.json
│
└── package.json             # Scripts racine du projet
```

- **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend** : Node.js / Bun, Express 4, TypeScript, `bun:sqlite` (SQLite 3 embarqué ultra-rapide avec mode WAL).
- **Base de données** : SQLite avec tables normalisées (`sections`, `children`, `guardians`, `attendance`, `daily_logs`, `staff`, `invoices`).

---

## 🚀 Démarrage Rapide

### Prérequis
- [Bun](https://bun.sh/) ou Node.js (>= 20)

### 1. Démarrer le Backend
```bash
cd backend
bun run dev
```
Le serveur démarre sur **http://localhost:5050**.

*(Pour réinitialiser ou peupler la base avec les données de démonstration : `bun run seed`)*

### 2. Démarrer le Frontend
```bash
cd frontend
bun run dev
```
L'application web est accessible sur **http://localhost:5173**.

### 3. Lancer les tests d'intégration de l'API
```bash
cd backend
bun test-api.ts
```

### 4. Build de production
```bash
cd frontend && bun run build
cd ../backend && bun run build
```

---

## 📋 Données de Démonstration Incluses

L'application démarre directement avec un jeu de données réaliste :
- **3 sections** : Les Bébés (Poussins), Les Moyens (Explorateurs), Les Grands (Aventuriers).
- **14 enfants** avec dossiers complets, allergies (APLV, arachides, gluten), régimes et PAI.
- **21 fiches parents et personnes autorisées** avec numéros de téléphone et coordonnées d'urgence.
- **Pointage du jour** avec enfants présents, attendus, déjà partis et absents.
- **Transmissions complètes** (repas, siestes, motricité, changes).
- **7 membres d'équipe** (Directrice, EJE, Auxiliaires, CAP AEPE).
- **Factures réelles** de la période courante et précédente avec décompte des heures et repas.
