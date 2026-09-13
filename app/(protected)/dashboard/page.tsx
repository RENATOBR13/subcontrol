'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services';
import { Customer, Plan, Subscription } from '@/services/interface/types';
import { Users, CreditCard, AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    mrr: 0,
  });
  
  const [expiringSubs, setExpiringSubs] = useState<(Subscription & { customerName?: string, planName?: string })[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [customers, plans, subscriptions] = await Promise.all([
          api.getCustomers(),
          api.getPlans(),
          api.getSubscriptions()
        ]);

        const activeSubs = subscriptions.filter(s => s.status === 'ativa');
        const expiredSubs = subscriptions.filter(s => s.status === 'vencida');
        
        // Calculate MRR
        const mrr = activeSubs.reduce((acc, sub) => {
          const plan = plans.find(p => p.id === sub.planId);
          return acc + (plan?.price || 0);
        }, 0);

        setMetrics({
          totalCustomers: customers.length,
          activeSubscriptions: activeSubs.length,
          expiredSubscriptions: expiredSubs.length,
          mrr,
        });

        // Vencendo hoje ou já vencidas
        const todayStr = new Date().toISOString().split('T')[0];
        
        const expiring = subscriptions
          .filter(s => s.status === 'vencida' || s.nextRenewal === todayStr)
          .map(s => ({
            ...s,
            customerName: customers.find(c => c.id === s.customerId)?.name || 'Desconhecido',
            planName: plans.find(p => p.id === s.planId)?.name || 'Plano removido'
          }))
          .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime())
          .slice(0, 5); // top 5

        setExpiringSubs(expiring);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };
  
  const formatDate = (val: string) => {
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  const statCards = [
    { name: 'Total de Clientes', value: metrics.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Assinaturas Ativas', value: metrics.activeSubscriptions, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Assinaturas Vencidas', value: metrics.expiredSubscriptions, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Receita Mensal (MRR)', value: formatMoney(metrics.mrr), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bg}`}>
                     <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-900">Atenção: Assinaturas Vencidas / Vencendo Hoje</h3>
          <Link href="/assinaturas" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Ver todas
          </Link>
        </div>
        {expiringSubs.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Nenhuma assinatura pendente no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiringSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.planName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sub.nextRenewal)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        sub.status === 'vencida' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
