'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services';
import { Subscription, Customer, Plan } from '@/services/interface/types';
import { Plus, Edit2, Trash2, Loader2, PlayCircle, Ban } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { toast } from 'sonner';

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { customerName?: string, planName?: string })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    nextRenewal: '',
    status: 'ativa' as Subscription['status'],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsData, custData, plansData] = await Promise.all([
        api.getSubscriptions(),
        api.getCustomers(),
        api.getPlans()
      ]);
      
      setCustomers(custData);
      setPlans(plansData);

      const enriched = subsData.map(sub => ({
        ...sub,
        customerName: custData.find(c => c.id === sub.customerId)?.name || 'Cliente removido',
        planName: plansData.find(p => p.id === sub.planId)?.name || 'Plano removido'
      }));

      // Sort by status and nextRenewal
      enriched.sort((a, b) => {
        if (a.status === 'vencida' && b.status !== 'vencida') return -1;
        if (a.status !== 'vencida' && b.status === 'vencida') return 1;
        return new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime();
      });

      setSubscriptions(enriched);
    } catch (error) {
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);

  const handleOpenModal = (sub?: Subscription) => {
    if (sub) {
      setEditingId(sub.id);
      setFormData({
        customerId: sub.customerId,
        planId: sub.planId,
        startDate: sub.startDate,
        nextRenewal: sub.nextRenewal,
        status: sub.status,
      });
    } else {
      setEditingId(null);
      const start = new Date();
      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      
      setFormData({ 
        customerId: customers[0]?.id || '', 
        planId: plans[0]?.id || '', 
        startDate: start.toISOString().split('T')[0], 
        nextRenewal: next.toISOString().split('T')[0], 
        status: 'ativa' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.planId) {
      toast.error('Selecione cliente e plano');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await api.updateSubscription(editingId, formData);
        toast.success('Assinatura atualizada com sucesso!');
      } else {
        await api.createSubscription(formData);
        toast.success('Assinatura criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar assinatura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta assinatura? O histórico de pagamentos poderá ser afetado.')) return;
    try {
      await api.deleteSubscription(id);
      toast.success('Assinatura removida!');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover assinatura');
    }
  };
  
  const handleCancelSubscription = async (id: string) => {
    if (!confirm('Deseja cancelar esta assinatura?')) return;
    try {
      await api.updateSubscription(id, { status: 'cancelada' });
      toast.success('Assinatura cancelada!');
      loadData();
    } catch (error) {
      toast.error('Erro ao cancelar assinatura');
    }
  };

  const formatDate = (val: string) => {
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assinaturas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os vínculos de clientes aos planos.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Assinatura
          </button>
        </div>
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
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Cliente</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Plano</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Próxima Renovação</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {sub.customerName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{sub.planName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(sub.nextRenewal)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        sub.status === 'vencida' ? 'bg-red-100 text-red-800' :
                        sub.status === 'cancelada' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-3 items-center">
                        {sub.status !== 'cancelada' && (
                           <button onClick={() => handleCancelSubscription(sub.id)} className="text-gray-400 hover:text-gray-900" title="Cancelar Assinatura">
                             <Ban className="w-4 h-4" />
                           </button>
                        )}
                        <button onClick={() => handleOpenModal(sub)} className="text-blue-600 hover:text-blue-900" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-900" title="Remover">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Editar Assinatura' : 'Nova Assinatura'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.customerId}
              onChange={e => setFormData({ ...formData, customerId: e.target.value })}
            >
              <option value="" disabled>Selecione um cliente...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Plano</label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.planId}
              onChange={e => setFormData({ ...formData, planId: e.target.value })}
            >
              <option value="" disabled>Selecione um plano...</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Próxima Renovação</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.nextRenewal}
              onChange={e => setFormData({ ...formData, nextRenewal: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as Subscription['status'] })}
            >
              <option value="ativa">Ativa</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-70 flex-items-center"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
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
