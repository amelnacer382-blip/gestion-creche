import React, { useEffect, useState } from 'react';
import { 
  X, 
  Heart, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ReceiptEuro,
  UserCheck,
  FileText,
  User,
  Activity,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { fetchChildDetail } from '../api';
import { Child } from '../types';

interface ChildDetailModalProps {
  childId: number | null;
  onClose: () => void;
  onOpenTransmission: (childId: number) => void;
}

export const ChildDetailModal: React.FC<ChildDetailModalProps> = ({ 
  childId, 
  onClose,
  onOpenTransmission
}) => {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    setLoading(true);
    fetchChildDetail(childId)
      .then(setChild)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [childId]);

  if (!childId) return null;

  // Calculate age in months
  const getMonths = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  const months = child ? getMonths(child.birth_date) : 0;
  const progressTo36 = Math.min(100, Math.round((months / 36) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        {loading || !child ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-rose-50/70 via-slate-50 to-amber-50/50 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-18 h-18 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-center text-4xl shadow-xs">
                  {child.avatar_emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {child.first_name} {child.last_name}
                    </h2>
                    <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {child.section_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span>Né(e) le <strong>{child.birth_date}</strong> ({months} mois)</span>
                    <span className="text-slate-300">•</span>
                    <span>Genre: <strong>{child.gender === 'M' ? 'Garçon' : 'Fille'}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Groupe : <strong>{child.blood_group || 'O+'}</strong></span>
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Crèche Progression Bar (Bébés -> Moyens -> Grands -> École) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" /> Progression en structure ({months} / 36 mois)
                  </span>
                  <span className="text-rose-600">{progressTo36}% du parcours crèche</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressTo36}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                  <span>Bébés (0-12m)</span>
                  <span>Moyens (12-24m)</span>
                  <span>Grands (24-36m)</span>
                  <span>École maternelle</span>
                </div>
              </div>

              {/* Health & Medical Information */}
              <div className="bg-rose-50/60 rounded-2xl p-4.5 border border-rose-200">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm mb-3">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Dossier Médical, Allergies & Précautions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Allergies & Intolérances :</span>
                    <p className={`font-black mt-0.5 ${child.allergies && child.allergies !== 'Aucune' ? 'text-rose-700 text-sm' : 'text-slate-800'}`}>
                      {child.allergies || 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Régime Alimentaire :</span>
                    <p className="font-bold text-slate-900 mt-0.5">{child.diet || 'Standard'}</p>
                  </div>
                  {child.medical_notes && (
                    <div className="sm:col-span-2 mt-1">
                      <span className="text-slate-500 font-semibold">Protocole d'urgence / PAI / Sommeil :</span>
                      <p className="font-semibold text-slate-800 mt-1 bg-white p-3 rounded-xl border border-rose-200 text-xs leading-relaxed">
                        « {child.medical_notes} »
                      </p>
                    </div>
                  )}
                  {child.doctor_name && (
                    <div className="sm:col-span-2 flex items-center justify-between mt-1 text-[11px] text-slate-600 border-t border-rose-200/60 pt-2 font-medium">
                      <span>Médecin traitant : <strong>{child.doctor_name}</strong></span>
                      {child.doctor_phone && (
                        <a href={`tel:${child.doctor_phone}`} className="text-rose-600 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {child.doctor_phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Parents & Guardians list */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  <span>Parents & Personnes Autorisées à Récupérer l'Enfant</span>
                </h3>
                <div className="space-y-2.5">
                  {child.guardians && child.guardians.length > 0 ? (
                    child.guardians.map((g, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{g.first_name} {g.last_name}</span>
                            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">{g.relation}</span>
                            {g.is_emergency_contact ? (
                              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-black">Urgence</span>
                            ) : null}
                            {g.is_authorized_pickup ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">Sortie Autorisée</span>
                            ) : null}
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap gap-3 font-medium">
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {g.phone}</span>
                            {g.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {g.email}</span>}
                            {g.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {g.address}</span>}
                          </div>
                        </div>
                        <a 
                          href={`tel:${g.phone}`}
                          className="px-3.5 py-2 bg-white border border-slate-200 hover:border-rose-400 text-slate-800 hover:text-rose-600 rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-rose-500" />
                          <span>Appeler</span>
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucun contact enregistré.</p>
                  )}
                </div>
              </div>

              {/* Contract & Invoicing */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ReceiptEuro className="w-4 h-4 text-emerald-600" /> Contrat d'Accueil & Tarification
                  </span>
                  <span className="font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {child.contract_hours_per_week}h/semaine &bull; {child.hourly_rate} €/h
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Forfait régulier lissé mensuellement. Dépassements horaires calculés automatiquement avec majoration de +25%. Repas facturés à 4,50 € l'unité.
                </p>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    onOpenTransmission(child.id);
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Remplir transmission du jour</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-colors"
                >
                  Fermer le dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
