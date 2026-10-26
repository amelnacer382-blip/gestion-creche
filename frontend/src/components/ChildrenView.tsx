import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  HeartHandshake, 
  FileText,
  Calendar,
  Baby,
  Eye,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { fetchChildren, fetchSections } from '../api';
import { Child, Section } from '../types';

interface ChildrenViewProps {
  onOpenNewChildModal: () => void;
  onSelectChild: (childId: number) => void;
}

export const ChildrenView: React.FC<ChildrenViewProps> = ({ 
  onOpenNewChildModal, 
  onSelectChild 
}) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [childrenData, sectionsData] = await Promise.all([
        fetchChildren(selectedSection, searchQuery),
        fetchSections()
      ]);
      setChildren(childrenData);
      setSections(sectionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSection, searchQuery]);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 12) {
      return `${diffMonths} mois`;
    }
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    return remainingMonths > 0 ? `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois` : `${years} an${years > 1 ? 's' : ''}`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Présent
          </span>
        );
      case 'departed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" /> Parti
          </span>
        );
      case 'absent_justified':
      case 'absent_unjustified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <XCircle className="w-3 h-3" /> Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
            <Clock className="w-3 h-3" /> Attendu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par prénom ou nom d'enfant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Section filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedSection(undefined)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === undefined
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes les sections ({children.length})
            </button>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSection === sec.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenNewChildModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire un enfant</span>
        </button>
      </div>

      {/* Children Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : children.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <Baby className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucun enfant trouvé</h3>
          <p className="text-xs text-slate-500 mt-1">Essayez un autre filtre ou inscrivez un nouvel enfant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => {
            const hasAllergy = child.allergies && child.allergies !== 'Aucune' && child.allergies !== '';
            const primaryGuardian = child.guardians?.[0];

            return (
              <div 
                key={child.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl shadow-xs">
                        {child.avatar_emoji || '👶'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{calculateAge(child.birth_date)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-slate-600">{child.section_name}</span>
                        </p>
                      </div>
                    </div>

                    {getStatusBadge(child.today_status)}
                  </div>

                  {/* Dietary & Medical Highlights */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    {hasAllergy ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200/80 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Allergie : {child.allergies}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Régime : <strong>{child.diet}</strong></span>
                        <span>Contrat : <strong>{child.contract_hours_per_week}h/sem</strong></span>
                      </div>
                    )}

                    {/* Primary Guardian Contact */}
                    {primaryGuardian && (
                      <div className="bg-slate-50 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-600">
                        <div className="truncate">
                          <span className="font-bold text-slate-800">{primaryGuardian.first_name} {primaryGuardian.last_name}</span>
                          <span className="text-slate-400 text-[11px] ml-1">({primaryGuardian.relation})</span>
                        </div>
                        <a 
                          href={`tel:${primaryGuardian.phone}`} 
                          className="p-1.5 rounded-xl bg-white text-slate-700 hover:text-rose-600 border border-slate-200 shadow-2xs transition-colors shrink-0"
                          title="Appeler"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Tarif : {child.hourly_rate} €/h
                  </span>
                  <button
                    onClick={() => onSelectChild(child.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier complet</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
