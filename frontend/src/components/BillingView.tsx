import React, { useState, useEffect } from 'react';
import { 
  ReceiptEuro, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Printer, 
  User, 
  ArrowUpRight,
  Sparkles,
  Download
} from 'lucide-react';
import { fetchInvoices, generateInvoice, updateInvoiceStatus, fetchChildren } from '../api';
import { Invoice, Child } from '../types';

interface BillingViewProps {
  childrenList: Child[];
}

export const BillingView: React.FC<BillingViewProps> = ({ childrenList }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Generate Modal state
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [selectedChildId, setSelectedChildId] = useState<number>(childrenList[0]?.id || 1);
  const [actualHours, setActualHours] = useState<number>(160);
  const [mealCount, setMealCount] = useState<number>(20);

  // Detail Modal
  const [activeInvoiceDetail, setActiveInvoiceDetail] = useState<Invoice | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices(
        selectedMonth || undefined, 
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, statusFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateInvoice(selectedChildId, selectedMonth, actualHours, mealCount);
      setIsGenerateOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (invoice: Invoice) => {
    const nextStatus = invoice.status === 'paid' ? 'pending' : 'paid';
    try {
      await updateInvoiceStatus(invoice.id, nextStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total_due, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.total_due, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((sum, inv) => sum + inv.total_due, 0);

  return (
    <div className="space-y-6">
      {/* Financial KPI bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Facturé ({selectedMonth})</span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalBilled.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-slate-500 mt-1">{invoices.length} factures générées</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Réglé</span>
          <p className="text-2xl font-black text-emerald-900 mt-2">
            {totalPaid.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-emerald-700 mt-1">Paiements encaissés</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">En Attente de Règlement</span>
          <p className="text-2xl font-black text-amber-900 mt-2">
            {totalPending.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {invoices.filter((i) => i.status === 'pending').length} factures à percevoir
          </p>
        </div>
      </div>

      {/* Control Bar: Month, Filter, Generate CTA */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="2026-10">Octobre 2026</option>
              <option value="2026-09">Septembre 2026</option>
              <option value="2026-08">Août 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'pending' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Payées
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Générer une facture</span>
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <ReceiptEuro className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Aucune facture pour cette sélection</h3>
          <p className="text-xs text-slate-500 mt-1">Cliquez sur « Générer une facture » pour commencer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">N° Facture</th>
                  <th className="py-3.5 px-4">Enfant & Famille</th>
                  <th className="py-3.5 px-4">Volume Horaire</th>
                  <th className="py-3.5 px-4">Dépassements</th>
                  <th className="py-3.5 px-4">Repas</th>
                  <th className="py-3.5 px-4">Montant TTC</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map((inv) => {
                  const isPaid = inv.status === 'paid';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{inv.avatar_emoji || '👶'}</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{inv.first_name} {inv.last_name}</span>
                            <span className="text-[11px] text-slate-500">{inv.section_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{inv.actual_hours}h</span>
                        <span className="text-slate-400 text-[11px] block">base contrat : {inv.contract_hours}h</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.overtime_hours > 0 ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            +{inv.overtime_hours}h ({inv.total_overtime_amount} €)
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {inv.meal_count} repas ({inv.total_meals_amount} €)
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        {inv.total_due.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isPaid ? 'Payée' : 'En attente'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(inv)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isPaid 
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isPaid ? 'Marquer Impayée' : 'Valider Paiement'}
                          </button>
                          <button
                            onClick={() => setActiveInvoiceDetail(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Voir le bordereau de facture"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Generate Invoice */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Générer une facture mensuelle</h3>
            <p className="text-xs text-slate-500 mb-4">Calcul automatique sur la base du contrat, dépassements et repas.</p>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enfant</label>
                <select
                  value={selectedChildId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedChildId(id);
                    const ch = childrenList.find((c) => c.id === id);
                    if (ch) {
                      setActualHours(Math.round(ch.contract_hours_per_week * 4.2));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.contract_hours_per_week}h/sem - {c.hourly_rate} €/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mois de facturation</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-semibold"
                >
                  <option value="2026-10">Octobre 2026</option>
                  <option value="2026-09">Septembre 2026</option>
                  <option value="2026-11">Novembre 2026</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heures totales réelles</label>
                  <input
                    type="number"
                    value={actualHours}
                    onChange={(e) => setActualHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de repas</label>
                  <input
                    type="number"
                    value={mealCount}
                    onChange={(e) => setMealCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                <p>• Dépassement horaire majoré à +25% au-delà des heures du contrat.</p>
                <p>• Repas facturés à 4,50 € l'unité.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors"
                >
                  Émettre la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail / Print Preview Modal */}
      {activeInvoiceDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧸</span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Crèche Les P'tits Pas</h3>
                  <p className="text-[11px] text-slate-500">14 Rue des Enfants, 75011 Paris &bull; SIRET 123 456 789</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                activeInvoiceDetail.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeInvoiceDetail.status === 'paid' ? 'ACQUITTÉE' : 'EN ATTENTE'}
              </span>
            </div>

            {/* Facture Info */}
            <div className="py-4 border-b border-slate-100 text-xs flex justify-between">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Facturé à</p>
                <p className="font-bold text-slate-900 mt-0.5">Parents de {activeInvoiceDetail.first_name} {activeInvoiceDetail.last_name}</p>
                <p className="text-slate-500">{activeInvoiceDetail.section_name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-slate-800">{activeInvoiceDetail.invoice_number}</p>
                <p className="text-slate-500 mt-0.5">Émise le : {activeInvoiceDetail.issued_at}</p>
                <p className="text-slate-500">Période : {activeInvoiceDetail.month}</p>
              </div>
            </div>

            {/* Lines */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Forfait accueil ({activeInvoiceDetail.contract_hours}h à {activeInvoiceDetail.hourly_rate} €/h)</span>
                <span className="font-bold">{activeInvoiceDetail.total_contract_amount.toFixed(2)} €</span>
              </div>

              {activeInvoiceDetail.overtime_hours > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Heures supplémentaires ({activeInvoiceDetail.overtime_hours}h majorées)</span>
                  <span className="font-bold">+{activeInvoiceDetail.total_overtime_amount.toFixed(2)} €</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700">
                <span>Restauration & Goûters ({activeInvoiceDetail.meal_count} repas à {activeInvoiceDetail.meal_unit_price} €)</span>
                <span className="font-bold">{activeInvoiceDetail.total_meals_amount.toFixed(2)} €</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Net à Payer</span>
                <span className="text-rose-600">{activeInvoiceDetail.total_due.toFixed(2)} €</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => setActiveInvoiceDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
