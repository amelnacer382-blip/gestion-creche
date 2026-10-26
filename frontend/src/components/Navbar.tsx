import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ReceiptEuro,
  UserPlus,
  Sparkles,
  Calendar,
  Activity
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewChildModal: () => void;
  presentCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenNewChildModal,
  presentCount = 0
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'attendance', label: 'Pointage & Présences', icon: Clock, badge: presentCount > 0 ? `${presentCount}` : undefined },
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo & Crèche branding */}
          <div className="flex items-center space-x-3.5 cursor-pointer select-none" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-400 flex items-center justify-center text-2xl shadow-sm text-white font-bold ring-2 ring-rose-200/50">
              🧸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">P'tits Pas</span>
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Pro
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En direct
                </span>
              </div>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{todayStr}</span>
                {time && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono font-semibold text-slate-700">{time}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewChildModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscrire un enfant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 shadow-xs ring-1 ring-rose-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
