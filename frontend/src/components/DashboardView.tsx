import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Receipt, 
  HeartPulse, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  Utensils,
  Sun,
  Activity,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Bell,
  MessageSquare,
  Package,
  Syringe
} from 'lucide-react';
import { fetchStats, fetchRatios, fetchReminders } from '../api';
import { DashboardStats, RatioReport, Reminder } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ratios, setRatios] = useState<RatioReport | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, ratiosData, remindersData] = await Promise.all([
        fetchStats(),
        fetchRatios(),
        fetchReminders(undefined, 'pending')
      ]);
      setStats(statsData);
      setRatios(ratiosData);
      setReminders(remindersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const attendance = stats?.attendance || { 
    present: 0, 
    expected: 0, 
    departed: 0, 
    absent: 0, 
    absent_justified: 0, 
    absent_unjustified: 0 
  };
  const totalEnrolled = stats?.enrolled_children || 0;
  const presenceRate = totalEnrolled > 0 ? Math.round((attendance.present / totalEnrolled) * 100) : 0;

  // Day routine timeline
  const timelineSteps = [
    { time: '08:00 - 09:30', title: 'Accueil & Biberons', active: true, desc: 'Accueil individualisé et temps d\'échange parents' },
    { time: '09:30 - 11:15', title: 'Ateliers d\'Éveil & Motricité', active: true, desc: 'Peinture végétale, motricité libre, comptines' },
    { time: '11:15 - 12:30', title: 'Déjeuner des Tout-Petits', active: false, desc: 'Repas équilibré selon régime et diversification' },
    { time: '12:45 - 15:00', title: 'Grande Sieste Apaisée', active: false, desc: 'Rythme de sommeil respecté avec doudous' },
    { time: '15:30 - 16:30', title: 'Goûter & Jeux de Plein Air', active: false, desc: 'Fruits frais bio et motricité en extérieur' },
    { time: '16:30 - 18:30', title: 'Transmissions & Départs', active: false, desc: 'Pointage sécurisé et carnet de liaison aux familles' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10 text-9xl">
          🧸
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Direct Crèche &bull; Surveillance PMI active
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bienvenue chez Les P'tits Pas ! ☀️
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Actuellement <strong>{attendance.present} enfants accueillis</strong> sur {totalEnrolled} inscrits.
              L'encadrement légal est garanti par <strong>{stats?.staff.on_duty} professionnels en poste</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Pointer les arrivées</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('liaison')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Carnet de liaison</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key KPI Cards with micro-graphs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Enfants Présents</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{attendance.present}</span>
            <span className="text-xs font-bold text-emerald-600">({presenceRate}% d'occupation)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700" 
              style={{ width: `${presenceRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Sur {totalEnrolled} places disponibles</p>
        </div>

        {/* Expected Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Attendus ce jour</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{attendance.expected}</span>
            <span className="text-xs font-bold text-sky-600">à accueillir</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{attendance.departed} départ(s) validé(s)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Arrivées prévues jusqu'à 09h30</p>
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Équipe en Poste</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{stats?.staff.on_duty}</span>
            <span className="text-xs font-bold text-slate-400">/ {stats?.staff.total} membres</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ratios réglementaires tenus</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Auxiliaires, EJE & Directrice</p>
        </div>

        {/* Absences Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Absences Notifiées</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{attendance.absent}</span>
            <span className="text-xs font-bold text-amber-600">enfant(s)</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Justifiées : <strong>{attendance.absent_justified}</strong></span>
            <span>Non-just. : <strong>{attendance.absent_unjustified}</strong></span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">Repas décomptés automatiquement</p>
        </div>
      </div>

      {/* RAPPELS & FOURNITURES DIRECT WIDGET */}
      {reminders.length > 0 && (
        <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Rappels & Fournitures à Récupérer auprès des Familles
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>Voir les {reminders.length} rappels</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3.5">
            {reminders.slice(0, 3).map((rem) => (
              <div key={rem.id} className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs flex items-start gap-3">
                <span className="text-2xl shrink-0">{rem.avatar_emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-xs truncate">{rem.first_name} {rem.last_name}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {rem.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-1 truncate">{rem.title}</p>
                  {rem.due_date && <p className="text-[10px] text-slate-400 mt-0.5">Échéance : {rem.due_date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Ratio Radar & Section Occupancy */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Baromètre des Ratios Légaux & Taux d'Occupation par Section
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Conformité stricte au Décret Petite Enfance (Bébés : max 1 pour 5 non-marcheurs &bull; Moyens/Grands : max 1 pour 8 marcheurs)
            </p>
          </div>
          <button 
            onClick={() => onNavigate('staff')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Détail plannings pros</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {ratios?.sections.map((sec) => {
            const isAlert = sec.compliance === 'alert';
            const isWarning = sec.compliance === 'warning';
            const occupancyPct = Math.round((sec.present_children / sec.capacity) * 100);

            return (
              <div 
                key={sec.section_id}
                className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isAlert 
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200 shadow-sm' 
                    : isWarning 
                    ? 'bg-amber-50/60 border-amber-300' 
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{sec.section_name}</h3>
                      <span className="text-[11px] font-semibold text-slate-400">Norme : {sec.legal_rule}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isAlert 
                        ? 'bg-rose-600 text-white' 
                        : isWarning 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isAlert ? 'Alerte Quota' : isWarning ? 'Limite' : 'Conforme'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-center bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold">Présents</span>
                      <p className="text-2xl font-black text-slate-900">{sec.present_children} <span className="text-xs text-slate-400 font-normal">/ {sec.capacity}</span></p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold">Pros en poste</span>
                      <p className="text-2xl font-black text-slate-900">{sec.on_duty_staff}</p>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                      <span>Capacité occupée</span>
                      <span>{occupancyPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full ${
                          occupancyPct > 90 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className={`mt-3 text-xs font-semibold ${isAlert ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-slate-600'}`}>
                  {sec.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Menu du jour & Horaires de la journée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu du jour */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Menu Équilibré du Jour 🥕</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                100% Frais & Bio
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                <span className="text-[10px] font-extrabold text-orange-800 uppercase tracking-wider">Déjeuner de midi (11h30)</span>
                <p className="font-bold text-slate-900 text-sm mt-1">
                  Émincé de dinde fermière & Mousseline de potimarron doux
                </p>
                <p className="text-slate-600 mt-0.5">
                  Option végétarienne : Dahl de lentilles corail douces & courgettes vapeur
                </p>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-semibold text-slate-600 border border-orange-200">Dessert : Compote pomme-poire sans sucre ajouté</span>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-semibold text-slate-600 border border-orange-200">Fromage blanc AOP</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Goûter de l'après-midi (15h30)</span>
                <p className="font-bold text-slate-900 text-sm mt-1">
                  Pain bio d'artisan avec pointe de beurre doux & bananes tranchées
                </p>
                <p className="text-slate-600 mt-0.5">
                  Biberons de lait maternel ou infantile personnalisé pour la section Bébés
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Allergènes affichés en cuisine selon la réglementation HACCP</span>
            <button onClick={() => onNavigate('menu')} className="text-rose-600 font-bold hover:underline">
              Voir le semainier complet &rarr;
            </button>
          </div>
        </div>

        {/* Daily Schedule & Routine */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-base">Rythme & Temps Forts de la Journée</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Section par section</span>
          </div>

          <div className="mt-4 space-y-3">
            {timelineSteps.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl shrink-0">
                  {step.time}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Medical Alerts & Financial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical & PAI Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-slate-900 text-base">Alertes Santé & PAI des Présents</h3>
            </div>
            <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-0.5 rounded-full">
              {stats?.medical_alerts.length || 0} alerte{(stats?.medical_alerts.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stats?.medical_alerts && stats.medical_alerts.length > 0 ? (
              stats.medical_alerts.map((child) => (
                <div key={child.id} className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-rose-100 flex items-center justify-center text-xl shrink-0">
                    {child.avatar_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {child.first_name} {child.last_name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        {child.section_name}
                      </span>
                    </div>

                    {child.allergies && child.allergies !== 'Aucune' && (
                      <p className="text-xs text-rose-700 font-bold mt-1 flex items-center gap-1">
                        <span>⚠️ Allergie :</span>
                        <span>{child.allergies}</span>
                      </p>
                    )}

                    {child.diet && child.diet !== 'Standard' && (
                      <p className="text-xs text-amber-800 font-semibold mt-0.5">
                        🥗 Régime : {child.diet}
                      </p>
                    )}

                    {child.medical_notes && (
                      <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                        « {child.medical_notes} »
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                Aucune alerte médicale active pour les enfants présents.
              </p>
            )}
          </div>
        </div>

        {/* Financial & Invoicing summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Point Financier & Règlements</h3>
              </div>
              <button
                onClick={() => onNavigate('billing')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Accéder à la facturation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4.5 rounded-3xl bg-amber-50/70 border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Factures en attente</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">
                  {(stats?.financial.pending_amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-amber-700 font-semibold mt-1">
                  {stats?.financial.pending_count} factures à encaisser
                </p>
              </div>

              <div className="p-4.5 rounded-3xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Règlements perçus</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2">
                  {(stats?.financial.collected_this_month || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1">
                  Encaissé ce mois-ci
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Forfaits réguliers + Dépassements (+25%)</span>
            <button
              onClick={() => onNavigate('billing')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold shadow-xs transition-colors"
            >
              Émettre des factures
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
