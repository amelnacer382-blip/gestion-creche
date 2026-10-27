import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  Baby, 
  Heart, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Phone,
  Moon,
  Pill,
  Car,
  Package,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { fetchLiaisonMessages, sendLiaisonMessage } from '../api';
import { Child, LiaisonMessage } from '../types';

interface LiaisonViewProps {
  childrenList: Child[];
}

export const LiaisonView: React.FC<LiaisonViewProps> = ({ childrenList }) => {
  const [selectedChildId, setSelectedChildId] = useState<number>(childrenList[0]?.id || 1);
  const [messages, setMessages] = useState<LiaisonMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [senderType, setSenderType] = useState<'parent' | 'staff'>('parent');
  const [senderName, setSenderName] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [category, setCategory] = useState<'sante' | 'sommeil' | 'recuperation' | 'alimentation' | 'fourniture' | 'autre'>('sommeil');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId);

  // Auto-fill default sender name when child or type changes
  useEffect(() => {
    if (!selectedChild) return;
    if (senderType === 'parent') {
      const guardian = selectedChild.guardians?.[0];
      setSenderName(guardian ? `${guardian.first_name} ${guardian.last_name} (${guardian.relation})` : 'Parent');
    } else {
      setSenderName('Sarah Benali (Auxiliaire)');
    }
  }, [selectedChildId, senderType, selectedChild]);

  const loadMessages = async () => {
    if (!selectedChildId) return;
    setLoading(true);
    try {
      const data = await fetchLiaisonMessages(selectedChildId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [selectedChildId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChildId) return;
    setIsSubmitting(true);

    try {
      await sendLiaisonMessage({
        child_id: selectedChildId,
        sender_type: senderType,
        sender_name: senderName,
        message: messageText.trim(),
        category
      });
      setMessageText('');
      loadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickTemplates = [
    { text: 'Réveil nocturne à 4h à cause des dents, surveiller sa sieste du matin.', cat: 'sommeil' },
    { text: 'Dose de doliprane donnée à 07h15 ce matin.', cat: 'sante' },
    { text: 'Ce soir c\'est les grands-parents qui viendront le/la chercher à 17h.', cat: 'recuperation' },
    { text: 'Apporté un paquet de couches neuf dans le casier.', cat: 'fourniture' },
    { text: 'Petit appétit ce matin au petit-déjeuner.', cat: 'alimentation' }
  ];

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'sommeil':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Moon className="w-3 h-3" /> Sommeil</span>;
      case 'sante':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Pill className="w-3 h-3" /> Santé</span>;
      case 'recuperation':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Car className="w-3 h-3" /> Sortie</span>;
      case 'fourniture':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Package className="w-3 h-3" /> Fourniture</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Divers</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Carnet de Liaison Familles & Crèche</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Échanges directs quotidiens entre les parents et les professionnelles de référence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
            💬 Transmission bidirectionnelle active
          </span>
        </div>
      </div>

      {/* Main Layout: Left Child Directory + Right Chat Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Children list */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider px-2 py-2 text-slate-400">
            Choisir un enfant ({childrenList.length})
          </h3>

          <div className="space-y-1.5 overflow-y-auto max-h-[520px] pr-1">
            {childrenList.map((child) => {
              const isSelected = child.id === selectedChildId;

              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-rose-50 text-rose-900 ring-2 ring-rose-300 shadow-2xs font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{child.avatar_emoji}</span>
                    <div className="truncate">
                      <p className="text-xs truncate font-bold text-slate-900">
                        {child.first_name} {child.last_name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {child.section_name}
                      </p>
                    </div>
                  </div>

                  {child.today_status === 'present' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Actuellement présent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat History & Message Composer */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header of selected child */}
            {selectedChild && (
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl shadow-2xs">
                    {selectedChild.avatar_emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {selectedChild.first_name} {selectedChild.last_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedChild.section_name} &bull; Responsable : <strong>{selectedChild.guardians?.[0]?.first_name} {selectedChild.guardians?.[0]?.last_name}</strong>
                    </p>
                  </div>
                </div>

                {selectedChild.guardians?.[0]?.phone && (
                  <a
                    href={`tel:${selectedChild.guardians[0].phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                    title="Appeler les parents"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Messages Thread */}
            <div className="mt-4 space-y-4 max-h-[340px] overflow-y-auto pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">Aucun message de liaison pour le moment</p>
                  <p className="mt-1">Utilisez le formulaire ci-dessous pour transmettre une information utile aux parents ou à l'équipe.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isParent = msg.sender_type === 'parent';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isParent ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-black text-slate-700">
                          {msg.sender_name}
                        </span>
                        {getCategoryBadge(msg.category)}
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-3xl p-4 text-xs font-medium leading-relaxed shadow-2xs ${
                          isParent
                            ? 'bg-emerald-50/80 text-emerald-950 border border-emerald-200 rounded-tl-sm'
                            : 'bg-rose-50/80 text-rose-950 border border-rose-200 rounded-tr-sm'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Composer Box */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
            {/* Quick Templates Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Raccourcis :</span>
              {quickTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessageText(tpl.text);
                    setCategory(tpl.cat as any);
                  }}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors"
                >
                  {tpl.text.slice(0, 32)}...
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              {/* Role & Category switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Écrire en tant que :</span>
                  <div className="bg-white p-0.5 rounded-xl border border-slate-200 flex">
                    <button
                      type="button"
                      onClick={() => setSenderType('parent')}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                        senderType === 'parent' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setSenderType('staff')}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                        senderType === 'staff' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Éducatrice
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">Catégorie :</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="sommeil">💤 Sommeil / Nuit</option>
                    <option value="sante">💊 Santé / Médicament</option>
                    <option value="recuperation">🚗 Récupération / Sortie</option>
                    <option value="alimentation">🥣 Alimentation / Biberon</option>
                    <option value="fourniture">📦 Fournitures / Couches</option>
                    <option value="autre">✨ Divers</option>
                  </select>
                </div>
              </div>

              {/* Message text input and send button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder={
                    senderType === 'parent'
                      ? 'Écrire un mot pour les éducatrices (ex: a mal dormi, doudou oublié...)'
                      : 'Répondre aux parents en tant qu\'éducatrice...'
                  }
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-rose-500 focus:bg-white transition-all"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !messageText.trim()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
