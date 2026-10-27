import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Leaf, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Award,
  Apple
} from 'lucide-react';
import { fetchWeeklyMenu } from '../api';
import { WeeklyMenuItem } from '../types';

export const WeeklyMenuView: React.FC = () => {
  const [menu, setMenu] = useState<WeeklyMenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWeeklyMenu()
      .then(setMenu)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Semainier des Menus & Matrice d'Allergènes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Élaboré par notre diététicienne petite enfance &bull; Cuisiné sur place chaque matin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>80% Ingrédients Bio & Circuits Courts</span>
          </span>
        </div>
      </div>

      {/* 5-Day Menu Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {menu.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-base">{day.day_of_week}</h3>
                  {day.is_bio === 1 && (
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      BIO
                    </span>
                  )}
                </div>

                {/* Meals stack */}
                <div className="mt-4 space-y-3 text-xs">
                  {/* Starter */}
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entrée</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{day.starter}</p>
                  </div>

                  {/* Main */}
                  <div className="p-2.5 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">Plat Protéiné</span>
                    <p className="font-bold text-orange-950 mt-0.5">{day.main_course}</p>
                    {day.side_dish && (
                      <p className="text-[11px] text-slate-600 mt-1 font-medium">&bull; {day.side_dish}</p>
                    )}
                  </div>

                  {/* Veggie Option */}
                  {day.veggie_option && (
                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Option Végétarienne</span>
                      <p className="font-semibold text-emerald-950 mt-0.5">{day.veggie_option}</p>
                    </div>
                  )}

                  {/* Dessert */}
                  <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Dessert & Laitage</span>
                    <p className="font-semibold text-amber-950 mt-0.5">{day.dessert}</p>
                  </div>

                  {/* Afternoon Snack */}
                  <div className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-200/60">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Goûter (15h30)</span>
                    <p className="font-semibold text-rose-950 mt-0.5">{day.afternoon_snack}</p>
                  </div>
                </div>
              </div>

              {/* Allergens warning badge */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Allergènes déclarés :</span>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                  {day.allergens || 'Aucun majeur'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HACCP Compliance Banner */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>
            <strong>Contrôle Sanitaire & Traçabilité HACCP :</strong> Relevés de températures effectués quotidiennement. Menus validés par médecin pédiatre.
          </span>
        </div>
        <span className="text-slate-400 text-[11px] shrink-0">Agrément Cuisine Centrale N° 75-HACCP-12</span>
      </div>
    </div>
  );
};
