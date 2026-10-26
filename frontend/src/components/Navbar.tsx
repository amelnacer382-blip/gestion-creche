import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ReceiptEuro,
  UserPlus,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewChildModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewChildModal }) => {
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'attendance', label: 'Pointage & Présences', icon: Clock },
    { id: 'children', label: 'Enfants & Familles', icon: Users },
    { id: 'logs', label: 'Cahier de transmission', icon: BookOpen },
    { id: 'staff', label: 'Personnel & Ratios', icon: ShieldCheck },
    { id: 'billing', label: 'Facturation & Contrats', icon: ReceiptEuro },
  ];

  const todayStr = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Crèche branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-xl shadow-sm text-white font-bold">
              🧸
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-800 tracking-tight">P'tits Pas</span>
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Crèche Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 capitalize">{todayStr}</p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewChildModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscrire un enfant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 shadow-xs ring-1 ring-rose-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
