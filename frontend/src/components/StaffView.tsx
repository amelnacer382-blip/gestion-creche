import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Power,
  Sparkles
} from 'lucide-react';
import { fetchStaff, toggleStaffDuty, fetchRatios, createStaff } from '../api';
import { StaffMember, RatioReport, Section } from '../types';

interface StaffViewProps {
  sections: Section[];
}

export const StaffView: React.FC<StaffViewProps> = ({ sections }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [ratios, setRatios] = useState<RatioReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('Auxiliaire de Puériculture');
  const [qualification, setQualification] = useState('Diplôme d\'État (DEAP)');
  const [sectionId, setSectionId] = useState<number | undefined>(sections[0]?.id);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shiftStart, setShiftStart] = useState('08:30');
  const [shiftEnd, setShiftEnd] = useState('17:00');

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, ratiosData] = await Promise.all([
        fetchStaff(),
        fetchRatios()
      ]);
      setStaff(staffData);
      setRatios(ratiosData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDuty = async (id: number) => {
    try {
      await toggleStaffDuty(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff({
        first_name: firstName,
        last_name: lastName,
        role,
        qualification_level: qualification,
        section_id: sectionId,
        phone,
        email,
        shift_start: shiftStart,
        shift_end: shiftEnd,
        is_on_duty: 1
      });
      setIsModalOpen(false);
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const onDutyCount = staff.filter((s) => s.is_on_duty === 1).length;

  return (
    <div className="space-y-6">
      {/* Header and summary */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Personnel & Ratios d'Encadrement</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong>{onDutyCount} encadrants en poste</strong> sur {staff.length} professionnels
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un collaborateur</span>
        </button>
      </div>

      {/* Real-time Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ratios?.sections.map((sec) => {
          const isAlert = sec.compliance === 'alert';
          const isWarning = sec.compliance === 'warning';

          return (
            <div
              key={sec.section_id}
              className={`rounded-3xl p-5 border transition-all ${
                isAlert
                  ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{sec.section_name}</h3>
                  <p className="text-[11px] text-slate-500">{sec.legal_rule}</p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isAlert
                      ? 'bg-rose-600 text-white'
                      : isWarning
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isAlert ? 'Sous-effectif' : isWarning ? 'Limite atteinte' : 'Conforme'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center bg-slate-50/70 rounded-2xl p-3 border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Enfants présents</span>
                  <p className="text-2xl font-black text-slate-900">{sec.present_children}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Pros en poste</span>
                  <p className="text-2xl font-black text-slate-900">{sec.on_duty_staff}</p>
                </div>
              </div>

              <p className={`mt-3 text-xs font-semibold ${isAlert ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-slate-600'}`}>
                {sec.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Staff Roster List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((person) => {
            const isOnDuty = person.is_on_duty === 1;

            return (
              <div
                key={person.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                  isOnDuty
                    ? 'border-indigo-200/80 shadow-xs'
                    : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top: Avatar, Name, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shadow-2xs ${
                        isOnDuty ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {person.first_name[0]}{person.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {person.first_name} {person.last_name}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {person.role}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDuty(person.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                        isOnDuty
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={isOnDuty ? 'Cliquer pour passer hors poste' : 'Cliquer pour passer en poste'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOnDuty ? 'En poste' : 'Absent(e)'}</span>
                    </button>
                  </div>

                  {/* Info badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-slate-400" /> Diplôme</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[170px]">{person.qualification_level}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Horaires</span>
                      <span className="font-semibold text-slate-700">{person.shift_start} - {person.shift_end}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Section rattachée</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {person.section_name || 'Toute la structure'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact info footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{person.phone || 'Pas de numéro'}</span>
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors"
                      title="Contacter"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Ajouter un membre à l'équipe</h3>
            <p className="text-xs text-slate-500 mb-4">Enregistrez un nouvel encadrant ou remplaçant.</p>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fonction / Rôle *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                >
                  <option value="Directrice & Éducatrice EJE">Directrice & Éducatrice EJE</option>
                  <option value="Éducateur de Jeunes Enfants">Éducateur de Jeunes Enfants (EJE)</option>
                  <option value="Auxiliaire de Puériculture">Auxiliaire de Puériculture</option>
                  <option value="Animatrice Petite Enfance">Animatrice Petite Enfance (CAP AEPE)</option>
                  <option value="Agent Polyvalent & Restauration">Agent Polyvalent & Restauration</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Niveau de qualification / Diplôme *</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="ex: Diplôme d'État EJE, DEAP, CAP AEPE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Section assignée</label>
                <select
                  value={sectionId || ''}
                  onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                >
                  <option value="">Toute la crèche (polyvalent)</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure début</label>
                  <input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure fin</label>
                  <input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors"
                >
                  Ajouter à l'équipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
