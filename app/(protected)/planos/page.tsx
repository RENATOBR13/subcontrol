'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services';
import { Plan } from '@/services/interface/types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { toast } from 'sonner';

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getPlans();
      setPlans(data);
    } catch (error) {
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingId(plan.id);
      setFormData({ name: plan.name, price: plan.price.toString(), active: plan.active });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(priceNum)) {
      toast.error('Preço inválido');
      return;
    }

    setIsSaving(true);
    const dataToSave = {
      name: formData.name,
      price: priceNum,
      active: formData.active
    };

    try {
      if (editingId) {
        await api.updatePlan(editingId, dataToSave);
        toast.success('Plano atualizado com sucesso!');
      } else {
        await api.createPlan(dataToSave);
        toast.success('Plano criado com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar plano';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este plano?')) return;
    
    try {
      await api.deletePlan(id);
      toast.success('Plano removido!');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover plano');
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Planos</h1>
          <p className="text-sm text-gray-500 mt-1">Configure os planos oferecidos.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nome</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Preço (Mensal)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                    Nenhum plano cadastrado.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {plan.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatMoney(plan.price)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(plan)} className="text-blue-600 hover:text-blue-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-900">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Plano</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preço (Mensal)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                className="block w-full rounded-md border border-gray-300 pl-10 py-2 pr-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              id="active"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Plano Ativo
            </label>
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
