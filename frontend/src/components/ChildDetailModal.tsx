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
  User
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        {loading || !child ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-3xl shadow-xs">
                  {child.avatar_emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {child.first_name} {child.last_name}
                    </h2>
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {child.section_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Né(e) le {child.birth_date}</span>
                    <span>&bull;</span>
                    <span>Genre: {child.gender === 'M' ? 'Garçon' : 'Fille'}</span>
                    <span>&bull;</span>
                    <span>Groupe : {child.blood_group || 'Non renseigné'}</span>
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
              {/* Health & Medical Information */}
              <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Dossier Médical & Précautions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Allergies & Intolérances :</span>
                    <p className={`font-bold mt-0.5 ${child.allergies && child.allergies !== 'Aucune' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {child.allergies || 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Régime Alimentaire :</span>
                    <p className="font-bold text-slate-800 mt-0.5">{child.diet || 'Standard'}</p>
                  </div>
                  {child.medical_notes && (
                    <div className="sm:col-span-2 mt-1">
                      <span className="text-slate-500 font-medium">Notes médicales & PAI :</span>
                      <p className="font-medium text-slate-700 mt-0.5 bg-white p-2.5 rounded-xl border border-rose-200/60">
                        {child.medical_notes}
                      </p>
                    </div>
                  )}
                  {child.doctor_name && (
                    <div className="sm:col-span-2 flex items-center justify-between mt-1 text-[11px] text-slate-500 border-t border-rose-100/60 pt-2">
                      <span>Médecin traitant : <strong>{child.doctor_name}</strong></span>
                      {child.doctor_phone && <span>Tél : <strong>{child.doctor_phone}</strong></span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Parents & Guardians list */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-600" />
                  <span>Parents & Personnes Autorisées à Récupérer l'Enfant</span>
                </h3>
                <div className="space-y-2">
                  {child.guardians && child.guardians.length > 0 ? (
                    child.guardians.map((g, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{g.first_name} {g.last_name}</span>
                            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">{g.relation}</span>
                            {g.is_emergency_contact ? (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Urgence</span>
                            ) : null}
                            {g.is_authorized_pickup ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Sortie autorisée</span>
                            ) : null}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {g.phone}</span>
                            {g.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>}
                            {g.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {g.address}</span>}
                          </div>
                        </div>
                        <a 
                          href={`tel:${g.phone}`}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-400 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
                        >
                          Appeler
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucun contact enregistré.</p>
                  )}
                </div>
              </div>

              {/* Contract & Invoicing */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ReceiptEuro className="w-4 h-4 text-emerald-600" /> Contrat d'Accueil
                  </span>
                  <span className="font-semibold text-slate-600">
                    {child.contract_hours_per_week}h par semaine &bull; {child.hourly_rate} €/h
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Base forfaitaire calculée au mois avec décompte automatique des heures réelles pointées et des repas fournis.
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
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
