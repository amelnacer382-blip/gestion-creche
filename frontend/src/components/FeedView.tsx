import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Heart, 
  Plus, 
  Sparkles, 
  Calendar, 
  Tag, 
  User, 
  Share2, 
  MessageCircle,
  Filter,
  X
} from 'lucide-react';
import { fetchFeed, publishFeedItem, likeFeedItem, fetchSections } from '../api';
import { ActivityFeedItem, Section } from '../types';

export const FeedView: React.FC = () => {
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [authorName, setAuthorName] = useState('Sarah Benali');
  const [category, setCategory] = useState<'motricite' | 'creativite' | 'eveil' | 'plein_air' | 'repas' | 'musique'>('creativite');
  const [photoEmoji, setPhotoEmoji] = useState('🎨');

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedData, sectionsData] = await Promise.all([
        fetchFeed(selectedSection),
        fetchSections()
      ]);
      setFeed(feedData);
      setSections(sectionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSection]);

  const handleLike = async (id: number) => {
    try {
      const updated = await likeFeedItem(id);
      setFeed((prev) => prev.map((item) => (item.id === id ? { ...item, likes_count: updated.likes_count } : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await publishFeedItem({
        title,
        caption,
        section_id: sectionId,
        author_name: authorName,
        category,
        photo_emoji: photoEmoji
      });
      setIsModalOpen(false);
      setTitle('');
      setCaption('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const categoryLabels: Record<string, { label: string; emoji: string }> = {
    all: { label: 'Toutes les activités', emoji: '✨' },
    creativite: { label: 'Arts & Peinture', emoji: '🎨' },
    motricite: { label: 'Motricité & Jeux', emoji: '🤸' },
    musique: { label: 'Éveil Musical', emoji: '🎵' },
    plein_air: { label: 'Jardin & Nature', emoji: '🌱' },
    eveil: { label: 'Contes & Doudous', emoji: '📚' }
  };

  const filteredFeed = feed.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const emojiChoices = ['🎨', '🍁', '🧗‍♂️', '🥁', '🌿', '🦁', '🧩', '🎈', '🌊', '🌈', '👶', '🧸'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Publish CTA */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Fil de Vie & Moments de la Crèche</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Journal photo et activités partagées avec les parents en temps réel
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Partager un moment</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {Object.entries(categoryLabels).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{val.emoji}</span>
              <span>{val.label}</span>
            </button>
          ))}
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Section :</span>
          <button
            onClick={() => setSelectedSection(undefined)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedSection === undefined ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Toutes
          </button>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSection(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedSection === s.id ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Stream Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : filteredFeed.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun moment partagé dans cette catégorie</h3>
          <p className="text-xs text-slate-500 mt-1">Cliquez sur « Partager un moment » pour publier une activité.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeed.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Header / Photo Illustration Card */}
                <div className="h-44 bg-gradient-to-tr from-rose-100 via-amber-50 to-rose-50 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                  <span className="text-7xl group-hover:scale-115 transition-transform duration-300 select-none">
                    {item.photo_emoji}
                  </span>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-slate-800 shadow-2xs">
                      {item.section_name || 'Toute la crèche'}
                    </span>
                    <span className="bg-rose-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>

              {/* Card Footer: Author & Like Reaction */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-600 truncate">
                  Par <strong>{item.author_name}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-extrabold shadow-2xs transition-all active:scale-95"
                    title="Aimer ce moment"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{item.likes_count}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Publish Moment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">Publier un moment de vie 📸</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de l'activité *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Grand parcours moteur dans la salle d'éveil"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Récit pour les parents *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Racontez comment les enfants ont participé..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section concernée</label>
                  <select
                    value={sectionId || ''}
                    onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="">Toute la crèche</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="creativite">Arts & Peinture</option>
                    <option value="motricite">Motricité & Jeux</option>
                    <option value="musique">Éveil Musical</option>
                    <option value="plein_air">Jardin & Plein air</option>
                    <option value="eveil">Contes & Doudous</option>
                    <option value="repas">Restauration & Goûter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Icône / Émoji d'illustration</label>
                <div className="flex gap-2 flex-wrap">
                  {emojiChoices.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setPhotoEmoji(em)}
                      className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition-all ${
                        photoEmoji === em ? 'bg-rose-100 ring-2 ring-rose-500 scale-110' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Éducatrice / Auteur</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
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
                  Publier sur le fil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
