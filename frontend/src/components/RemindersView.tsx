import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Package, 
  Syringe, 
  FileText, 
  ReceiptEuro, 
  RotateCcw,
  Sparkles,
  Calendar,
  X,
  User
} from 'lucide-react';
import { fetchReminders, createReminder, toggleReminderStatus, deleteReminder } from '../api';
import { Reminder, Child } from '../types';

interface RemindersViewProps {
  childrenList: Child[];
}

export const RemindersView: React.FC<RemindersViewProps> = ({ childrenList }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [selectedChildId, setSelectedChildId] = useState<number>(childrenList[0]?.id || 1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'fourniture' | 'sante_vaccin' | 'administratif' | 'horaire' | 'facture'>('fourniture');
  const [priority, setPriority] = useState<'urgent' | 'important' | 'normal'>('normal');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReminders(
        undefined,
        statusFilter !== 'all' ? statusFilter : undefined,
        categoryFilter !== 'all' ? categoryFilter : undefined
      );
      setReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReminder({
        child_id: selectedChildId,
        title,
        description,
        category,
        priority,
        due_date: dueDate,
        created_by: 'Équipe crèche'
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleReminderStatus(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReminder(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;
  const urgentCount = reminders.filter((r) => r.status === 'pending' && r.priority === 'urgent').length;
  const resolvedCount = reminders.filter((r) => r.status === 'resolved').length;
  const suppliesCount = reminders.filter((r) => r.status === 'pending' && r.category === 'fourniture').length;

  const quickPresets = [
    { title: 'Prévoir un paquet de couches (taille 4)', cat: 'fourniture', prio: 'important' },
    { title: 'Apporter une tenue complète de rechange', cat: 'fourniture', prio: 'normal' },
    { title: 'Fournir certificat médical de reprise', cat: 'administratif', prio: 'important' },
    { title: 'Renouveler ordonnance PAI annuelle', cat: 'sante_vaccin', prio: 'urgent' },
    { title: 'Doudou de secours pour la sieste', cat: 'fourniture', prio: 'normal' },
    { title: 'Rappel vaccin 2ème injection', cat: 'sante_vaccin', prio: 'important' }
  ];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'fourniture':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'sante_vaccin':
        return <Syringe className="w-4 h-4 text-rose-600" />;
      case 'administratif':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'facture':
        return <ReceiptEuro className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Rappels en cours</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{pendingCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alertes actives</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-200 bg-rose-50/30 shadow-xs">
          <span className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Urgences & Santé</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">{urgentCount}</p>
          <p className="text-xs text-rose-700 mt-0.5">PAI / Vaccins prioritaires</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Fournitures & Couches</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">{suppliesCount}</p>
          <p className="text-xs text-amber-700 mt-0.5">À demander aux parents</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Résolus</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">{resolvedCount}</p>
          <p className="text-xs text-emerald-700 mt-0.5">Fournitures reçues</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({reminders.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              En attente ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Résolus ({resolvedCount})
            </button>
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Toutes catégories</option>
            <option value="fourniture">📦 Fournitures & Couches</option>
            <option value="sante_vaccin">🩺 Santé & Vaccins</option>
            <option value="administratif">📑 Administratif</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un rappel</span>
        </button>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun rappel actif !</h3>
          <p className="text-xs text-slate-500 mt-1">Toutes les fournitures et formalités sont à jour pour les enfants.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => {
            const isPending = rem.status === 'pending';
            const isUrgent = rem.priority === 'urgent';
            const isImportant = rem.priority === 'important';

            return (
              <div
                key={rem.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  !isPending
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : isUrgent
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200 shadow-sm'
                    : isImportant
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200/80 shadow-xs'
                }`}
              >
                <div>
                  {/* Top: Avatar, Child, and Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                        {rem.avatar_emoji}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">
                          {rem.first_name} {rem.last_name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rem.section_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isUrgent ? 'bg-rose-600 text-white' : isImportant ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {rem.priority}
                      </span>
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                      {getCategoryIcon(rem.category)}
                      <span>{rem.title}</span>
                    </div>
                    {rem.description && (
                      <p className="text-xs text-slate-600 font-medium pl-5.5 leading-relaxed">
                        {rem.description}
                      </p>
                    )}
                  </div>

                  {/* Due date info */}
                  {rem.due_date && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 pl-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Échéance : <strong>{rem.due_date}</strong></span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggle(rem.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      isPending
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isPending ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>{isPending ? 'Marquer Traité' : 'Réouvrir'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Supprimer le rappel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Reminder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Nouveau Rappel / Fourniture 🔔</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enfant concerné *</label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-slate-800"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.section_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fast Presets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Raccourcis fréquents :</label>
                <div className="flex flex-wrap gap-1.5">
                  {quickPresets.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(qp.title);
                        setCategory(qp.cat as any);
                        setPriority(qp.prio as any);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-xl font-medium border border-slate-200"
                    >
                      {qp.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Intitulé du rappel *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Paquet de couches taille 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Détails ou consignes pour la famille</label>
                <textarea
                  rows={2}
                  placeholder="ex: Il ne reste que 2 couches dans son casier..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="fourniture">📦 Fourniture / Couches</option>
                    <option value="sante_vaccin">🩺 Santé / Vaccin / PAI</option>
                    <option value="administratif">📑 Administratif</option>
                    <option value="facture">💶 Facture / Paiement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priorité</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date d'échéance souhaitée</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
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
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  Enregistrer le rappel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
