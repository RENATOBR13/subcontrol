'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services';
import { Payment, Subscription, Customer, Plan } from '@/services/interface/types';
import { Plus, Loader2, DollarSign } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { toast } from 'sonner';

export default function PagamentosPage() {
  const [payments, setPayments] = useState<(Payment & { customerName?: string, planName?: string })[]>([]);
  const [subscriptions, setSubscriptions] = useState<(Subscription & { customerName?: string, planName?: string, planPrice?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubId, setFilterSubId] = useState<string>('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    subscriptionId: '',
    amount: '',
    paidAt: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [payData, subsData, custData, plansData] = await Promise.all([
        api.getPayments(),
        api.getSubscriptions(),
        api.getCustomers(),
        api.getPlans()
      ]);
      
      const enrichedSubs = subsData.map(sub => {
        const c = custData.find(c => c.id === sub.customerId);
        const p = plansData.find(p => p.id === sub.planId);
        return {
          ...sub,
          customerName: c?.name || 'Cliente removido',
          planName: p?.name || 'Plano removido',
          planPrice: p?.price || 0
        };
      });
      
      setSubscriptions(enrichedSubs);

      const enrichedPayments = payData.map(pay => {
        const sub = enrichedSubs.find(s => s.id === pay.subscriptionId);
        return {
          ...pay,
          customerName: sub?.customerName,
          planName: sub?.planName
        };
      }).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

      setPayments(enrichedPayments);
    } catch (error) {
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);

  // Update amount automatically when subscription is selected
  useEffect(() => {
    if (formData.subscriptionId) {
      const sub = subscriptions.find(s => s.id === formData.subscriptionId);
      if (sub && sub.planPrice) {
        setTimeout(() => {
          setFormData(prev => ({ ...prev, amount: sub.planPrice!.toString() }));
        }, 0);
      }
    }
  }, [formData.subscriptionId, subscriptions]);

  const handleOpenModal = () => {
    setFormData({
      subscriptionId: '',
      amount: '',
      paidAt: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subscriptionId) {
      toast.error('Selecione uma assinatura');
      return;
    }
    
    const amountNum = parseFloat(formData.amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Valor inválido');
      return;
    }

    setIsSaving(true);
    try {
      await api.createPayment({
        subscriptionId: formData.subscriptionId,
        amount: amountNum,
        paidAt: formData.paidAt,
      });
      toast.success('Pagamento registrado com sucesso!');
      toast.info('A assinatura foi renovada por mais 30 dias.');
      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
    } finally {
      setIsSaving(false);
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };
  
  const formatDate = (val: string) => {
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  const filteredPayments = useMemo(() => {
    if (!filterSubId) return payments;
    return payments.filter(p => p.subscriptionId === filterSubId);
  }, [payments, filterSubId]);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pagamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Histórico financeiro e recebimentos.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Registrar Pagamento
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Assinatura</label>
        <select
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
          value={filterSubId}
          onChange={(e) => setFilterSubId(e.target.value)}
        >
          <option value="">Todas as assinaturas</option>
          {subscriptions.map(sub => (
             <option key={sub.id} value={sub.id}>{sub.customerName} - {sub.planName}</option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Data</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cliente / Assinatura</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Valor Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-gray-500">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                      {formatDate(pay.paidAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {pay.customerName}
                      <span className="text-gray-500 font-normal ml-2">({pay.planName})</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-emerald-600">
                      {formatMoney(pay.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Pagamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-100">
             <p className="text-sm text-blue-800">
               O registro de um pagamento <strong>renova automaticamente</strong> a assinatura por mais 30 dias e a marca como ativa.
             </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assinatura</label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              value={formData.subscriptionId}
              onChange={e => setFormData({ ...formData, subscriptionId: e.target.value })}
            >
              <option value="" disabled>Selecione a assinatura...</option>
              {subscriptions.map(s => (
                <option key={s.id} value={s.id}>{s.customerName} - {s.planName} ({s.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valor Pago</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="block w-full rounded-md border border-gray-300 pl-10 py-2 pr-3 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data do Pagamento</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              value={formData.paidAt}
              onChange={e => setFormData({ ...formData, paidAt: e.target.value })}
            />
          </div>
          
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-70 flex-items-center"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
              onClick={handleCloseModal}
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
