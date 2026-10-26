import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ChildrenView } from './components/ChildrenView';
import { AttendanceView } from './components/AttendanceView';
import { DailyLogView } from './components/DailyLogView';
import { StaffView } from './components/StaffView';
import { BillingView } from './components/BillingView';
import { NewChildModal } from './components/NewChildModal';
import { ChildDetailModal } from './components/ChildDetailModal';
import { DailyLogModal } from './components/DailyLogModal';
import { fetchSections, fetchChildren } from './api';
import { Section, Child } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sections, setSections] = useState<Section[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  // Modals state
  const [isNewChildOpen, setIsNewChildOpen] = useState<boolean>(false);
  const [detailChildId, setDetailChildId] = useState<number | null>(null);
  const [transmissionChildId, setTransmissionChildId] = useState<number | null>(null);
  const [isTransmissionOpen, setIsTransmissionOpen] = useState<boolean>(false);

  const loadBaseData = async () => {
    try {
      const [sectionsData, childrenData] = await Promise.all([
        fetchSections(),
        fetchChildren()
      ]);
      setSections(sectionsData);
      setChildren(childrenData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleOpenTransmission = (childId: number) => {
    setTransmissionChildId(childId);
    setIsTransmissionOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewChildModal={() => setIsNewChildOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'children' && (
          <ChildrenView
            onOpenNewChildModal={() => setIsNewChildOpen(true)}
            onSelectChild={(id) => setDetailChildId(id)}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView onOpenTransmission={handleOpenTransmission} />
        )}

        {activeTab === 'logs' && (
          <DailyLogView onOpenTransmissionModal={handleOpenTransmission} />
        )}

        {activeTab === 'staff' && (
          <StaffView sections={sections} />
        )}

        {activeTab === 'billing' && (
          <BillingView childrenList={children} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span>🧸 P'tits Pas</span>
            <span className="text-slate-400 font-normal">&bull; Logiciel de gestion professionnelle de crèche et micro-crèche</span>
          </div>
          <div className="text-slate-400">
            Conforme aux normes PMI, Décret Petite Enfance & Règlements CAF
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewChildModal
        sections={sections}
        isOpen={isNewChildOpen}
        onClose={() => setIsNewChildOpen(false)}
        onSuccess={() => loadBaseData()}
      />

      <ChildDetailModal
        childId={detailChildId}
        onClose={() => setDetailChildId(null)}
        onOpenTransmission={handleOpenTransmission}
      />

      <DailyLogModal
        childId={transmissionChildId}
        children={children}
        isOpen={isTransmissionOpen}
        onClose={() => {
          setIsTransmissionOpen(false);
          setTransmissionChildId(null);
        }}
        onSuccess={() => loadBaseData()}
      />
    </div>
  );
};

export default App;
