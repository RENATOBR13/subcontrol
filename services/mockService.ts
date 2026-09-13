import { Customer, Plan, Subscription, Payment } from './interface/types';

// Utils
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => Math.random().toString(36).substring(2, 9);

// Default Seeds
const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'João Silva', email: 'joao@example.com', status: 'ativo', notes: 'Cliente VIP', createdAt: new Date().toISOString() },
  { id: 'c2', name: 'Maria Souza', email: 'maria@example.com', status: 'ativo', notes: '', createdAt: new Date().toISOString() },
  { id: 'c3', name: 'Pedro Santos', email: 'pedro@example.com', status: 'inativo', notes: 'Inadimplente', createdAt: new Date().toISOString() },
];

const SEED_PLANS: Plan[] = [
  { id: 'p1', name: 'Básico', price: 29.9, active: true, createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Pro', price: 99.9, active: true, createdAt: new Date().toISOString() },
];

const SEED_SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', customerId: 'c1', planId: 'p2', startDate: '2026-08-01', nextRenewal: '2026-09-01', status: 'ativa', createdAt: new Date().toISOString() },
  { id: 's2', customerId: 'c2', planId: 'p1', startDate: '2026-07-15', nextRenewal: '2026-08-15', status: 'vencida', createdAt: new Date().toISOString() },
  { id: 's3', customerId: 'c3', planId: 'p1', startDate: '2026-01-10', nextRenewal: '2026-02-10', status: 'cancelada', createdAt: new Date().toISOString() },
];

const SEED_PAYMENTS: Payment[] = [
  { id: 'pay1', subscriptionId: 's1', amount: 99.9, paidAt: '2026-08-01', createdAt: new Date().toISOString() },
  { id: 'pay2', subscriptionId: 's2', amount: 29.9, paidAt: '2026-07-15', createdAt: new Date().toISOString() },
];

// LocalStorage Helpers
const getStorage = <T>(key: string, seed: T): T => {
  if (typeof window === 'undefined') return seed;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

const setStorage = <T>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Data getters with automatic seed
const getCustomersData = () => getStorage<Customer[]>('subcontrol_customers', SEED_CUSTOMERS);
const getPlansData = () => getStorage<Plan[]>('subcontrol_plans', SEED_PLANS);
const getSubscriptionsData = () => getStorage<Subscription[]>('subcontrol_subscriptions', SEED_SUBSCRIPTIONS);
const getPaymentsData = () => getStorage<Payment[]>('subcontrol_payments', SEED_PAYMENTS);

// CUSTOMERS
export const getCustomers = async (): Promise<Customer[]> => {
  await delay(400);
  return getCustomersData();
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
  await delay(500);
  const customers = getCustomersData();
  const newCustomer: Customer = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  setStorage('subcontrol_customers', [...customers, newCustomer]);
  return newCustomer;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  await delay(500);
  const customers = getCustomersData();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Cliente não encontrado');
  const updated = { ...customers[index], ...data };
  customers[index] = updated;
  setStorage('subcontrol_customers', customers);
  return updated;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await delay(500);
  const customers = getCustomersData();
  setStorage('subcontrol_customers', customers.filter(c => c.id !== id));
};

// PLANS
export const getPlans = async (): Promise<Plan[]> => {
  await delay(400);
  return getPlansData();
};

export const createPlan = async (data: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> => {
  await delay(500);
  const plans = getPlansData();
  const newPlan: Plan = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  setStorage('subcontrol_plans', [...plans, newPlan]);
  return newPlan;
};

export const updatePlan = async (id: string, data: Partial<Plan>): Promise<Plan> => {
  await delay(500);
  const plans = getPlansData();
  const index = plans.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Plano não encontrado');
  const updated = { ...plans[index], ...data };
  plans[index] = updated;
  setStorage('subcontrol_plans', plans);
  return updated;
};

export const deletePlan = async (id: string): Promise<void> => {
  await delay(500);
  const plans = getPlansData();
  setStorage('subcontrol_plans', plans.filter(p => p.id !== id));
};

// SUBSCRIPTIONS
const verifySubscriptionStatuses = (subscriptions: Subscription[]): Subscription[] => {
  const today = new Date().toISOString().split('T')[0];
  let changed = false;
  const updated = subscriptions.map(sub => {
    if (sub.status !== 'cancelada' && sub.nextRenewal < today && sub.status !== 'vencida') {
      changed = true;
      return { ...sub, status: 'vencida' as const };
    }
    return sub;
  });
  if (changed) {
    setStorage('subcontrol_subscriptions', updated);
  }
  return updated;
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  await delay(400);
  const subs = getSubscriptionsData();
  return verifySubscriptionStatuses(subs);
};

export const createSubscription = async (data: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> => {
  await delay(500);
  const subs = getSubscriptionsData();
  const newSub: Subscription = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  setStorage('subcontrol_subscriptions', [...subs, newSub]);
  return newSub;
};

export const updateSubscription = async (id: string, data: Partial<Subscription>): Promise<Subscription> => {
  await delay(500);
  const subs = getSubscriptionsData();
  const index = subs.findIndex(s => s.id === id);
  if (index === -1) throw new Error('Assinatura não encontrada');
  const updated = { ...subs[index], ...data };
  subs[index] = updated;
  setStorage('subcontrol_subscriptions', subs);
  return updated;
};

export const deleteSubscription = async (id: string): Promise<void> => {
  await delay(500);
  const subs = getSubscriptionsData();
  setStorage('subcontrol_subscriptions', subs.filter(s => s.id !== id));
};

// PAYMENTS
export const getPayments = async (): Promise<Payment[]> => {
  await delay(400);
  return getPaymentsData();
};

export const listPaymentsBySubscription = async (subscriptionId: string): Promise<Payment[]> => {
  await delay(400);
  const payments = getPaymentsData();
  return payments.filter(p => p.subscriptionId === subscriptionId);
};

export const createPayment = async (data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
  await delay(600);
  const payments = getPaymentsData();
  const newPayment: Payment = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  setStorage('subcontrol_payments', [...payments, newPayment]);
  
  // Automagically update subscription
  const subs = getSubscriptionsData();
  const subIndex = subs.findIndex(s => s.id === data.subscriptionId);
  if (subIndex !== -1) {
    const sub = subs[subIndex];
    const currentRenewal = new Date(sub.nextRenewal);
    // Add 30 days
    currentRenewal.setDate(currentRenewal.getDate() + 30);
    const nextRenewalStr = currentRenewal.toISOString().split('T')[0];
    
    subs[subIndex] = { ...sub, nextRenewal: nextRenewalStr, status: 'ativa' };
    setStorage('subcontrol_subscriptions', subs);
  }

  return newPayment;
};
