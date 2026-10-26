import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { fetchAttendance, checkIn, checkOut, markAbsence, resetAttendance } from '../api';
import { AttendanceRecord, Guardian } from '../types';

interface AttendanceViewProps {
  onOpenTransmission: (childId: number) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenTransmission }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Check-out modal state
  const [activeCheckoutChild, setActiveCheckoutChild] = useState<AttendanceRecord | null>(null);
  const [pickupPerson, setPickupPerson] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // Absence modal state
  const [activeAbsenceChild, setActiveAbsenceChild] = useState<AttendanceRecord | null>(null);
  const [absenceReason, setAbsenceReason] = useState<string>('Fièvre / Maladie');
  const [absenceJustified, setAbsenceJustified] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendance(date);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleInstantCheckIn = async (childId: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    try {
      await checkIn(childId, date, timeStr);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckoutChild) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    try {
      await checkOut(activeCheckoutChild.child_id, date, timeStr, pickupPerson, checkoutNotes);
      setActiveCheckoutChild(null);
      setPickupPerson('');
      setCheckoutNotes('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAbsenceChild) return;

    try {
      await markAbsence(activeAbsenceChild.child_id, absenceJustified, absenceReason, date);
      setActiveAbsenceChild(null);
      setAbsenceReason('Fièvre / Maladie');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async (childId: number) => {
    try {
      await resetAttendance(childId, date);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const counts = {
    all: records.length,
    present: records.filter((r) => r.status === 'present').length,
    expected: records.filter((r) => r.status === 'expected').length,
    departed: records.filter((r) => r.status === 'departed').length,
    absent: records.filter((r) => r.status.startsWith('absent')).length
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'present') return r.status === 'present';
    if (filter === 'expected') return r.status === 'expected';
    if (filter === 'departed') return r.status === 'departed';
    if (filter === 'absent') return r.status.startsWith('absent');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Date Bar & Presence Counters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Registre d'Appel & Pointage</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                ({records.length} inscrits attendus)
              </span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({counts.all})
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Présents ({counts.present})
          </button>
          <button
            onClick={() => setFilter('expected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'expected' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            Attendus ({counts.expected})
          </button>
          <button
            onClick={() => setFilter('departed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'departed' ? 'bg-slate-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Partis ({counts.departed})
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'absent' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Absents ({counts.absent})
          </button>
        </div>
      </div>

      {/* Attendance List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((item) => {
            const isPresent = item.status === 'present';
            const isDeparted = item.status === 'departed';
            const isAbsent = item.status.startsWith('absent');
            const isExpected = item.status === 'expected';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPresent
                    ? 'bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-100'
                    : isDeparted
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : isAbsent
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Child information */}
                <div className="flex items-center gap-3.5 min-w-[260px]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {item.avatar_emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {item.first_name} {item.last_name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.section_name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Prévu : <strong>{item.scheduled_arrival} - {item.scheduled_departure}</strong></span>
                      {item.allergies && item.allergies !== 'Aucune' && (
                        <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                          ⚠️ {item.allergies}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pointage Status & Timestamps */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {isPresent && (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Arrivé(e) à {item.actual_arrival}</span>
                    </div>
                  )}

                  {isDeparted && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="font-bold">Parti(e) à {item.actual_departure}</span>
                      {item.pickup_by && (
                        <span className="text-slate-500 text-[11px]">&bull; Récupéré par : {item.pickup_by}</span>
                      )}
                    </div>
                  )}

                  {isAbsent && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center gap-1.5">
                      <UserX className="w-3.5 h-3.5" />
                      <span>{item.notes || 'Absent'}</span>
                    </div>
                  )}

                  {isExpected && (
                    <div className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-medium">
                      En attente d'arrivée
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {isExpected && (
                    <>
                      <button
                        onClick={() => handleInstantCheckIn(item.child_id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Pointer Arrivée</span>
                      </button>
                      <button
                        onClick={() => setActiveAbsenceChild(item)}
                        className="px-3 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Signaler Absence
                      </button>
                    </>
                  )}

                  {isPresent && (
                    <>
                      <button
                        onClick={() => {
                          setActiveCheckoutChild(item);
                          setPickupPerson(item.guardians?.[0] ? `${item.guardians[0].first_name} ${item.guardians[0].last_name} (${item.guardians[0].relation})` : '');
                        }}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pointer Départ</span>
                      </button>
                      <button
                        onClick={() => onOpenTransmission(item.child_id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Transmission
                      </button>
                    </>
                  )}

                  {(isDeparted || isAbsent) && (
                    <button
                      onClick={() => handleReset(item.child_id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Réinitialiser le pointage"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check-out Modal with Authorized Pickup validation */}
      {activeCheckoutChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Pointer la sortie : {activeCheckoutChild.first_name} {activeCheckoutChild.last_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vérifiez l'identité de la personne autorisée qui récupère l'enfant.
            </p>

            <form onSubmit={handleConfirmCheckOut} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Personne autorisée à la récupération *
                </label>
                <div className="space-y-2 mb-2">
                  {activeCheckoutChild.guardians?.map((g, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setPickupPerson(`${g.first_name} ${g.last_name} (${g.relation})`)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        pickupPerson.startsWith(g.first_name)
                          ? 'border-rose-500 bg-rose-50 text-rose-800'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{g.first_name} {g.last_name} ({g.relation})</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Ou saisissez un autre nom autorisé..."
                  value={pickupPerson}
                  onChange={(e) => setPickupPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarques au départ (facultatif)</label>
                <input
                  type="text"
                  placeholder="ex: Transmissions données à la maman"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCheckoutChild(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Valider le départ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Absence Modal */}
      {activeAbsenceChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Déclarer l'absence : {activeAbsenceChild.first_name} {activeAbsenceChild.last_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enregistrement de l'absence pour le registre officiel et la facturation.
            </p>

            <form onSubmit={handleConfirmAbsence} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Motif de l'absence</label>
                <input
                  type="text"
                  required
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="ex: Fièvre, certificat médical, convenance parentale"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="justified"
                  checked={absenceJustified}
                  onChange={(e) => setAbsenceJustified(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="justified" className="font-semibold text-slate-700">
                  Absence justifiée (maladie avec prévenance ou certificat)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAbsenceChild(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
                >
                  Confirmer l'absence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
