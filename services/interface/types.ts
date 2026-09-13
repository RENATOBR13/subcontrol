export type CustomerStatus = 'ativo' | 'inativo';

export interface Customer {
  id: string;
  name: string;
  email: string;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
}

export type SubscriptionStatus = 'ativa' | 'vencida' | 'cancelada';

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  startDate: string;
  nextRenewal: string;
  status: SubscriptionStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  paidAt: string;
  createdAt: string;
}
