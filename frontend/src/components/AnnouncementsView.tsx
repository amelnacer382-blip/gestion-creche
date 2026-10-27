import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  AlertTriangle, 
  Bell, 
  Pin, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Calendar,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement, fetchSections } from '../api';
import { Announcement, Section } from '../types';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'important' | 'info'>('info');
  const [targetSectionId, setTargetSectionId] = useState<number | undefined>(undefined);
  const [pinned, setPinned] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, secData] = await Promise.all([
        fetchAnnouncements(),
        fetchSections()
      ]);
      setAnnouncements(annData);
      setSections(secData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title,
        content,
        priority,
        target_section_id: targetSectionId,
        author: 'Direction P\'tits Pas',
        pinned: pinned ? 1 : 0
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setPriority('info');
      setPinned(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAnnouncement(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Messagerie & Alertes aux Familles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diffusion d'informations officielles, consignes sanitaires et événements
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle annonce</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune annonce publiée</h3>
          <p className="text-xs text-slate-500 mt-1">Créez votre première communication pour les parents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => {
            const isUrgent = item.priority === 'urgent';
            const isImportant = item.priority === 'important';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isUrgent
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200 shadow-sm'
                    : isImportant
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                      isUrgent ? 'bg-rose-600 text-white' : isImportant ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isUrgent ? <AlertTriangle className="w-5 h-5" /> : isImportant ? <Bell className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.pinned === 1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                            <Pin className="w-3 h-3" /> Épinglé
                          </span>
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isUrgent ? 'bg-rose-100 text-rose-800' : isImportant ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {item.target_section_name ? `Section : ${item.target_section_name}` : 'Toutes les familles'}
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-base mt-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line font-medium">
                        {item.content}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Émis par <strong>{item.author}</strong></span>
                        <span>&bull;</span>
                        <span>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    title="Supprimer cette annonce"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Diffuser une annonce aux parents 📢</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de l'annonce *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Rappel : Fête de l'Automne et déguisements"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message / Contenu *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Détaillez les informations utiles pour les parents..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niveau d'urgence</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="info">Info générale</option>
                    <option value="important">Important (Activité/Sortie)</option>
                    <option value="urgent">Urgent (Santé / Épidémie)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destinataires</label>
                  <select
                    value={targetSectionId || ''}
                    onChange={(e) => setTargetSectionId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="">Toute la crèche</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="pin" className="font-bold text-slate-700">
                  Épingler en haut du fil des parents
                </label>
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
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Diffuser l'annonce</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
