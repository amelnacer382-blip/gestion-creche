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
  Sparkles
} from 'lucide-react';
import { fetchStats, fetchRatios } from '../api';
import { DashboardStats, RatioReport } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ratios, setRatios] = useState<RatioReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, ratiosData] = await Promise.all([
        fetchStats(),
        fetchRatios()
      ]);
      setStats(statsData);
      setRatios(ratiosData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  const attendance = stats?.attendance || { present: 0, expected: 0, departed: 0, absent: 0, absent_justified: 0, absent_unjustified: 0 };
  const totalEnrolled = stats?.enrolled_children || 0;
  const presenceRate = totalEnrolled > 0 ? Math.round((attendance.present / totalEnrolled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Direct Crèche en temps réel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bonjour à l'équipe ! ☀️</h1>
          <p className="text-rose-100 text-sm mt-1 max-w-xl">
            Aujourd'hui, <strong>{attendance.present} enfants</strong> sont sous votre bienveillance. Tous les ratios d'encadrement sont sous surveillance automatique.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <span>Faire le pointage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Présents en ce moment</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{attendance.present}</span>
            <span className="text-xs text-slate-500 font-medium">/ {totalEnrolled} inscrits ({presenceRate}%)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${presenceRate}%` }}
            />
          </div>
        </div>

        {/* Expected card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendus aujourd'hui</span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{attendance.expected}</span>
            <span className="text-xs text-sky-600 font-semibold">à accueillir</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {attendance.departed} départs déjà validés
          </p>
        </div>

        {/* Staff on duty */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personnel en poste</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.staff.on_duty}</span>
            <span className="text-xs text-slate-500 font-medium">/ {stats?.staff.total} membres</span>
          </div>
          <p className="mt-3 text-xs text-indigo-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Équipe mobilisée
          </p>
        </div>

        {/* Absences / Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absences du jour</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{attendance.absent}</span>
            <span className="text-xs text-amber-600 font-semibold">
              ({attendance.absent_justified} justifiée{attendance.absent_justified > 1 ? 's' : ''})
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {attendance.absent_unjustified} absence non justifiée
          </p>
        </div>
      </div>

      {/* Real-time Legal Ratio Tracker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-900">Ratios d'encadrement légaux (PMI / Décret)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi automatisé des quotas : Bébés (1 pour 5 non-marcheurs) &bull; Moyens/Grands (1 pour 8 marcheurs)
            </p>
          </div>
          <button 
            onClick={() => onNavigate('staff')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Gérer les plannings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {ratios?.sections.map((sec) => {
            const isAlert = sec.compliance === 'alert';
            const isWarning = sec.compliance === 'warning';

            return (
              <div 
                key={sec.section_id}
                className={`rounded-2xl p-4.5 border transition-all ${
                  isAlert 
                    ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200' 
                    : isWarning 
                    ? 'bg-amber-50/60 border-amber-300' 
                    : 'bg-emerald-50/40 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{sec.section_name}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isAlert 
                      ? 'bg-rose-600 text-white' 
                      : isWarning 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isAlert ? 'Sous-effectif' : isWarning ? 'Limite atteinte' : 'Conforme'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-slate-500">Enfants présents</p>
                    <p className="text-xl font-extrabold text-slate-900">{sec.present_children}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Encadrants en poste</p>
                    <p className="text-xl font-extrabold text-slate-900">{sec.on_duty_staff}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Norme légale : {sec.legal_rule}</span>
                  <span className="font-bold text-slate-700">Requis : {sec.required_staff} pro{sec.required_staff > 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Medical Alerts & Financial / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical & Allergy Alerts for present children */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-base">Alertes Santé & PAI (Enfants présents)</h3>
            </div>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {stats?.medical_alerts.length || 0} alerte{(stats?.medical_alerts.length || 0) > 1 ? 's' : ''}
            </span>
          </div>

          <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {stats?.medical_alerts && stats.medical_alerts.length > 0 ? (
              stats.medical_alerts.map((child) => (
                <div key={child.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-lg shrink-0">
                    {child.avatar_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {child.first_name} {child.last_name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        {child.section_name}
                      </span>
                    </div>

                    {child.allergies && child.allergies !== 'Aucune' && (
                      <p className="text-xs text-rose-600 font-semibold mt-1">
                        ⚠️ Allergie : {child.allergies}
                      </p>
                    )}

                    {child.diet && child.diet !== 'Standard' && (
                      <p className="text-xs text-amber-700 font-medium">
                        🥗 Régime : {child.diet}
                      </p>
                    )}

                    {child.medical_notes && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic">
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
                <h3 className="font-bold text-slate-900 text-base">Aperçu Facturation & Règlements</h3>
              </div>
              <button
                onClick={() => onNavigate('billing')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>Voir le détail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <p className="text-xs font-semibold text-amber-800">Factures en attente</p>
                <p className="text-2xl font-extrabold text-amber-900 mt-1">
                  {(stats?.financial.pending_amount || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {stats?.financial.pending_count} factures à encaisser
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-800">Encaissé ce mois-ci</p>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {(stats?.financial.collected_this_month || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Règlements reçus
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Calcul automatique des dépassements horaires et forfaits</span>
            <button
              onClick={() => onNavigate('billing')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Émettre des factures
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
