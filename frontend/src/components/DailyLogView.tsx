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
  Plus, 
  Heart,
  Share2,
  Printer,
  X,
  CheckCircle2,
  Send,
  Smartphone
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
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Parent sheet preview modal
  const [previewLog, setPreviewLog] = useState<DailyLog | null>(null);

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

  const loggedChildIds = new Set(logs.map((l) => l.child_id));
  const completionPercentage = children.length > 0 ? Math.round((logs.length / children.length) * 100) : 0;

  const uniqueSections = Array.from(new Set(children.map((c) => c.section_name || 'Autre')));

  const filteredLogs = logs.filter((log) => {
    if (selectedSection === 'all') return true;
    return log.section_name === selectedSection;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
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
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                {logs.length} sur {children.length} transmissions prêtes ({completionPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSection === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les sections
          </button>
          {uniqueSections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === sec
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Quick completion banner for missing children */}
      {children.filter((c) => !loggedChildIds.has(c.id)).length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
            <span className="text-base">📝</span>
            <span>À compléter pour aujourd'hui :</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {children.filter((c) => !loggedChildIds.has(c.id)).map((child) => (
              <button
                key={child.id}
                onClick={() => onOpenTransmissionModal(child.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-extrabold shadow-2xs border border-amber-200 whitespace-nowrap transition-all"
              >
                <span>{child.avatar_emoji}</span>
                <span>{child.first_name}</span>
                <Plus className="w-3.5 h-3.5 text-amber-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune transmission pour cette sélection</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Sélectionnez un enfant ci-dessus pour renseigner les repas, siestes, changes et activités de la journée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLogs.map((log) => (
            <div 
              key={log.id || log.child_id} 
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Child avatar, section, mood */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shadow-2xs border border-amber-100/60">
                      {log.avatar_emoji || '👶'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">
                        {log.first_name} {log.last_name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {log.section_name}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 shadow-2xs">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    <span>{log.mood}</span>
                  </span>
                </div>

                {/* Details sections */}
                <div className="mt-4 space-y-2.5 text-xs">
                  {/* Meals */}
                  {log.meals_summary && (
                    <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                      <div className="flex items-center gap-1.5 font-extrabold text-orange-950 mb-1">
                        <Utensils className="w-3.5 h-3.5 text-orange-600" />
                        <span>Repas & Biberons</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium pl-5">{log.meals_summary}</p>
                    </div>
                  )}

                  {/* Naps */}
                  {log.naps_summary && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/70">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950 mb-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sommeil & Siestes</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium pl-5">{log.naps_summary}</p>
                    </div>
                  )}

                  {/* Hygiene & Changes */}
                  {log.hygiene_summary && (
                    <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/70">
                      <div className="flex items-center gap-1.5 font-extrabold text-sky-950 mb-1">
                        <Baby className="w-3.5 h-3.5 text-sky-600" />
                        <span>Changes & Propreté</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium pl-5">{log.hygiene_summary}</p>
                    </div>
                  )}

                  {/* Activities */}
                  {log.activities && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Activités d'Éveil</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium pl-5">{log.activities}</p>
                    </div>
                  )}

                  {/* Observations */}
                  {log.observations && (
                    <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/70">
                      <div className="flex items-center gap-1.5 font-extrabold text-rose-950 mb-1">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>Mots pour les parents</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed italic font-medium pl-5">« {log.observations} »</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Logger & Actions */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Signé : <strong>{log.logged_by || 'Équipe'}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewLog(log)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition-colors"
                    title="Aperçu fiche parentale mobile"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Aperçu Parent</span>
                  </button>
                  <button
                    onClick={() => onOpenTransmissionModal(log.child_id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Parent Sheet Mobile Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-slate-900 relative overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-b-xl mx-auto -mt-6 mb-4 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 mx-auto flex items-center justify-center text-3xl shadow-xs mb-2">
                {previewLog.avatar_emoji || '👶'}
              </div>
              <h3 className="font-black text-slate-900 text-lg">
                {previewLog.first_name} {previewLog.last_name}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">{previewLog.section_name} &bull; {previewLog.date}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                <Smile className="w-3.5 h-3.5" /> Humeur : {previewLog.mood}
              </div>
            </div>

            {/* Content summary */}
            <div className="py-4 space-y-3 text-xs max-h-[380px] overflow-y-auto">
              {previewLog.meals_summary && (
                <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100">
                  <span className="font-black text-orange-900 block mb-0.5">🥄 Repas du jour</span>
                  <p className="text-slate-700">{previewLog.meals_summary}</p>
                </div>
              )}

              {previewLog.naps_summary && (
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="font-black text-indigo-900 block mb-0.5">💤 Sieste & repos</span>
                  <p className="text-slate-700">{previewLog.naps_summary}</p>
                </div>
              )}

              {previewLog.hygiene_summary && (
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <span className="font-black text-sky-900 block mb-0.5">✨ Soins & Changes</span>
                  <p className="text-slate-700">{previewLog.hygiene_summary}</p>
                </div>
              )}

              {previewLog.activities && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="font-black text-emerald-900 block mb-0.5">🎨 Éveil & Activités</span>
                  <p className="text-slate-700">{previewLog.activities}</p>
                </div>
              )}

              {previewLog.observations && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                  <span className="font-black text-rose-900 block mb-0.5">❤️ Note des éducatrices</span>
                  <p className="text-slate-700 italic">« {previewLog.observations} »</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Signé par {previewLog.logged_by}</span>
              <button
                onClick={() => setPreviewLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
