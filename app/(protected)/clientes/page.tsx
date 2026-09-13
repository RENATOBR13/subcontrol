'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services';
import { Customer } from '@/services/interface/types';
import { Plus, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { toast } from 'sonner';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'ativo' as Customer['status'],
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadData();
    }, 0);
  }, []);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({ name: customer.name, email: customer.email, status: customer.status, notes: customer.notes });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', status: 'ativo', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await api.updateCustomer(editingId, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.createCustomer(formData);
        toast.success('Cliente criado com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este cliente?')) return;
    
    // In a real app, check for subscriptions before deleting, or soft-delete
    try {
      await api.deleteCustomer(id);
      toast.success('Cliente removido!');
      loadData();
    } catch (error) {
      toast.error('Erro ao remover cliente');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie sua base de clientes.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">E-mail</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {customer.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        customer.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(customer)} className="text-blue-600 hover:text-blue-900">
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Editar {customer.name}</span>
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Remover {customer.name}</span>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as 'ativo'|'inativo' })}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
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
