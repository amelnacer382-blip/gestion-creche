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
  Filter,
  Tablet,
  List,
  Search,
  Timer
} from 'lucide-react';
import { fetchAttendance, checkIn, checkOut, markAbsence, resetAttendance } from '../api';
import { AttendanceRecord } from '../types';

interface AttendanceViewProps {
  onOpenTransmission: (childId: number) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onOpenTransmission }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tablet' | 'list'>('tablet');
  const [loading, setLoading] = useState<boolean>(true);

  // Check-out modal state
  const [activeCheckoutChild, setActiveCheckoutChild] = useState<AttendanceRecord | null>(null);
  const [pickupPerson, setPickupPerson] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
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

  // Helper to calculate elapsed time since arrival
  const calculateDuration = (arrival?: string | null) => {
    if (!arrival) return null;
    const [arrH, arrM] = arrival.split(':').map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const arrMinutes = arrH * 60 + arrM;
    const diff = Math.max(0, nowMinutes - arrMinutes);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours === 0) return `${minutes} min`;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  const counts = {
    all: records.length,
    present: records.filter((r) => r.status === 'present').length,
    expected: records.filter((r) => r.status === 'expected').length,
    departed: records.filter((r) => r.status === 'departed').length,
    absent: records.filter((r) => r.status.startsWith('absent')).length
  };

  // Unique sections from records
  const uniqueSections = Array.from(new Set(records.map((r) => r.section_name)));

  const filteredRecords = records.filter((r) => {
    // Status filter
    if (filter === 'present' && r.status !== 'present') return false;
    if (filter === 'expected' && r.status !== 'expected') return false;
    if (filter === 'departed' && r.status !== 'departed') return false;
    if (filter === 'absent' && !r.status.startsWith('absent')) return false;

    // Section filter
    if (selectedSection !== 'all' && r.section_name !== selectedSection) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${r.first_name} ${r.last_name}`.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Date, Search, View Mode Toggle */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Borne de Pointage & Registre</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl outline-none cursor-pointer"
                />
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {counts.present} présent{counts.present > 1 ? 's' : ''} en direct
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un enfant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-500 w-44"
            />
          </div>
        </div>

        {/* View Mode Toggle: Tablet Kiosk Mode vs Compact List */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'tablet'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Mode Borne Tactile</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Mode Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar: Status pills + Section pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({counts.all})
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Présents ({counts.present})
          </button>
          <button
            onClick={() => setFilter('expected')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'expected' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            Attendus ({counts.expected})
          </button>
          <button
            onClick={() => setFilter('departed')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'departed' ? 'bg-slate-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Partis ({counts.departed})
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === 'absent' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Absents ({counts.absent})
          </button>
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Section :</span>
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedSection === 'all' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Toutes
          </button>
          {uniqueSections.map((secName) => (
            <button
              key={secName}
              onClick={() => setSelectedSection(secName)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedSection === secName ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {secName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: TABLET MODE vs LIST MODE */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun enfant correspondant aux filtres</h3>
          <p className="text-xs text-slate-500 mt-1">Modifiez vos critères de recherche ou de section.</p>
        </div>
      ) : viewMode === 'tablet' ? (
        /* TABLET / KIOSK TOUCH-FRIENDLY GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecords.map((item) => {
            const isPresent = item.status === 'present';
            const isDeparted = item.status === 'departed';
            const isAbsent = item.status.startsWith('absent');
            const isExpected = item.status === 'expected';
            const duration = isPresent ? calculateDuration(item.actual_arrival) : null;

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs ${
                  isPresent
                    ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-200/50'
                    : isDeparted
                    ? 'bg-slate-50/80 border-slate-200 opacity-80'
                    : isAbsent
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top: Avatar & Badge */}
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-3xl shadow-xs">
                      {item.avatar_emoji}
                    </div>

                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isPresent
                        ? 'bg-emerald-600 text-white'
                        : isDeparted
                        ? 'bg-slate-700 text-white'
                        : isAbsent
                        ? 'bg-amber-600 text-white'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {isPresent ? 'Présent' : isDeparted ? 'Parti' : isAbsent ? 'Absent' : 'Attendu'}
                    </span>
                  </div>

                  {/* Name and section */}
                  <div className="mt-3.5">
                    <h3 className="font-black text-slate-900 text-base">
                      {item.first_name} {item.last_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {item.section_name}
                    </p>
                  </div>

                  {/* Timestamps & Info */}
                  <div className="mt-3 text-xs space-y-1">
                    {isPresent && (
                      <div className="bg-emerald-100/70 text-emerald-900 rounded-xl p-2 font-bold flex items-center justify-between">
                        <span>Arrivé à {item.actual_arrival}</span>
                        {duration && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                            <Timer className="w-3 h-3" /> {duration}
                          </span>
                        )}
                      </div>
                    )}

                    {isDeparted && (
                      <div className="bg-slate-100 text-slate-700 rounded-xl p-2 font-semibold text-[11px]">
                        <p>Parti à {item.actual_departure}</p>
                        {item.pickup_by && <p className="truncate text-slate-500 mt-0.5">Par : {item.pickup_by}</p>}
                      </div>
                    )}

                    {isAbsent && (
                      <div className="bg-amber-100 text-amber-900 rounded-xl p-2 font-bold text-[11px]">
                        {item.notes || 'Absent'}
                      </div>
                    )}

                    {isExpected && (
                      <div className="text-slate-500 text-xs py-1">
                        Prévu : <strong>{item.scheduled_arrival} - {item.scheduled_departure}</strong>
                      </div>
                    )}

                    {item.allergies && item.allergies !== 'Aucune' && (
                      <p className="text-[11px] text-rose-600 font-bold truncate">
                        ⚠️ Allergie : {item.allergies}
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Touch CTA Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  {isExpected && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleInstantCheckIn(item.child_id)}
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Arrivée</span>
                      </button>
                      <button
                        onClick={() => setActiveAbsenceChild(item)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 rounded-2xl text-xs font-bold transition-colors"
                      >
                        Absence
                      </button>
                    </div>
                  )}

                  {isPresent && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setActiveCheckoutChild(item);
                          setPickupPerson(item.guardians?.[0] ? `${item.guardians[0].first_name} ${item.guardians[0].last_name} (${item.guardians[0].relation})` : '');
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Pointer Départ</span>
                      </button>
                      <button
                        onClick={() => onOpenTransmission(item.child_id)}
                        className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-bold transition-colors"
                      >
                        Cahier de transmission
                      </button>
                    </div>
                  )}

                  {(isDeparted || isAbsent) && (
                    <button
                      onClick={() => handleReset(item.child_id)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Réinitialiser</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="space-y-2.5">
          {filteredRecords.map((item) => {
            const isPresent = item.status === 'present';
            const isDeparted = item.status === 'departed';
            const isAbsent = item.status.startsWith('absent');
            const isExpected = item.status === 'expected';
            const duration = isPresent ? calculateDuration(item.actual_arrival) : null;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPresent
                    ? 'bg-white border-emerald-300 ring-1 ring-emerald-100 shadow-xs'
                    : isDeparted
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : isAbsent
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white border-slate-200/80'
                }`}
              >
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
                        <span className="text-rose-600 font-bold">⚠️ {item.allergies}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {isPresent && (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Arrivé à {item.actual_arrival}</span>
                      {duration && <span className="text-emerald-700 text-[11px]">({duration})</span>}
                    </div>
                  )}

                  {isDeparted && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5">
                      <span className="font-bold">Parti à {item.actual_departure}</span>
                      {item.pickup_by && <span className="text-slate-500 text-[11px]">&bull; {item.pickup_by}</span>}
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

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {isExpected && (
                    <>
                      <button
                        onClick={() => handleInstantCheckIn(item.child_id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Pointer Arrivée
                      </button>
                      <button
                        onClick={() => setActiveAbsenceChild(item)}
                        className="px-3 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Absence
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
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Pointer Départ
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

      {/* Check-out Modal */}
      {activeCheckoutChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Pointer la sortie : {activeCheckoutChild.first_name} {activeCheckoutChild.last_name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vérifiez l'identité de la personne autorisée venue chercher l'enfant.
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
                          ? 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-200'
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

              {/* Virtual Touch PIN Pad */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Code PIN de sécurité Parent</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((idx) => (
                      <span
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${
                          enteredPin.length > idx ? 'bg-rose-600 scale-110' : 'bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Mini keypad */}
                <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        if (enteredPin.length < 4) setEnteredPin((p) => p + n);
                      }}
                      className="py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 font-black text-sm text-slate-800 shadow-2xs active:scale-95"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEnteredPin('')}
                    className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (enteredPin.length < 4) setEnteredPin((p) => p + '0');
                    }}
                    className="py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 font-black text-sm text-slate-800 shadow-2xs active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnteredPin((p) => p.slice(0, -1))}
                    className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarques au départ (facultatif)</label>
                <input
                  type="text"
                  placeholder="ex: Bonne soirée, doudou dans le sac"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCheckoutChild(null);
                    setEnteredPin('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
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
              Enregistrement dans le registre d'appel officiel.
            </p>

            <form onSubmit={handleConfirmAbsence} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Motif de l'absence</label>
                <input
                  type="text"
                  required
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="ex: Fièvre, gastro, convenance familiale"
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
                  Absence justifiée (certificat médical ou prévenance préalable)
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
