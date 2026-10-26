import React, { useState, useEffect } from 'react';
import { X, BookOpen, Smile, Utensils, Moon, Baby, Sparkles, Heart, Check } from 'lucide-react';
import { upsertDailyLog, fetchDailyLogs } from '../api';
import { Child, DailyLog } from '../types';

interface DailyLogModalProps {
  childId: number | null;
  children: Child[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  childId,
  children,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedChildId, setSelectedChildId] = useState<number>(childId || children[0]?.id || 1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<string>('Très joyeux');
  const [meals, setMeals] = useState<string>('');
  const [naps, setNaps] = useState<string>('');
  const [hygiene, setHygiene] = useState<string>('2 changes réguliers, peau saine');
  const [activities, setActivities] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [loggedBy, setLoggedBy] = useState<string>('Éducatrice de référence');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (childId) {
      setSelectedChildId(childId);
    }
  }, [childId]);

  // Load existing log for this child & date if available
  useEffect(() => {
    if (!isOpen || !selectedChildId) return;
    fetchDailyLogs(date).then((logs) => {
      const existing = logs.find((l) => l.child_id === selectedChildId);
      if (existing) {
        setMood(existing.mood || 'Très joyeux');
        setMeals(existing.meals_summary || '');
        setNaps(existing.naps_summary || '');
        setHygiene(existing.hygiene_summary || '');
        setActivities(existing.activities || '');
        setObservations(existing.observations || '');
        setLoggedBy(existing.logged_by || 'Éducatrice de référence');
      } else {
        // Defaults
        setMood('Très joyeux');
        setMeals('');
        setNaps('');
        setHygiene('2 changes réguliers');
        setActivities('');
        setObservations('');
      }
    }).catch(console.error);
  }, [isOpen, selectedChildId, date]);

  if (!isOpen) return null;

  const currentChild = children.find((c) => c.id === selectedChildId);

  const moodOptions = [
    { label: 'Très joyeux', emoji: '☀️' },
    { label: 'Calme & Serein', emoji: '🌿' },
    { label: 'Plein d\'énergie', emoji: '⚡' },
    { label: 'Chagrin / Ému', emoji: '💧' },
    { label: 'Fatigué', emoji: '🌙' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertDailyLog({
        child_id: selectedChildId,
        date,
        mood,
        meals_summary: meals,
        naps_summary: naps,
        hygiene_summary: hygiene,
        activities,
        observations,
        logged_by: loggedBy
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-xs">
              {currentChild?.avatar_emoji || '📖'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Transmission Journalière : {currentChild ? `${currentChild.first_name} ${currentChild.last_name}` : ''}
              </h2>
              <p className="text-xs text-slate-500">Cahier de vie et carnet de liaison pour les parents</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Child & Date Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Enfant concerné</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-semibold text-slate-800"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.section_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-600" />
              <span>Humeur générale de la journée</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {moodOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => setMood(opt.label)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    mood === opt.label
                      ? 'bg-amber-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Meals */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-orange-600" />
              <span>Repas, Biberons & Goûter</span>
            </label>
            <input
              type="text"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              placeholder="ex: Biberon 180ml à 10h (tout bu). Purée courgette/poisson + compote à midi."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Naps */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sommeil & Siestes</span>
            </label>
            <input
              type="text"
              value={naps}
              onChange={(e) => setNaps(e.target.value)}
              placeholder="ex: Sieste de 13h15 à 15h00 (endormi paisiblement avec doudou)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Hygiene */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Baby className="w-3.5 h-3.5 text-sky-600" />
              <span>Changes & Propreté</span>
            </label>
            <input
              type="text"
              value={hygiene}
              onChange={(e) => setHygiene(e.target.value)}
              placeholder="ex: 3 couches régulières (1 selle normale). Propreté sur le pot."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Activités & Jeux d'éveil</span>
            </label>
            <input
              type="text"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="ex: Atelier peinture aux doigts, parcours moteur, comptines d'automne"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Observations / Mots pour les parents</span>
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="ex: Très complice avec ses camarades. Petite égratignure soignée avec arnica."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Signature */}
          <div className="pt-2">
            <label className="block font-bold text-slate-700 mb-1">Rédigé et signé par</label>
            <input
              type="text"
              value={loggedBy}
              onChange={(e) => setLoggedBy(e.target.value)}
              placeholder="Nom de l'éducatrice / auxiliaire"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-semibold text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer la transmission'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
