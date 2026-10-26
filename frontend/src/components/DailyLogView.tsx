import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Smile, 
  Utensils, 
  Moon, 
  Baby, 
  Sparkles, 
  Calendar, 
  Edit3, 
  Check, 
  Plus, 
  User,
  Heart
} from 'lucide-react';
import { fetchDailyLogs, fetchChildren } from '../api';
import { DailyLog, Child } from '../types';

interface DailyLogViewProps {
  onOpenTransmissionModal: (childId: number) => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({ onOpenTransmissionModal }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, childrenData] = await Promise.all([
        fetchDailyLogs(date),
        fetchChildren()
      ]);
      setLogs(logsData);
      setChildren(childrenData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  // Map children who have a log vs those who don't
  const loggedChildIds = new Set(logs.map((l) => l.child_id));

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Cahier de Transmission Quotidien</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl outline-none cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                ({logs.length} sur {children.length} fiches remplies)
              </span>
            </div>
          </div>
        </div>

        {/* Quick action: Children without transmissions */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">À compléter :</span>
          {children.filter((c) => !loggedChildIds.has(c.id)).slice(0, 5).map((child) => (
            <button
              key={child.id}
              onClick={() => onOpenTransmissionModal(child.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <span>{child.avatar_emoji}</span>
              <span>{child.first_name}</span>
              <Plus className="w-3 h-3 text-rose-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Logs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune transmission saisie pour cette date</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Sélectionnez un enfant ci-dessus pour renseigner les repas, siestes, changes et activités de la journée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {logs.map((log) => (
            <div 
              key={log.id || log.child_id} 
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Child avatar, section, mood */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shadow-2xs">
                      {log.avatar_emoji || '👶'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {log.first_name} {log.last_name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {log.section_name}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    <span>{log.mood}</span>
                  </span>
                </div>

                {/* Details sections */}
                <div className="mt-4 space-y-3 text-xs">
                  {/* Meals */}
                  {log.meals_summary && (
                    <div className="p-2.5 rounded-2xl bg-orange-50/60 border border-orange-100">
                      <div className="flex items-center gap-1.5 font-bold text-orange-900 mb-1">
                        <Utensils className="w-3.5 h-3.5 text-orange-600" />
                        <span>Repas & Biberons</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">{log.meals_summary}</p>
                    </div>
                  )}

                  {/* Naps */}
                  {log.naps_summary && (
                    <div className="p-2.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sommeil & Siestes</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">{log.naps_summary}</p>
                    </div>
                  )}

                  {/* Hygiene & Changes */}
                  {log.hygiene_summary && (
                    <div className="p-2.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                      <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1">
                        <Baby className="w-3.5 h-3.5 text-sky-600" />
                        <span>Changes & Hygiène</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">{log.hygiene_summary}</p>
                    </div>
                  )}

                  {/* Activities */}
                  {log.activities && (
                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Activités & Jeux</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">{log.activities}</p>
                    </div>
                  )}

                  {/* Observations */}
                  {log.observations && (
                    <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>Transmissions aux parents</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed italic pl-5">« {log.observations} »</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Logger & Edit */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Rédigé par <strong>{log.logged_by || 'Équipe'}</strong></span>
                <button
                  onClick={() => onOpenTransmissionModal(log.child_id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
