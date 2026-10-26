import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Baby, Check } from 'lucide-react';
import { createChild } from '../api';
import { Section } from '../types';

interface NewChildModalProps {
  sections: Section[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewChildModal: React.FC<NewChildModalProps> = ({ 
  sections, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('M');
  const [sectionId, setSectionId] = useState<number>(sections[0]?.id || 1);
  const [avatarEmoji, setAvatarEmoji] = useState('🦁');
  const [allergies, setAllergies] = useState('');
  const [diet, setDiet] = useState('Standard');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [contractHours, setContractHours] = useState(35);
  const [hourlyRate, setHourlyRate] = useState(7.50);

  // Guardian
  const [guardianFirstName, setGuardianFirstName] = useState('');
  const [guardianLastName, setGuardianLastName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Mère');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const emojiOptions = ['🦁', '🌸', '🐼', '🦄', '🚀', '🍓', '🦖', '🐰', '🦊', '⭐', '⚡', '🦋', '🎈', '🌺', '🐻', '🐥'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthDate) {
      setError('Veuillez renseigner le nom, prénom et la date de naissance');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createChild({
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        gender,
        section_id: sectionId,
        avatar_emoji: avatarEmoji,
        allergies: allergies || 'Aucune',
        diet,
        medical_notes: medicalNotes,
        doctor_name: doctorName,
        doctor_phone: doctorPhone,
        contract_hours_per_week: Number(contractHours),
        hourly_rate: Number(hourlyRate),
        guardians: guardianFirstName && guardianPhone ? [
          {
            first_name: guardianFirstName,
            last_name: guardianLastName || lastName,
            relation: guardianRelation,
            phone: guardianPhone,
            email: guardianEmail,
            address: guardianAddress,
            is_emergency_contact: 1,
            is_authorized_pickup: 1
          }
        ] : []
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inattendue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Inscrire un nouvel enfant</h2>
              <p className="text-xs text-slate-500">Dossier d'admission & coordonnées famille</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Identity */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identité de l'enfant</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex: Lucas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="ex: Martin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date de naissance *</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Genre</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                >
                  <option value="M">Garçon</option>
                  <option value="F">Fille</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Section d'accueil</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.age_min_months}-{s.age_max_months} mois)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Avatar Emoji</label>
                <div className="flex gap-1.5 flex-wrap">
                  {emojiOptions.slice(0, 8).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatarEmoji(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        avatarEmoji === em ? 'bg-rose-100 ring-2 ring-rose-500 scale-110' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Health & Diet */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Santé & Régime Alimentaire</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Allergies / Intolérances</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="ex: Arachides, gluten ou 'Aucune'"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Régime spécifique</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                >
                  <option value="Standard">Standard</option>
                  <option value="Sans porc">Sans porc</option>
                  <option value="Sans lactose">Sans lactose</option>
                  <option value="Végétarien">Végétarien</option>
                  <option value="Sans gluten">Sans gluten</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Protocole d'accueil / PAI / Notes médicales</label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="ex: PAI pour asthme, trousse d'urgence dans le vestiaire, doudou requis..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Parent / Guardian Contact */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Responsable Légal Principal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Prénom & Nom du parent</label>
                <input
                  type="text"
                  value={guardianFirstName}
                  onChange={(e) => setGuardianFirstName(e.target.value)}
                  placeholder="ex: Céline Martin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lien de parenté</label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                >
                  <option value="Mère">Mère</option>
                  <option value="Père">Père</option>
                  <option value="Tuteur">Tuteur légal</option>
                  <option value="Grand-parent">Grand-parent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Téléphone d'urgence</label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="parent@email.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contract */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Conditions Tarifaires & Contrat</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Volume horaire (heures/semaine)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={contractHours}
                  onChange={(e) => setContractHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tarif horaire (€ / heure)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Valider l\'inscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
